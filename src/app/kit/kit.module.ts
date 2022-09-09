import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputMoneyModule } from './components/input-money/input-money.module';
import { LoaderModule } from './components/loader/loader.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, InputMoneyModule, LoaderModule],
  exports: [InputMoneyModule, LoaderModule],
})
export class KitModule {}
