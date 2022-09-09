import { ExchangeModel } from '../types/exchange-model';
import { ExchangeRequest } from '../types/exchange-request';

export function getModelFromRequest(request: ExchangeRequest): ExchangeModel {
  if ('sent' in request) {
    return { sent: request.sent.currency, received: request.receivedCurrency };
  }
  return { sent: request.sentCurrency, received: request.received.currency };
}
