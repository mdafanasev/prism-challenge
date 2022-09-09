import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { Currency } from '../../types/currency';
import { Money } from '../../types/money';

@Component({
  selector: 'fc-input-money',
  templateUrl: './input-money.component.html',
  styleUrls: ['./input-money.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => InputMoneyComponent),
    },
  ],
})
export class InputMoneyComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  @Input() currency: Currency = 'USD';

  @Input() label: string = '';

  @Input() pending = false;

  @Input() debounceTime = 0;

  control = new FormControl<string>('', { nonNullable: true });

  private onChange: (value: Money) => void = () => {};

  private onTouched: () => void = () => {};

  private destroy = new Subject<void>();

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.control.valueChanges
      .pipe(debounceTime(this.debounceTime), takeUntil(this.destroy))
      .subscribe((value) => this.updateValue(value));
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  writeValue(value?: Money): void {
    this.control.setValue(this.fromMoney(value), {
      emitEvent: false,
      emitViewToModelChange: false,
    });
    this.cdr.markForCheck();
  }

  registerOnChange(onChange: (value: Money) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  handleBlur(): void {
    this.onTouched();
  }

  private updateValue(value: string): void {
    this.onChange(this.toMoney(value));
    this.cdr.markForCheck();
  }

  private fromMoney(value?: Money): string {
    return value?.amount ? `${value.amount}` : '';
  }

  private toMoney(value: string): Money {
    return {
      currency: this.currency,
      amount: Number(value) || 0,
    };
  }
}
