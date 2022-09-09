import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { ExchangeModule } from './exchange/exchange.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, ExchangeModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
