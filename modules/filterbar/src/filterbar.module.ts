import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FilterbarComponent} from './filterbar.component';

@NgModule({
  imports: [CommonModule],
  declarations: [FilterbarComponent],
  exports: [FilterbarComponent]
})
export class FilterbarModule {
}
