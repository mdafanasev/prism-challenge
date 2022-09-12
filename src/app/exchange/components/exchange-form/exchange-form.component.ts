import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { catchError, filter, Subject, switchMap, takeUntil, tap, throwError } from 'rxjs';
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
export class ExchangeFormComponent implements OnInit, OnDestroy {
  @Input() model: ExchangeModel = DEFAULT_MODEL;

  sentControl = new FormControl<Money>(NULL_MONEY);

  isSentPending = false;

  receivedControl = new FormControl<Money>(NULL_MONEY);

  isReceivedPending = false;

  quoteCounter = 0;

  error: string | null = null;

  private destroy = new Subject<void>();

  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sentControl.valueChanges
      .pipe(
        filter(Boolean),
        tap(() => (this.isReceivedPending = true)),
        switchMap((value) =>
          this.requestQuote({
            sent: value,
            receivedCurrency: this.model?.received,
          })
        ),
        takeUntil(this.destroy)
      )
      .subscribe((value) => {
        this.receivedControl.setValue(value.received, { emitEvent: false });
        this.isReceivedPending = false;
      });
    this.receivedControl.valueChanges
      .pipe(
        filter(Boolean),
        tap(() => (this.isSentPending = true)),
        switchMap((value) =>
          this.requestQuote({
            received: value,
            sentCurrency: this.model?.sent,
          })
        ),
        takeUntil(this.destroy)
      )
      .subscribe((value) => {
        this.sentControl.setValue(value.sent, { emitEvent: false });
        this.isSentPending = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
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
