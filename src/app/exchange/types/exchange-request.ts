export interface ExchangeSentRequest {
  sent: number;
}

export interface ExchangeReceivedRequest {
  received: number;
}

export type ExchangeRequest = ExchangeSentRequest | ExchangeReceivedRequest;
