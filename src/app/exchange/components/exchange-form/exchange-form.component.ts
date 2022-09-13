import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  catchError,
  defer,
  EMPTY,
  iif,
  merge,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
  timer,
} from 'rxjs';
import { ExchangeService } from '../../services/exchange.service';
import { ExchangeModel } from '../../types/exchange-model';
import { ExchangeQuote } from '../../types/exchange-quote';
import { ExchangeRequest } from '../../types/exchange-request';

const DEFAULT_MODEL: ExchangeModel = { sent: 'USD', received: 'EUR' };

const DEBOUNCE_TIME = 500;

const NULL_QUOTE = {
  sent: 0,
  received: 0,
  rate: 0,
  expiresAt: new Date(),
};

@Component({
  selector: 'fc-exchange-form',
  templateUrl: './exchange-form.component.html',
  styleUrls: ['./exchange-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExchangeFormComponent implements OnInit, OnDestroy {
  @Input() model: ExchangeModel = DEFAULT_MODEL;

  sentControl = new FormControl<number | null>(null);

  receivedControl = new FormControl<number | null>(null);

  isSentPending = false;

  isReceivedPending = false;

  quoteCounter = 0;

  error: string | null = null;

  private activeControl = this.sentControl;

  private destroy = new Subject<void>();

  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listenForChanges();
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  private listenForChanges(): void {
    merge(
      this.sentControl.valueChanges.pipe(
        tap(() => (this.activeControl = this.sentControl))
      ),
      this.receivedControl.valueChanges.pipe(
        tap(() => (this.activeControl = this.receivedControl))
      )
    )
      .pipe(
        switchMap((value) =>
          iif(
            () => value !== null && value > 0,
            defer(() => this.requestQuote(value as number)),
            defer(() => this.cleanQuote())
          )
        ),
        takeUntil(this.destroy)
      )
      .subscribe((quote) => this.setValues(quote));
  }

  private requestQuote(value: number) {
    this.resetState();
    const request: ExchangeRequest =
      this.activeControl === this.sentControl
        ? { sent: value }
        : { received: value };
    this.startPending();
    return timer(DEBOUNCE_TIME).pipe(
      switchMap(() => this.exchangeService.getExchangeQuote(request)),
      tap(() => {
        this.stopPending();
        this.quoteCounter++;
      }),
      catchError(() => {
        this.showError();
        return EMPTY;
      })
    );
  }

  private cleanQuote() {
    this.resetState();
    this.stopPending();
    return of(NULL_QUOTE);
  }

  private startPending() {
    if (this.activeControl === this.sentControl) {
      this.isReceivedPending = true;
    }
    if (this.activeControl === this.receivedControl) {
      this.isSentPending = true;
    }
  }

  private stopPending() {
    this.isSentPending = false;
    this.isReceivedPending = false;
  }

  private setValues(quote: ExchangeQuote) {
    if (this.activeControl === this.sentControl) {
      this.receivedControl.setValue(quote.received || null, {
        emitEvent: false,
      });
    }
    if (this.activeControl === this.receivedControl) {
      this.sentControl.setValue(quote.sent || null, { emitEvent: false });
    }
  }

  private resetState(): void {
    this.error = null;
    this.quoteCounter = 0;
  }

  private showError(): void {
    this.isSentPending = false;
    this.isReceivedPending = false;
    this.error = 'Unable to load exchange quote. Please, try again';
    this.cdr.markForCheck();
  }
}
