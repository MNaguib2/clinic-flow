import { Component, forwardRef, input } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldBase } from './field-base';
import { FieldCheckbox } from './field-checkbox';
import { FieldFile } from './field-file';
import { FieldImage } from './field-image';
import { FieldInput } from './field-input';
import { FieldPhone } from './field-phone';
import { FieldSelect, SelectOption } from './field-select';
import { FieldTextarea } from './field-textarea';

interface BaseFieldConfig {
  /** Translation key or plain text. */
  label: string;
  helpText?: string;
  required?: boolean;
  readonly?: boolean;
  disabled?: boolean;
}

export type FieldConfig = BaseFieldConfig &
  (
    | {
        type: 'text' | 'email' | 'password' | 'url' | 'date';
        placeholder?: string;
        autocomplete?: string;
        list?: string;
        maxLength?: number;
      }
    | { type: 'number'; placeholder?: string; min?: number; max?: number; step?: number }
    | { type: 'tel'; placeholder?: string }
    | { type: 'textarea'; placeholder?: string; rows?: number; maxLength?: number }
    | { type: 'select'; options: readonly SelectOption[]; placeholder?: string }
    | { type: 'checkbox' }
    | { type: 'file'; accept?: string; multiple?: boolean; maxFileSize?: number; hint?: string }
    | { type: 'image'; accept?: string; maxFileSize?: number; hint?: string }
  );

/** Renders the field component matching `config.type`; usable with any Angular Forms directive. */
@Component({
  selector: 'app-field',
  imports: [
    FormsModule,
    FieldCheckbox,
    FieldFile,
    FieldImage,
    FieldInput,
    FieldPhone,
    FieldSelect,
    FieldTextarea,
  ],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Field), multi: true }],
  template: `
    @let c = config();
    @if (
      c.type === 'text' ||
      c.type === 'email' ||
      c.type === 'password' ||
      c.type === 'url' ||
      c.type === 'date'
    ) {
      <app-field-input
        [type]="c.type"
        [label]="c.label"
        [helpText]="c.helpText ?? ''"
        [placeholder]="c.placeholder ?? ''"
        [autocomplete]="c.autocomplete ?? ''"
        [list]="c.list ?? ''"
        [maxLength]="c.maxLength"
        [required]="!!c.required"
        [readonly]="!!c.readonly"
        [disabled]="!!c.disabled || disabled()"
        [error]="error()"
        [ngModel]="current()"
        [ngModelOptions]="{ standalone: true }"
        (ngModelChange)="commit($event)"
        (blurred)="touch()"
      />
    } @else if (c.type === 'number') {
      <app-field-input
        type="number"
        [label]="c.label"
        [helpText]="c.helpText ?? ''"
        [placeholder]="c.placeholder ?? ''"
        [min]="c.min"
        [max]="c.max"
        [step]="c.step"
        [required]="!!c.required"
        [readonly]="!!c.readonly"
        [disabled]="!!c.disabled || disabled()"
        [error]="error()"
        [ngModel]="current()"
        [ngModelOptions]="{ standalone: true }"
        (ngModelChange)="commit($event)"
        (blurred)="touch()"
      />
    } @else if (c.type === 'tel') {
      <app-field-phone
        [label]="c.label"
        [helpText]="c.helpText ?? ''"
        [placeholder]="c.placeholder ?? ''"
        [required]="!!c.required"
        [readonly]="!!c.readonly"
        [disabled]="!!c.disabled || disabled()"
        [error]="error()"
        [ngModel]="current()"
        [ngModelOptions]="{ standalone: true }"
        (ngModelChange)="commit($event)"
        (blurred)="touch()"
      />
    } @else if (c.type === 'textarea') {
      <app-field-textarea
        [label]="c.label"
        [helpText]="c.helpText ?? ''"
        [placeholder]="c.placeholder ?? ''"
        [rows]="c.rows ?? 3"
        [maxLength]="c.maxLength"
        [required]="!!c.required"
        [readonly]="!!c.readonly"
        [disabled]="!!c.disabled || disabled()"
        [error]="error()"
        [ngModel]="current()"
        [ngModelOptions]="{ standalone: true }"
        (ngModelChange)="commit($event)"
        (blurred)="touch()"
      />
    } @else if (c.type === 'select') {
      <app-field-select
        [label]="c.label"
        [helpText]="c.helpText ?? ''"
        [options]="c.options"
        [placeholder]="c.placeholder ?? ''"
        [required]="!!c.required"
        [readonly]="!!c.readonly"
        [disabled]="!!c.disabled || disabled()"
        [error]="error()"
        [ngModel]="current()"
        [ngModelOptions]="{ standalone: true }"
        (ngModelChange)="commit($event)"
        (blurred)="touch()"
      />
    } @else if (c.type === 'checkbox') {
      <app-field-checkbox
        [label]="c.label"
        [helpText]="c.helpText ?? ''"
        [required]="!!c.required"
        [readonly]="!!c.readonly"
        [disabled]="!!c.disabled || disabled()"
        [error]="error()"
        [ngModel]="current()"
        [ngModelOptions]="{ standalone: true }"
        (ngModelChange)="commit($event)"
        (blurred)="touch()"
      />
    } @else if (c.type === 'file') {
      <app-field-file
        [label]="c.label"
        [helpText]="c.helpText ?? ''"
        [accept]="c.accept ?? ''"
        [multiple]="!!c.multiple"
        [maxFileSize]="c.maxFileSize ?? null"
        [hint]="c.hint ?? ''"
        [required]="!!c.required"
        [readonly]="!!c.readonly"
        [disabled]="!!c.disabled || disabled()"
        [error]="error()"
        [ngModel]="current()"
        [ngModelOptions]="{ standalone: true }"
        (ngModelChange)="commit($event)"
        (blurred)="touch()"
      />
    } @else if (c.type === 'image') {
      <app-field-image
        [label]="c.label"
        [helpText]="c.helpText ?? ''"
        [accept]="c.accept ?? 'image/jpeg,image/png,image/gif,image/webp'"
        [maxFileSize]="c.maxFileSize ?? 5242880"
        [hint]="c.hint ?? ''"
        [required]="!!c.required"
        [readonly]="!!c.readonly"
        [disabled]="!!c.disabled || disabled()"
        [error]="error()"
        [ngModel]="current()"
        [ngModelOptions]="{ standalone: true }"
        (ngModelChange)="commit($event)"
        (blurred)="touch()"
      />
    }
  `,
})
export class Field extends FieldBase<unknown> {
  readonly config = input.required<FieldConfig>();

  constructor() {
    super(null);
  }
}
