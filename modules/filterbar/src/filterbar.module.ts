import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {BarComponent} from './component/bar/bar.component';
import {ValueListComponent} from './component/value-list/value-list.component';
import {BarCeComponent} from './component/bar-ce/bar-ce.component';
import {ValueListCeComponent} from './component/value-list-ce/value-list-ce.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [BarComponent, ValueListComponent, BarCeComponent, ValueListCeComponent],
  exports: [BarComponent, BarCeComponent]
})
export class FilterbarModule {
}
