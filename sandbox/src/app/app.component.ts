import { Component } from '@angular/core';
import {FreetextConfig, SelectableConfig, SelectableKind} from '../../../modules/filterbar/src/bar/bar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  selectables: SelectableConfig[] = [
    <FreetextConfig>{
      kind: SelectableKind.FREETEXT,
      field: 'foo',
      label: 'Foo',
      helpText: "A sample value without."
    }
  ];
}
