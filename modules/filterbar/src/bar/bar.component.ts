import {Component, ElementRef, EventEmitter, Input, ViewChild} from '@angular/core';
import {Value} from '../value-list/value-list.component';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'ng-filterbar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss'],
  host: {
    '(document:click)': 'onBlur($event)',
  },
})
export class BarComponent {

  @ViewChild('primaryInput')
  primaryInput: ElementRef;

  @Input()
  set config(config: SelectableConfig[]) {
    this.configs = config;
  }

  get config(): SelectableConfig[] {
    return this.configs;
  }

  public keyboardEvents: EventEmitter<string> = new EventEmitter();

  /**
   * Raw configs as passed in by parent.
   * @type {SelectableConfig[]}
   */
  private configs: SelectableConfig[] = [];

  /**
   * before being added to selected values the selectable is in an incomplete pending state.
   */
  public pending: Selectable;

  public selected: Selectable[] = [];

  public state: State = State.IDLE;

  public states = State;

  public kinds = SelectableKind;

  constructor(private _eref: ElementRef) {
  }

  focus() {
    this.primaryInput.nativeElement.focus();
  }

  onFocus() {
    this.state = (this.pending) ? State.IN_SELECTABLE : State.SELECTING;
  }

  onBlur(event: any) {
    // if (!this._eref.nativeElement.contains(event.target)) {
    //   this.state = State.IDLE;
    // }
  }

  onKeypress(event: string) {

    // do top level actions
    switch (event) {
      case 'Escape':
        if (this.state === State.SELECTING) {
          this.toIdle();
        } else {
          this.toSelecting();
        }
        break;
      default:
        // if the control is idle but a key is pressed re-activate it
        if (this.state === State.IDLE) {
          this.onFocus();
        }
    }

    // forward event to any other components e.g. value-list
    this.keyboardEvents.next(event);
  }

  toSelecting() {
    this.pending = null;
    this.state = State.SELECTING;
    this.clearInput();
  }

  toIdle() {
    this.toSelecting();
    this.state = State.IDLE;
  }

  /**
   * Put selected into pending state where more values are required.
   *
   * @param {Value} config
   */
  preSelect(config: Value) {
    this.state = State.IN_SELECTABLE;
    this.pending = SelectableFactory(this, this.configs[config.value]);
    this.focus();
    this.clearInput();
  }

  /**
   * Move pending item to selected items.
   */
  selectPending() {
    this.selected.push(this.pending);
    this.toSelecting();
    this.clearInput();
  }

  removeSelected(index: number) {
    this.selected.splice(index, 1);
  }

  clearInput() {
    this.primaryInput.nativeElement.value = '';
  }

  configsToValueSource(): ValueSource  {
    return (filters: Selectable[], query: string, page: number, pagesize: number): Observable<Value[]> => {
      return Observable.of(
        this.configs
          .map((c, i): Value => {
            return {value: String(i), label: c.label, helpText: c.helpText};
          })
          .filter((v) => {
            return v.label.indexOf(query) > -1;
          })
      );
    };
  }
}

enum State {
  IDLE = 'idle',
  SELECTING = 'selecting',
  IN_SELECTABLE = 'in-selectable',
}

export type ValueSource = (filters: Selectable[], query: string, page: number, pagesize: number) => Observable<Value[]>;

export type SelectableConfig = FreetextConfig | SelectConfig;

export enum SelectableKind {
  FREETEXT = 'freetext',
  SELECT = 'select',
  AUTOCOMPLETE = 'autocomplete',
}

interface AbstractConfig<T> {
  field: string;
  label: string;
  validComparisons?: Value[];
  helpText?: string;
  icon?: string;
  valueSource?: ValueSource;
  valueSourcePaging?: boolean;
  initialValue?: T;
  allowFreeInput?: boolean;
}

export interface FreetextConfig extends AbstractConfig<Value> {
  kind: SelectableKind.FREETEXT;
}

export interface SelectConfig extends AbstractConfig<Value[]> {
  kind: SelectableKind.SELECT;
}

export type Selectable = FreetextSelectable;


abstract class AbstractSelectable<T> {
  public value: T;
  public comparison = '';
  public validComparisons: Value[] = [];

  constructor(public parent: BarComponent) {
  }

  abstract displayValue(): string;

  selectValue(value: T) {
    this.value = value;
    this.parent.clearInput();
    this.parent.focus();
    this.parent.selectPending();
  }

  selectComparison(comp: Value) {
    this.comparison = comp.value;
    this.parent.clearInput();
    this.parent.focus();
  }

  comparisonsToValueSource(): ValueSource {
    return (filters: Selectable[], query: string, page: number, pagesize: number): Observable<Value[]> => {
      return Observable.of(this.validComparisons.filter((v) => (v.label || v.value).indexOf(query) > -1));
    };
  }
}

class FreetextSelectable extends AbstractSelectable<Value> {

  constructor(parent: BarComponent, public conf: FreetextConfig) {
    super(parent);
    this.value = conf.initialValue || null;
    this.validComparisons = conf.validComparisons || [{label: '=', value: '='}];

    // if only 1 comparison is available just select it automatically.
    if (this.validComparisons.length === 1) {
      this.comparison = this.validComparisons[0].value;
    }
  }

  displayValue(): string {
    return this.value.label || this.value.value;
  }
}

function SelectableFactory(parent: BarComponent, conf: SelectableConfig): Selectable {
  switch (conf.kind) {
    case SelectableKind.FREETEXT:
      return new FreetextSelectable(parent, conf);
  }
}
