import {Component, ElementRef, Input, ViewChild} from '@angular/core';

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
    this.selectables = [];
    this.configs.forEach((c) => {
      this.selectables.push(SelectableFactory(c));
    });
  }

  get config(): SelectableConfig[] {
    return this.configs;
  }

  /**
   * Raw configs as passed in by parent.
   * @type {SelectableConfig[]}
   */
  private configs: SelectableConfig[] = [];

  /**
   * Concrete inputs based on configs.
   * @type {Selectable[]}
   */
  public selectables: Selectable[] = [];

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

  onFocus(event: any) {
    this.state = (this.pending) ? State.IN_SELECTABLE : State.SELECTING;
  }

  onBlur(event: any) {
    if (!this._eref.nativeElement.contains(event.target)) {
      this.state = State.IDLE;
    }
  }

  onKeypress(event: string) {
    console.log(event);
    switch (event) {
      case 'Escape':
        this.toSelecting();
        break;
      default:
        if (this.pending) {
          if (this.pending.onKeypress(event, this.primaryInput.nativeElement)) {
            this.selectPending();
          }
        } else {
          //todo: manipulate selectable list
        }
    }
  }

  toSelecting() {
    this.pending = null;
    this.state = State.SELECTING;
    this.primaryInput.nativeElement.value = '';
  }

  selectPending() {
    this.selected.push(this.pending);
    this.toSelecting();
  }

  preSelect(conf: SelectableConfig) {
    this.state = State.IN_SELECTABLE;
    this.pending = SelectableFactory(conf);
    this.primaryInput.nativeElement.focus();
  }

  removeSelected(index: number) {
    this.selected.splice(index, 1);
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
  helpText: string;
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

interface Selected {
  displayValue(): string;

  onKeypress(event: string, inputValue: string): void
}

class FreetextSelectable implements Selected {

  public conf: FreetextConfig;
  public value = '';
  public comparison: '=' = '=';

  constructor(conf: FreetextConfig) {
    this.conf = conf;
    this.value = conf.initialValue || '';
  }

  displayValue(): string {
    return this.value;
  }

  onKeypress(event: string, input: any): boolean {
    switch (event) {
      case 'Enter':
        this.value = input.value;
        return true; // done
    }
  }
}

function SelectableFactory(conf: SelectableConfig): Selectable {
  switch (conf.kind) {
    case SelectableKind.FREETEXT:
      return new FreetextSelectable(conf);
  }
}
