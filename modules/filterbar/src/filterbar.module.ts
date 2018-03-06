import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BarComponent} from './bar/bar.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [BarComponent],
  exports: [BarComponent]
})
export class FilterbarModule {
}
