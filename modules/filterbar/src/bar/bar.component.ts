import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ValueListItem} from '../value-list/value-list.component';
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

  @Output()
  onChange: EventEmitter<string> = new EventEmitter();

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
   * @param {ValueListItem} config
   */
  preSelect(config: ValueListItem) {
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
    return (filters: Selectable[], query: string, page: number, pagesize: number): Observable<ValueListItem[]> => {
      return Observable.of(
        this.configs
          .map((c, i): ValueListItem => {
            return {value: String(i), label: c.label, helpText: c.helpText};
          })
          .filter((v) => {
            return v.label.indexOf(query) > -1;
          })
      );
    };
  }

  reset() {
    this.selected = [];
    this.clearInput();
    this.toIdle();
  }
}

/**
 * The value emitted by the component
 */
export interface Filter {
  field: string;
  comparison: string;
  value: string[];
}

enum State {
  IDLE = 'idle',
  SELECTING = 'selecting',
  IN_SELECTABLE = 'in-selectable',
}

export type ValueSource = (filters: Selectable[], query: string, page: number, pagesize: number) => Observable<ValueListItem[]>;

export type SelectableConfig = FreetextConfig | SelectConfig;

export enum SelectableKind {
  FREETEXT = 'freetext',
  SELECT = 'select',
  AUTOCOMPLETE = 'autocomplete',
}

interface AbstractConfig {
  field: string;
  label: string;
  validComparisons?: ValueListItem[];
  helpText?: string;
  icon?: string;
  valueSource?: ValueSource;
  valueSourcePaging?: boolean;
  initialValue?: string[];
  allowFreeInput?: boolean;
  multiSelect?: boolean;
  allowEmptyValue?: boolean;
}

export interface FreetextConfig extends AbstractConfig {
  kind: SelectableKind.FREETEXT;
}

export interface SelectConfig extends AbstractConfig {
  kind: SelectableKind.SELECT;
}

export type Selectable = FreetextSelectable;

function SelectableFactory(parent: BarComponent, conf: SelectableConfig): Selectable {
  switch (conf.kind) {
    case SelectableKind.FREETEXT:
      return new FreetextSelectable(parent, conf);
  }
}

abstract class AbstractSelectable {
  public value: string[] = [];
  public comparison = '';
  public validComparisons: ValueListItem[] = [];

  constructor(public parent: BarComponent, public conf: SelectableConfig) {
    this.value = conf.initialValue || [];
    this.validComparisons = conf.validComparisons || [{label: '=', value: '='}];

    // if only 1 comparison is available just select it automatically.
    if (this.validComparisons.length === 1) {
      this.comparison = this.validComparisons[0].value;
    }
  }

  abstract displayValue(): string;

  selectValue(value: ValueListItem) {
    if (!this.conf.allowEmptyValue && value.value === '') {
      return;
    }
    this.value.push(value.value);
    this.parent.clearInput();
    this.parent.focus();
    if (!this.conf.multiSelect) {
      this.parent.selectPending();
    }
  }

  selectComparison(comp: ValueListItem) {
    this.comparison = comp.value;
    this.parent.clearInput();
    this.parent.focus();
  }

  comparisonsToValueSource(): ValueSource {
    return (filters: Selectable[], query: string, page: number, pagesize: number): Observable<ValueListItem[]> => {
      return Observable.of(this.validComparisons.filter((v) => (v.label || v.value).indexOf(query) > -1));
    };
  }

  toFilter(): Filter {
    return {field: this.conf.field, comparison: this.comparison, value: this.value}
  }
}

class FreetextSelectable extends AbstractSelectable {
  displayValue(): string {
    return this.value.join(', ');
  }
}

