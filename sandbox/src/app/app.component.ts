import {Component} from '@angular/core';
import {SelectableConfig, SelectableKind} from '../../../modules/filterbar/src/bar/bar.component';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  selectables: SelectableConfig[] = [{
    kind: SelectableKind.FREETEXT,
    field: 'foo',
    label: 'Foo',
    helpText: 'A sample value without.',
    validComparisons: [{value: '='}, {value: '>'}, {value: '<'}]
  }, {
    kind: SelectableKind.FREETEXT,
    field: 'bar',
    label: 'Boo',
    helpText: 'Another value.',
    valueSourcePaging: true,
    valueSource: (filters, query, page, pagesize) => {
      return Observable.of([{label: 'foo', value: 'foo'}, {label: 'bar', value: 'bar'}, {
        label: 'baz',
        value: 'baz'
      }].filter((v) => v.label.indexOf(query) > -1));
    },
  }, {
    kind: SelectableKind.FREETEXT,
    field: 'baz',
    label: 'Baz',
    helpText: '',
  }];
}
