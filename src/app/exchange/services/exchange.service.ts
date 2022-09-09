import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { repeatAt } from '../../utils';
import { ExchangeModel } from '../types/exchange-model';
import { ExchangeQuote } from '../types/exchange-quote';
import { ExchangeRequest } from '../types/exchange-request';
import { getModelFromRequest } from '../utils/get-model-from-request';

type GetExchangeQuoteBody =
  | { sentAmount: string; receivedAmount?: never }
  | { sentAmount?: never; receivedAmount: string };

type GetExchangeQuotePayload = {
  sentAmount: string;
  receivedAmount: string;
  rate: string;
  expiresAt: string;
};

@Injectable({
  providedIn: 'root',
})
export class ExchangeService {
  constructor(private readonly http: HttpClient) {}

  getExchangeQuote(request: ExchangeRequest): Observable<ExchangeQuote> {
    return this.http
      .post<GetExchangeQuotePayload>(
        '/api/generate-rate-quote',
        this.mapRequestToBody(request)
      )
      .pipe(
        map((payload) =>
          this.mapPayloadToQuote(payload, getModelFromRequest(request))
        ),
        repeatAt((value) => value.expiresAt)
      );
  }

  private mapRequestToBody(request: ExchangeRequest): GetExchangeQuoteBody {
    if ('sent' in request) {
      return { sentAmount: `${request.sent.amount}` };
    }
    return { receivedAmount: `${request.received.amount}` };
  }

  private mapPayloadToQuote(
    payload: GetExchangeQuotePayload,
    model: ExchangeModel
  ): ExchangeQuote {
    return {
      sent: { currency: model.sent, amount: Number(payload.sentAmount) },
      received: {
        currency: model.received,
        amount: Number(payload.receivedAmount),
      },
      rate: Number(payload.rate),
      expiresAt: new Date(payload.expiresAt),
    };
  }

  private makeCacheKey(request: ExchangeRequest): string {
    if ('sent' in request) {
      return `${request.sent.currency}_${request.receivedCurrency}_${request.sent.amount}`;
    }
    return `${request.received.currency}_${request.sentCurrency}_${request.received.amount}`;
  }
}
