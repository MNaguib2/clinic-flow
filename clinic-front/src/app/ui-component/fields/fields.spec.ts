import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideTranslateService } from '@ngx-translate/core';
import { FieldCheckbox } from './field-checkbox';
import { FieldFile } from './field-file';
import { FieldInput } from './field-input';
import { matchesAccept, validateFile } from './file-validation';

@Component({
  imports: [FieldInput, FieldCheckbox, FieldFile, ReactiveFormsModule],
  template: `
    <app-field-input label="Name" [formControl]="name" />
    <app-field-checkbox label="Agree" [formControl]="agree" />
    <app-field-file label="Doc" accept="application/pdf" [maxFileSize]="10" [formControl]="doc" />
  `,
})
class Host {
  name = new FormControl('');
  agree = new FormControl(false);
  doc = new FormControl<File | null>(null);
}

describe('form fields', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideTranslateService()] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return fixture;
  }

  it('writes programmatic values to the DOM without marking the control dirty', async () => {
    const fixture = setup();
    fixture.componentInstance.name.setValue('Clinic');
    fixture.detectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input[type=text]') as HTMLInputElement;
    expect(input.value).toBe('Clinic');
    expect(fixture.componentInstance.name.dirty).toBe(false);
  });

  it('propagates user input and touched state', () => {
    const fixture = setup();
    const input = fixture.nativeElement.querySelector('input[type=text]') as HTMLInputElement;
    input.value = 'Hello';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.name.value).toBe('Hello');
    expect(fixture.componentInstance.name.touched).toBe(true);
  });

  it('respects the disabled state', async () => {
    const fixture = setup();
    fixture.componentInstance.name.disable();
    fixture.detectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input[type=text]') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('emits checkbox booleans', () => {
    const fixture = setup();
    const box = fixture.nativeElement.querySelector('input[type=checkbox]') as HTMLInputElement;
    box.checked = true;
    box.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.agree.value).toBe(true);
  });

  it('rejects files that fail validation and keeps the value', () => {
    const fixture = setup();
    const input = fixture.nativeElement.querySelector('input[type=file]') as HTMLInputElement;
    const bad = new File(['x'], 'a.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [bad], configurable: true });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.doc.value).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('field.errors.type');
  });

  it('accepts valid files', () => {
    const fixture = setup();
    const input = fixture.nativeElement.querySelector('input[type=file]') as HTMLInputElement;
    const good = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [good], configurable: true });
    input.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.doc.value).toBe(good);
  });
});

describe('file validation', () => {
  it('matches mime, wildcard and extension rules', () => {
    const png = new File(['x'], 'a.png', { type: 'image/png' });
    expect(matchesAccept(png, 'image/*')).toBe(true);
    expect(matchesAccept(png, '.pdf')).toBe(false);
    expect(matchesAccept(png, '')).toBe(true);
  });

  it('flags oversized files', () => {
    const file = new File(['abcdef'], 'a.txt', { type: 'text/plain' });
    expect(validateFile(file, { accept: '', max_size: 3 })).toBe('size');
  });
});
