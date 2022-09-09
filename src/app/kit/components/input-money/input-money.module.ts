import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputMoneyComponent } from './input-money.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { LoaderModule } from '../loader/loader.module';

@NgModule({
  declarations: [InputMoneyComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
    LoaderModule,
  ],
  exports: [InputMoneyComponent],
})
export class InputMoneyModule {}
