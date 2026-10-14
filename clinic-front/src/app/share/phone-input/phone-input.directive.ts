import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Directive,
  ErrorHandler,
  ElementRef,
  forwardRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import intlTelInput, { type Iti } from 'intl-tel-input';

@Directive({
  selector: 'input[intlTelInput]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputDirective),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PhoneInputDirective),
      multi: true,
    },
  ],
})
export class PhoneInputDirective
  implements AfterViewInit, ControlValueAccessor, OnDestroy, Validator
{
  private readonly element = inject(ElementRef<HTMLInputElement>).nativeElement;
  private readonly errorHandler = inject(ErrorHandler);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private instance?: Iti;
  private value = '';
  private isUtilsReady = false;
  private isDisabled = false;
  private isDestroyed = false;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  private readonly handleInput = (): void => this.updateValue();
  private readonly handleBlur = (): void => this.onTouched();
  private readonly handleCountryChange = (): void => this.updateValue();

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    const instance = intlTelInput(this.element, {
      initialCountry: 'eg',
      separateDialCode: true,
      loadUtils: () => import('intl-tel-input/utils'),
    });
    this.instance = instance;
    this.element.addEventListener('input', this.handleInput);
    this.element.addEventListener('blur', this.handleBlur);
    this.element.addEventListener('countrychange', this.handleCountryChange);
    instance.setDisabled(this.isDisabled);
    instance.setNumber(this.value);

    void instance.promise
      .then(() => {
        if (!this.isDestroyed) {
          this.isUtilsReady = true;
          this.updateValue();
          this.onValidatorChange();
        }
      })
      .catch((error: unknown) => this.errorHandler.handleError(error));
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.element.removeEventListener('input', this.handleInput);
    this.element.removeEventListener('blur', this.handleBlur);
    this.element.removeEventListener('countrychange', this.handleCountryChange);
    this.instance?.destroy();
  }

  writeValue(value: string | null): void {
    this.value = value ?? '';
    if (this.instance) {
      this.instance.setNumber(this.value);
    } else {
      this.element.value = this.value;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.element.disabled = isDisabled;
    this.instance?.setDisabled(isDisabled);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return this.isUtilsReady && this.instance?.isValidNumber() === true
      ? null
      : { intlTelInput: true };
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  private updateValue(): void {
    const inputValue = this.element.value.trim();
    this.value = inputValue
      ? (this.isUtilsReady ? this.instance?.getNumber('E164') || inputValue : inputValue)
      : '';
    this.onChange(this.value);
    this.onValidatorChange();
  }
}
