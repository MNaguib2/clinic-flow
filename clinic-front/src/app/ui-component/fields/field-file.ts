
import {
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';

import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { Icon } from '../icon/icon';
import { FieldBase } from './field-base';
import { FieldShell } from './field-shell';

import {
  formatFileSize,
  validateFile,
} from './file-validation';

/**
 * Value:
 * - File | null
 * - File[] when multiple is enabled.
 *
 * Multiple selections are appended.
 * Invalid files do not change the current value.
 */
@Component({
  selector: 'app-field-file',
  standalone: true,
  imports: [
    FieldShell,
    Icon,
    TranslatePipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FieldFile),
      multi: true,
    },
  ],
  styleUrl: './field-dropzone.scss',
  template: `
    <app-field-shell
      [control_id]="uid"
      [label]="label()"
      [help_text]="helpText()"
      [error]="error()"
      [required]="required()"
    >
      <!-- Dropzone -->
      <label
        class="field-dropzone"
        [class.field-dropzone--dragging]="dragging()"
        [class.field-dropzone--disabled]="disabled() || readOnly()"
        [class.field-dropzone--invalid]="!!error().length"
        [class.field-dropzone--has-files]="files().length > 0"
        [attr.aria-disabled]="disabled() || readOnly()"
        (dragover)="on_drag_over($event)"
        (dragleave)="on_drag_leave($event)"
        (drop)="on_drop($event)"
      >
        <span class="field-dropzone__icon">
          <app-icon name="cloud-upload" />
        </span>

        <span class="field-dropzone__content">
          <span class="field-dropzone__title">
            {{ 'field.upload.prompt' | translate }}
          </span>

          @if (hint()) {
            <span class="field-dropzone__hint">
              {{ hint() | translate }}
            </span>
          }
        </span>

        <input
          class="field-dropzone__input"
          type="file"
          [id]="uid"
          [attr.accept]="accept() || null"
          [multiple]="multiple()"
          [required]="required() && files().length === 0"
          [disabled]="disabled() || readOnly()"
          [attr.aria-describedby]="described_by()"
          [attr.aria-invalid]="error().length ? 'true' : null"
          (change)="on_select($event)"
          (blur)="touch()"
        />
      </label>

      <!-- Selected files -->
      @if (files().length) {
        <ul class="field-file-list">
          @for (file of files(); track $index) {
            <li class="field-file-item">
              <span class="field-file-item__icon">
                <app-icon name="file-check" />
              </span>

              <span class="field-file-item__info">
                <span
                  class="field-file-item__name"
                  [title]="file.name"
                >
                  {{ file.name }}
                </span>

                <small class="field-file-item__size">
                  {{ format_size(file.size) }}
                </small>
              </span>

              <button
                type="button"
                class="field-file-item__remove"
                [attr.aria-label]="'field.upload.remove' | translate"
                [disabled]="disabled() || readOnly()"
                (click)="remove($index)"
              >
                <app-icon name="file-x" />
              </button>
            </li>
          }
        </ul>
      }
    </app-field-shell>
  `,
})
export class FieldFile extends FieldBase<File | File[] | null> {

  // ========================================
  // Inputs
  // ========================================

  readonly accept = input('');
  readonly multiple = input(false);

  /** Maximum size per file in bytes. Null disables the check. */
  readonly maxFileSize = input<number | null>(null);

  /** Translation key or text shown inside the dropzone. */
  readonly hint = input('');

  // ========================================
  // State
  // ========================================

  protected readonly dragging = signal(false);

  protected readonly files = computed<File[]>(() => {
    const value = this.current();

    if (!value) {
      return [];
    }

    return Array.isArray(value) ? value : [value];
  });

  protected readonly format_size = formatFileSize;

  constructor() {
    super(null);
  }

  // ========================================
  // File input
  // ========================================

  protected on_select(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    this.accept_files(
      Array.from(inputElement.files ?? []),
    );

    // Allow selecting the same file again.
    inputElement.value = '';

    this.touch();
  }

  // ========================================
  // Drag & Drop
  // ========================================

  protected on_drag_over(event: DragEvent): void {
    event.preventDefault();

    if (this.disabled() || this.readOnly()) {
      return;
    }

    this.dragging.set(true);
  }

  protected on_drag_leave(event: DragEvent): void {
    event.preventDefault();

    this.dragging.set(false);
  }

  protected on_drop(event: DragEvent): void {
    event.preventDefault();

    this.dragging.set(false);

    if (this.disabled() || this.readOnly()) {
      return;
    }

    this.accept_files(
      Array.from(event.dataTransfer?.files ?? []),
    );

    this.touch();
  }

  // ========================================
  // Remove file
  // ========================================

  protected remove(index: number): void {
    if (this.disabled() || this.readOnly()) {
      return;
    }

    this.local_error.set(null);

    if (!this.multiple()) {
      this.commit(null);
      return;
    }

    this.commit(
      this.files().filter(
        (_, fileIndex) => fileIndex !== index,
      ),
    );
  }

  // ========================================
  // Validation & Commit
  // ========================================

  private accept_files(selected: File[]): void {
    if (
      this.disabled() ||
      this.readOnly() ||
      selected.length === 0
    ) {
      return;
    }

    const candidates = this.multiple()
      ? selected
      : selected.slice(0, 1);

    for (const file of candidates) {
      const failure = validateFile(file, {
        accept: this.accept(),
        max_size: this.maxFileSize(),
      });

      if (failure) {
        this.local_error.set(
          failure === 'type'
            ? ['field.errors.type']
            : ['field.errors.size'],
        );

        return;
      }
    }

    this.local_error.set(null);

    this.commit(
      this.multiple()
        ? [...this.files(), ...candidates]
        : candidates[0],
    );
  }
}
