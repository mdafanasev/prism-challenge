import { Component } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';

import { InputMoneyComponent } from './input-money.component';

describe('InputMoneyComponent', () => {
  let host: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let po: PageObject<TestHostComponent>;
  let destroy: Subject<void>;

  beforeEach(async () => {
    destroy = new Subject<void>();
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [InputMoneyComponent, TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    po = new PageObject(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(host).toBeTruthy();
  });

  it('should contain input element', () => {
    expect(po.inputElement).toBeTruthy();
  });

  it('should emit changes on input value change', fakeAsync(() => {
    const cb = jest.fn();
    host.control.valueChanges.pipe(takeUntil(destroy)).subscribe(cb);
    po.setValue('1234');
    tick();
    expect(cb).toHaveBeenCalledWith({ currency: 'EUR', amount: 1234 });
  }));

  it('should accept value from form', () => {
    host.control.setValue({ currency: 'EUR', amount: 4321 });
    expect(po.inputElement.value).toBe('4321');
  });

  it('should become touched on blur', () => {
    expect(host.control.touched).toBeFalsy();
    po.inputElement.dispatchEvent(new Event('blur'));
    expect(host.control.touched).toBeTruthy();
  });

  it('should display correct currency', () => {
    expect(po.currencyLabel.textContent).toContain('EUR');
  });
});

@Component({
  selector: 'fc-test-host',
  template: `<fc-input-money [currency]="currency" [formControl]="control">
  </fc-input-money>`,
})
class TestHostComponent {
  currency = 'EUR';
  control = new FormControl();
}

class PageObject<T> {
  private readonly component = this.fixture.componentInstance;

  get inputElement() {
    return this.getByTestId('fc-input-money__input').nativeElement;
  }

  get currencyLabel() {
    return this.getByTestId('fc-input-money__currency').nativeElement;
  }

  constructor(private readonly fixture: ComponentFixture<T>) {}

  public setValue(value: string) {
    this.inputElement.value = value;
    this.inputElement.dispatchEvent(new Event('input'));
    this.fixture.detectChanges();
  }

  private getByTestId(testId: string) {
    const selector = `*[data-test-id="${testId}"]`;
    return this.fixture.debugElement.query(By.css(selector));
  }
}
