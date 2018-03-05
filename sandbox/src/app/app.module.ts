import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';


import {AppComponent} from './app.component';
import {FilterbarModule} from '../../../modules/filterbar';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FilterbarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
