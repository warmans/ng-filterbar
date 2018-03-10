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
      const values = [];
      for (let i = 0; i <= 100; i++) {
        values.push({label: 'Foo ' + i, value: 'foo' + i});
      }
      return Observable.of(values.filter((v) => v.label.indexOf(query) > -1));
    },
    multiSelect: true,
  }, {
    kind: SelectableKind.FREETEXT,
    field: 'baz',
    label: 'Baz',
    helpText: '',
  }];
}
