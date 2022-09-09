import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExchangeFormModule } from './components/exchange-form/exchange-form.module';
import { ExchangePageComponent } from './pages/exchange-page/exchange-page.component';
import { ExchangeRoutingModule } from './exchange-routing.module';

@NgModule({
  imports: [CommonModule, ExchangeRoutingModule, ExchangeFormModule],
  declarations: [ExchangePageComponent],
})
export class ExchangeModule {}
