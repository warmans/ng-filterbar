import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Selectable, ValueSource} from '../bar/bar.component';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'app-value-list',
  templateUrl: './value-list.component.html',
  styleUrls: ['./value-list.component.scss'],
})
export class ValueListComponent implements OnInit {

  @Input()
  valueSource: ValueSource;

  @Input()
  valueSourceFilters: Selectable[];

  @Input()
  valueSourcePaging: boolean;

  @Input()
  keyboardEvents: EventEmitter<string>;

  @Input()
  allowFreeInput: boolean;

  @Input()
  set filter(f: string) {
    this._filter = f;
    this.page = 0;
    this.filterChange.next(f);
  }
  get filter(): string {
    return this._filter;
  }

  @Input()
  pageSize: 10;

  @Output()
  valueSelected: EventEmitter<ValueListItem> = new EventEmitter();

  values: ValueListItem[] = [];

  page = 0;

  selectedValue = 0;

  private _filter: string;

  // use a observable for filter changes to allow debouncing
  private filterChange: EventEmitter<string> = new EventEmitter();

  private valueSub: Subscription;

  constructor() {
  }

  ngOnInit() {
    this.keyboardEvents.subscribe(key => this.onKeypress(key));

    this.fetchValuesFromSource(this._filter);
    this.filterChange.asObservable().debounceTime(100).subscribe(value => {
      this.fetchValuesFromSource(value);
    });
  }

  select(value: ValueListItem) {
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
        if (this.values.length > 0) {
          this.select(this.values[this.selectedValue]);
        } else {
          if (this.allowFreeInput || !this.valueSource) {
            this.select({value: this.filter, label: this.filter});
          }
        }
        break;
    }
  }

  fetchValuesFromSource(filter: string) {
    if (!this.valueSource) {
      return;
    }
    if (this.valueSub) {
      this.valueSub.unsubscribe();
    }
    this.valueSub = this.valueSource((this.valueSourceFilters || []), filter, this.page, this.pageSize).subscribe((values) => {
      this.values = values;
    });
  }

  pageBack() {
    if (this.page > 0) {
      this.page = this.page - 1;
      this.fetchValuesFromSource(this._filter);
    }
  }

  pageForward() {
    // if there are less than the page size values we're probably on the last page.
    // or just unlucky.
    if (this.values.length === this.pageSize) {
      this.page++;
      this.fetchValuesFromSource(this._filter);
    }
  }
}

export interface ValueListItem {
  value: string;
  label?: string;
  helpText?: string;
}
