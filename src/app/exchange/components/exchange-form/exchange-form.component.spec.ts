import { Component, forwardRef, Input } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ReplaySubject } from 'rxjs';
import { Currency } from 'src/app/kit';
import { ExchangeService } from '../../services/exchange.service';
import { ExchangeQuote } from '../../types/exchange-quote';

import { ExchangeFormComponent } from './exchange-form.component';

describe('ExchangeFormComponent', () => {
  const SENT_CURRENCY: Currency = 'USD';
  const RECV_CURRENCY: Currency = 'EUR';
  const AMOUNT_A = 1234;
  const AMOUNT_B = 1250;

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
      imports: [ReactiveFormsModule],
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

  it('should call service on sent input update', fakeAsync(() => {
    po.updateSentValue(AMOUNT_A);
    tick(1000);
    fixture.detectChanges();
    expect(service.getExchangeQuote).toHaveBeenCalledWith({
      sent: AMOUNT_A,
    });
  }));

  it('should call service on received input update', fakeAsync(() => {
    po.updateReceivedValue(AMOUNT_B);
    tick(1000);
    fixture.detectChanges();
    expect(service.getExchangeQuote).toHaveBeenCalledWith({
      received: AMOUNT_B,
    });
  }));

  it('should update received value after updating sent value', fakeAsync(() => {
    po.updateSentValue(AMOUNT_A);
    mockQuoteResp({
      sent: AMOUNT_A,
      received: AMOUNT_B,
      rate: 1.03,
      expiresAt: new Date(),
    });
    tick(1000);
    fixture.detectChanges();
    expect(po.receivedComponent.writeValue).toHaveBeenCalledWith(AMOUNT_B);
  }));

  it('should update sent value after updating received value', fakeAsync(() => {
    po.updateReceivedValue(AMOUNT_B);
    mockQuoteResp({
      sent: AMOUNT_A,
      received: AMOUNT_B,
      rate: 1.03,
      expiresAt: new Date(),
    });
    tick(1000);
    fixture.detectChanges();
    expect(po.sentComponent.writeValue).toHaveBeenCalledWith(AMOUNT_A);
  }));
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

  onChange: (value: number | null) => void = () => {};

  onTouched: () => void = () => {};

  writeValue = jest.fn();

  registerOnChange(onChange: (value: number | null) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }
}

class PageObject<T> {
  get sentComponent() {
    return this.getMoneyInputs()[0];
  }

  get receivedComponent() {
    return this.getMoneyInputs()[1];
  }

  constructor(private readonly fixture: ComponentFixture<T>) {}

  updateSentValue(value: number | null): void {
    this.sentComponent.onChange(value);
  }

  updateReceivedValue(value: number | null): void {
    this.receivedComponent.onChange(value);
  }

  private getMoneyInputs(): MockInputMoneyComponent[] {
    return this.fixture.debugElement
      .queryAll(By.directive(MockInputMoneyComponent))
      .map((debugElement) => debugElement.componentInstance);
  }
}
