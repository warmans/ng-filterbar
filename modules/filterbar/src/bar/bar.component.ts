import {Component, ElementRef, EventEmitter, Input, ViewChild} from '@angular/core';
import {Value} from '../value-list/value-list.component';

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
        if (this.pending) {
          if (this.pending.onKeypress(event, this.primaryInput.nativeElement)) {
            this.selectPending();
          }
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
   * @param {SelectableConfig} conf
   */
  preSelect(conf: SelectableConfig) {
    this.state = State.IN_SELECTABLE;
    this.pending = SelectableFactory(this, conf);
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
    console.log('clear');
    this.primaryInput.nativeElement.value = '';
  }
}

enum State {
  IDLE = 'idle',
  SELECTING = 'selecting',
  IN_SELECTABLE = 'in-selectable',
}

export type SelectableConfig = FreetextConfig | SelectConfig;

export enum SelectableKind {
  FREETEXT = 'freetext',
  SELECT = 'select',
  AUTOCOMPLETE = 'autocomplete',
}

interface AbstractConfig {
  field: string;
  label: string;
  validComparisons?: Value[];
  helpText?: string;
  icon?: string;
}

export interface FreetextConfig extends AbstractConfig {
  kind: SelectableKind.FREETEXT;
  initialValue?: string;
}

export interface SelectConfig extends AbstractConfig {
  kind: SelectableKind.SELECT;
  multiselect: boolean;
  initialValue: string[];
}

export type Selectable = FreetextSelectable;


abstract class AbstractSelectable<T> {
  public value: T;
  public comparison = '';
  public validComparisons: Value[] = [];

  constructor(public parent: BarComponent) {
  }

  abstract displayValue(): string;
  abstract onKeypress(event: string, inputValue: string): void;

  selectValue(value: T) {
    this.value = value;
    this.parent.clearInput();
    this.parent.focus();
  }

  selectComparison(comp: Value) {
    this.comparison = comp.value;
    this.parent.clearInput();
    this.parent.focus();
  }
}

class FreetextSelectable extends AbstractSelectable<string> {

  constructor(parent: BarComponent, public conf: FreetextConfig) {
    super(parent);
    this.value = conf.initialValue || '';
    this.validComparisons = conf.validComparisons || [{label: '=', value: '='}];
  }

  displayValue(): string {
    return this.value;
  }

  onKeypress(event: string, input: any): boolean {
    switch (event) {
      case 'Enter':
        this.selectValue(input.value);
        return (this.comparison !== '' && this.value !== '');
      default:
        if (this.comparison === '') {
          if (this.validComparisons.filter(v => v.value === input.value).length === 0) {
            input.value = '';
          }
        }
    }
  }
}

function SelectableFactory(parent: BarComponent, conf: SelectableConfig): Selectable {
  switch (conf.kind) {
    case SelectableKind.FREETEXT:
      return new FreetextSelectable(parent, conf);
  }
}
