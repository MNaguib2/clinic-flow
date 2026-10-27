import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { PhoneInputDirective } from './phone-input.directive';

@Component({
  imports: [PhoneInputDirective, ReactiveFormsModule],
  template: '<input type="tel" intlTelInput [formControl]="phone" />',
})
class TestHost {
  readonly phone = new FormControl('', { nonNullable: true });
}

describe('PhoneInputDirective', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('normalizes valid phone numbers to E.164 and rejects invalid numbers', async () => {
    const input = fixture.nativeElement.querySelector('input[type="tel"]') as HTMLInputElement;
    input.value = '01012345678';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    await vi.waitFor(() => {
      expect(fixture.componentInstance.phone.value).toBe('+201012345678');
    });
    expect(fixture.componentInstance.phone.value).toBe('+201012345678');
    expect(fixture.componentInstance.phone.valid).toBe(true);

    input.value = '123';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(fixture.componentInstance.phone.valid).toBe(false);
  });
});
