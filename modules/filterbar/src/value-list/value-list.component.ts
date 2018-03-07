import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-value-list',
  templateUrl: './value-list.component.html',
  styleUrls: ['./value-list.component.scss'],
})
export class ValueListComponent implements OnInit {

  @Input()
  values: Value[] = [];

  @Input()
  keyboardEvents: EventEmitter<string>;

  @Input()
  filter: string;

  @Output()
  valueSelected: EventEmitter<Value> = new EventEmitter();

  selectedValue = 0;

  constructor() {
  }

  ngOnInit() {
    this.keyboardEvents.subscribe(key => this.onKeypress(key));
  }

  select(value: Value) {
    this.valueSelected.next(value);
  }

  onKeypress(key: string) {
    switch (key) {
      case 'ArrowDown':
        this.selectedValue = (this.selectedValue >= this.values.length - 1) ? 0 : this.selectedValue + 1;
        break;
      case 'ArrowUp':
        this.selectedValue = this.selectedValue === 0 ? this.values.length - 1 : this.selectedValue - 1;
        break;
      case 'Enter':
        this.select(this.filteredValues()[this.selectedValue]);
        break;
    }
  }

  filteredValues(): Value[] {
    const filtered = (this.values || []).filter((v) => {
      return (v.label || v.value).indexOf(this.filter) > -1;
    });
    if (this.selectedValue > filtered.length) {
      this.selectedValue = 0;
    }
    return filtered;
  }
}

export interface Value {
  value: string;
  label?: string;
  helpText?: string;
}
