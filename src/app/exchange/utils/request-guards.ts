import {
  ExchangeReceivedRequest,
  ExchangeRequest,
  ExchangeSentRequest,
} from '../types/exchange-request';

export function isSentRequest(
  request: ExchangeRequest
): request is ExchangeSentRequest {
  return 'sent' in request;
}

export function isReceivedRequest(
  request: ExchangeRequest
): request is ExchangeReceivedRequest {
  return 'request' in request;
}
