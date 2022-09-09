import { Component, forwardRef, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ReplaySubject } from 'rxjs';
import { Currency, Money } from 'src/app/kit';
import { LetModule } from '../../../utils';
import { ExchangeService } from '../../services/exchange.service';
import { ExchangeQuote } from '../../types/exchange-quote';

import { ExchangeFormComponent } from './exchange-form.component';

describe('ExchangeFormComponent', () => {
  const SENT_CURRENCY: Currency = 'USD';
  const RECV_CURRENCY: Currency = 'EUR';
  let component: ExchangeFormComponent;
  let fixture: ComponentFixture<ExchangeFormComponent>;
  let quoteResp: ReplaySubject<ExchangeQuote>;
  let service: Pick<ExchangeService, 'getExchangeQuote'>;
  let po: PageObject<ExchangeFormComponent>;

  const mockQuoteResp = (value: ExchangeQuote) => quoteResp.next(value);

  beforeEach(async () => {
    quoteResp = new ReplaySubject<ExchangeQuote>(1);
    service = {
      getExchangeQuote: jest
        .fn()
        .mockImplementation(() => quoteResp.asObservable()),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, LetModule],
      declarations: [ExchangeFormComponent, MockInputMoneyComponent],
      providers: [{ provide: ExchangeService, useValue: service }],
    }).compileComponents();

    fixture = TestBed.createComponent(ExchangeFormComponent);
    component = fixture.componentInstance;
    component.model = { sent: SENT_CURRENCY, received: RECV_CURRENCY };
    fixture.detectChanges();
    po = new PageObject(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have sent input', () => {
    expect(po.sentComponent).toBeTruthy();
  });

  it('should have received input', () => {
    expect(po.receivedComponent).toBeTruthy();
  });

  it('should call service on sent input update', () => {
    po.updateSentValue({ currency: SENT_CURRENCY, amount: 1234 });
    expect(service.getExchangeQuote).toHaveBeenCalledWith({
      sent: { currency: SENT_CURRENCY, amount: 1234 },
      receivedCurrency: RECV_CURRENCY,
    });
  });

  it('should call service on received input update', () => {
    po.updateReceivedValue({ currency: RECV_CURRENCY, amount: 4321 });
    expect(service.getExchangeQuote).toHaveBeenCalledWith({
      received: { currency: RECV_CURRENCY, amount: 4321 },
      sentCurrency: SENT_CURRENCY,
    });
  });

  it('should update received value after updating sent value', (done) => {
    po.updateSentValue({ currency: SENT_CURRENCY, amount: 1234 });
    mockQuoteResp({
      sent: { currency: SENT_CURRENCY, amount: 1234 },
      received: { currency: RECV_CURRENCY, amount: 1250 },
      rate: 1.03,
      expiresAt: new Date(),
    });
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(po.receivedComponent.writeValue).toHaveBeenCalledWith({
        currency: RECV_CURRENCY,
        amount: 1250,
      });
      done();
    });
  });

  it('should update sent value after updating received value', (done) => {
    po.updateReceivedValue({ currency: RECV_CURRENCY, amount: 4321 });
    mockQuoteResp({
      sent: { currency: SENT_CURRENCY, amount: 4320 },
      received: { currency: RECV_CURRENCY, amount: 4321 },
      rate: 1.03,
      expiresAt: new Date(),
    });
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(po.sentComponent.writeValue).toHaveBeenCalledWith({
        currency: SENT_CURRENCY,
        amount: 4320,
      });
      done();
    });
  });
});

@Component({
  selector: 'fc-input-money',
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => MockInputMoneyComponent),
    },
  ],
})
class MockInputMoneyComponent implements ControlValueAccessor {
  @Input() currency: Currency = 'USD';

  @Input() label: string = '';

  @Input() pending = false;

  @Input() debounceTime = 0;

  onChange: (value: Money) => void = () => {};

  onTouched: () => void = () => {};

  writeValue = jest.fn();

  registerOnChange(onChange: (value: Money) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }
}

class PageObject<T> {
  private readonly component = this.fixture.componentInstance;

  get sentComponent() {
    return this.getMoneyInputs()[0];
  }

  get receivedComponent() {
    return this.getMoneyInputs()[1];
  }

  constructor(private readonly fixture: ComponentFixture<T>) {}

  updateSentValue(value: Money): void {
    this.sentComponent.onChange(value);
  }

  updateReceivedValue(value: Money): void {
    this.receivedComponent.onChange(value);
  }

  private getMoneyInputs(): MockInputMoneyComponent[] {
    return this.fixture.debugElement
      .queryAll(By.directive(MockInputMoneyComponent))
      .map((debugElement) => debugElement.componentInstance);
  }
}
