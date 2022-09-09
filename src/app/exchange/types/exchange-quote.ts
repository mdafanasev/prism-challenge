import { Money } from 'src/app/kit';

export interface ExchangeQuote {
  sent: Money;
  received: Money;
  rate: number;
  expiresAt: Date;
}
