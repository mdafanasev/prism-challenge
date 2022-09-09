import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { ExchangeService } from './exchange.service';
import { Subject, takeUntil } from 'rxjs';

describe('ExchangeService', () => {
  const URL = '/api/generate-rate-quote';
  const SENT_CURRENCY = 'USD';
  const RECV_CURRENCY = 'EUR';
  const SENT_AMOUNT = 1234;
  const RECV_AMOUNT = 1250;
  const RATE = 1.02;
  let service: ExchangeService;
  let http: HttpTestingController;
  let destroy: Subject<void>;
  let expiresAt: Date;

  beforeEach(() => {
    destroy = new Subject<void>();
    expiresAt = new Date(+new Date() + 5 * 60 * 1000);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ExchangeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    destroy.next();
    destroy.complete();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make request on getExchangeQuote call', () => {
    service
      .getExchangeQuote({
        sent: { currency: SENT_CURRENCY, amount: SENT_AMOUNT },
        receivedCurrency: RECV_CURRENCY,
      })
      .pipe(takeUntil(destroy))
      .subscribe();
    const req = http.expectOne(URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ sentAmount: `${SENT_AMOUNT}` });
  });

  it('should return correct quote object on getExchangeQuote call', (done) => {
    service
      .getExchangeQuote({
        sent: { currency: SENT_CURRENCY, amount: SENT_AMOUNT },
        receivedCurrency: RECV_CURRENCY,
      })
      .pipe(takeUntil(destroy))
      .subscribe((quote) => {
        expect(quote).toEqual({
          sent: { currency: SENT_CURRENCY, amount: SENT_AMOUNT },
          received: { currency: RECV_CURRENCY, amount: RECV_AMOUNT },
          rate: RATE,
          expiresAt: expiresAt,
        });
        done();
      });
    const req = http.expectOne(URL);
    req.flush({
      sentAmount: `${SENT_AMOUNT}`,
      receivedAmount: `${RECV_AMOUNT}`,
      rate: `${RATE}`,
      expiresAt: expiresAt.toISOString(),
    });
  });
});
