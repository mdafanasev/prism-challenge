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
import { Subject, takeUntil } from 'rxjs';
import { Currency } from '../../types/currency';

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

  control = new FormControl<string | null>(null);

  private onChange: (value: number | null) => void = () => {};

  private onTouched: () => void = () => {};

  private destroy = new Subject<void>();

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.control.valueChanges
      .pipe(takeUntil(this.destroy))
      .subscribe((value) => this.updateValue(value));
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  writeValue(value: number | null): void {
    this.control.setValue(value !== null ? `${value}` : '', {
      emitEvent: false,
    });
    this.cdr.markForCheck();
  }

  registerOnChange(onChange: (value: number | null) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  handleBlur(): void {
    this.onTouched();
  }

  private updateValue(value: string | null): void {
    this.onChange(value !== null ? Number(value) : null);
    this.cdr.markForCheck();
  }
}
