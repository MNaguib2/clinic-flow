import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Icon } from '../icon/icon';
import { FieldBase } from './field-base';
import { FieldShell } from './field-shell';
import { formatFileSize, validateFile } from './file-validation';

/**
 * Value: `File | null`, or `File[]` when `multiple` is set (selections are appended).
 * Validation errors are shown locally and the value is left unchanged.
 */
@Component({
  selector: 'app-field-file',
  imports: [FieldShell, Icon, TranslatePipe],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FieldFile), multi: true },
  ],
  styleUrl: './field-dropzone.scss',
  template: `
    <app-field-shell
      [control_id]="uid"
      [label]="label()"
      [help_text]="helpText()"
      [error]="shown_error()"
      [required]="required()"
    >
      <label
        class="field-dropzone"
        [class.is-dragging]="dragging()"
        [class.is-disabled]="disabled()"
        [class.is-invalid]="!!shown_error()"
        (dragover)="on_drag_over($event)"
        (dragleave)="dragging.set(false)"
        (drop)="on_drop($event)"
      >
        <app-icon name="cloud-upload" class="fs-2 text-primary" />
        <span class="small fw-semibold">{{ 'field.upload.prompt' | translate }}</span>
        @if (hint()) {
          <small class="text-body-secondary">{{ hint() | translate }}</small>
        }
        <input
          class="visually-hidden"
          type="file"
          [id]="uid"
          [attr.accept]="accept() || null"
          [multiple]="multiple()"
          [required]="required() && files().length === 0"
          [disabled]="disabled() || readOnly()"
          [attr.aria-describedby]="described_by()"
          [attr.aria-invalid]="shown_error() ? 'true' : null"
          (change)="on_select($event)"
          (blur)="touch()"
        />
      </label>
      @if (files().length) {
        <ul class="list-unstyled d-grid gap-2 mt-2 mb-0">
          @for (file of files(); track $index) {
            <li class="d-flex align-items-center gap-2 border rounded p-2 bg-body">
              <app-icon name="file-check" class="text-success fs-5" />
              <span class="flex-grow-1 text-truncate" [title]="file.name">{{ file.name }}</span>
              <small class="text-body-secondary">{{ format_size(file.size) }}</small>
              <button
                type="button"
                class="btn btn-sm btn-link text-danger p-0 d-inline-flex"
                [attr.aria-label]="'field.upload.remove' | translate"
                [disabled]="disabled() || readOnly()"
                (click)="remove($index)"
              >
                <app-icon name="file-x" class="fs-5" />
              </button>
            </li>
          }
        </ul>
      }
    </app-field-shell>
  `,
})
export class FieldFile extends FieldBase<File | File[] | null> {
  readonly accept = input('');
  readonly multiple = input(false);
  /** Maximum size per file in bytes; `null` disables the check. */
  readonly maxFileSize = input<number | null>(null);
  /** Translation key or plain text shown inside the dropzone. */
  readonly hint = input('');

  protected readonly dragging = signal(false);
  protected readonly files = computed<File[]>(() => {
    const value = this.current();
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  });
  protected readonly format_size = formatFileSize;

  constructor() {
    super(null);
  }

  protected on_select(event: Event): void {
    const input_element = event.target as HTMLInputElement;
    this.accept_files(Array.from(input_element.files ?? []));
    input_element.value = '';
    this.touch();
  }

  protected on_drag_over(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled() && !this.readOnly()) this.dragging.set(true);
  }

  protected on_drop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.accept_files(Array.from(event.dataTransfer?.files ?? []));
    this.touch();
  }

  protected remove(index: number): void {
    this.local_error.set(null);
    if (!this.multiple()) return this.commit(null);
    this.commit(this.files().filter((_, file_index) => file_index !== index));
  }

  private accept_files(selected: File[]): void {
    if (this.disabled() || this.readOnly() || selected.length === 0) return;
    const candidates = this.multiple() ? selected : selected.slice(0, 1);
    for (const file of candidates) {
      const failure = validateFile(file, {
        accept: this.accept(),
        max_size: this.maxFileSize(),
      });
      if (failure) {
        this.local_error.set(failure === 'type' ? 'field.errors.type' : 'field.errors.size');
        return;
      }
    }
    this.local_error.set(null);
    this.commit(this.multiple() ? [...this.files(), ...candidates] : candidates[0]);
  }
}
