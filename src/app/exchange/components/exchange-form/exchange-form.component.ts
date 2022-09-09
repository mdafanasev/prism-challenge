import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { Money } from 'src/app/kit';
import { ExchangeService } from '../../services/exchange.service';
import { ExchangeModel } from '../../types/exchange-model';
import { ExchangeRequest } from '../../types/exchange-request';

const NULL_MONEY: Money = { currency: 'USD', amount: 0 };

const DEFAULT_MODEL: ExchangeModel = { sent: 'USD', received: 'EUR' };

@Component({
  selector: 'fc-exchange-form',
  templateUrl: './exchange-form.component.html',
  styleUrls: ['./exchange-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExchangeFormComponent {
  @Input() model: ExchangeModel = DEFAULT_MODEL;

  sentValue: Observable<Money> = of(NULL_MONEY);

  receivedValue: Observable<Money> = of(NULL_MONEY);

  quoteCounter = 0;

  error: string | null = null;

  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  requestQuoteWithSent(sent: Money | null): void {
    if (sent?.amount) {
      this.sentValue = of(sent);
      this.receivedValue = this.requestQuote({
        sent,
        receivedCurrency: this.model?.received,
      }).pipe(map((value) => value.received));
    } else {
      this.receivedValue = of(NULL_MONEY);
    }
  }

  requestQuoteWithReceived(received: Money | null): void {
    if (received?.amount) {
      this.receivedValue = of(received);
      this.sentValue = this.requestQuote({
        received,
        sentCurrency: this.model?.sent,
      }).pipe(map((value) => value.sent));
    } else {
      this.sentValue = of(NULL_MONEY);
    }
  }

  private requestQuote(request: ExchangeRequest) {
    this.resetState();
    return this.exchangeService.getExchangeQuote(request).pipe(
      tap(() => this.quoteCounter++),
      catchError((error) => {
        this.showError();
        return throwError(() => error);
      })
    );
  }

  private resetState(): void {
    this.error = null;
    this.quoteCounter = 0;
  }

  private showError(): void {
    this.error = 'Unable to load exchange quote. Please, try again';
    this.cdr.markForCheck();
  }
}
