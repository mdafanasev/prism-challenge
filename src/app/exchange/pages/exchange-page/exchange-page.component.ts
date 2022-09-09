import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ExchangeModel } from '../../types/exchange-model';

@Component({
  selector: 'fc-exchange-page',
  templateUrl: './exchange-page.component.html',
  styleUrls: ['./exchange-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExchangePageComponent {
  exchangeModel: ExchangeModel = {
    sent: 'USD',
    received: 'EUR',
  };
}
