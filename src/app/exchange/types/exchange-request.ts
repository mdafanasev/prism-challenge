import { Currency, Money } from 'src/app/kit';

export interface ExchangeSentRequest {
  sent: Money;
  receivedCurrency: Currency;
}

export interface ExchangeReceivedRequest {
  received: Money;
  sentCurrency: Currency;
}

export type ExchangeRequest = ExchangeSentRequest | ExchangeReceivedRequest;
