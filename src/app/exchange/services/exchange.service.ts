import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { repeatAt } from '../../utils';
import { ExchangeQuote } from '../types/exchange-quote';
import { ExchangeRequest } from '../types/exchange-request';
import { isSentRequest } from '../utils/request-guards';

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
        map((payload) => this.mapPayloadToQuote(payload)),
        repeatAt((value) => value.expiresAt)
      );
  }

  private mapRequestToBody(request: ExchangeRequest): GetExchangeQuoteBody {
    if (isSentRequest(request)) {
      return { sentAmount: `${request.sent}` };
    }
    return { receivedAmount: `${request.received}` };
  }

  private mapPayloadToQuote(payload: GetExchangeQuotePayload): ExchangeQuote {
    return {
      sent: Number(payload.sentAmount),
      received: Number(payload.receivedAmount),
      rate: Number(payload.rate),
      expiresAt: new Date(payload.expiresAt),
    };
  }
}
