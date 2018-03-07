import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BarComponent} from './bar/bar.component';
import {FormsModule} from '@angular/forms';
import {ValueListComponent} from './value-list/value-list.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [BarComponent, ValueListComponent],
  exports: [BarComponent]
})
export class FilterbarModule {
}
