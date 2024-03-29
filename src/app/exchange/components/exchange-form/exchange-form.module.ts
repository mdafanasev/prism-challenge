import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExchangeFormComponent } from './exchange-form.component';
import { KitModule } from 'src/app/kit';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [ExchangeFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    KitModule,
  ],
  exports: [ExchangeFormComponent],
})
export class ExchangeFormModule {}
