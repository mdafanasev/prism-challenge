import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExchangeFormComponent } from './exchange-form.component';
import { KitModule } from 'src/app/kit';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LetModule } from 'src/app/utils';

@NgModule({
  declarations: [ExchangeFormComponent],
  imports: [CommonModule, FormsModule, HttpClientModule, LetModule, KitModule],
  exports: [ExchangeFormComponent],
})
export class ExchangeFormModule {}
