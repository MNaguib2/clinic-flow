
import {
  Component,
  computed,
  forwardRef,
  input,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';

import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { Icon } from '../icon/icon';
import { UiButtonComponent } from '../ui-button/ui-button.component';
import { FieldBase } from './field-base';
import { FieldShell } from './field-shell';

import {
  formatFileSize,
  validateFile,
} from './file-validation';

@Component({
  selector: 'app-field-file',
  standalone: true,
  imports: [
    FieldShell,
    Icon,
    TranslatePipe,
    UiButtonComponent,
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
      <div
        class="field-dropzone field-file-dropzone"
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

        <app-ui-button
          type="button"
          variant="outline"
          [disabled]="disabled() || readOnly()"
          (click)="on_choose_button_click($event)"
        >
          <app-icon name="folder-open" />

          {{
            (
              files().length > 0
                ? 'field.upload.replace'
                : 'field.upload.chooseFile'
            ) | translate
          }}
        </app-ui-button>

        <input
          #fileInput
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
      </div>

      @if (files().length > 0 && showPreview()) {
        <ul class="field-file-list">
          @for (file of files(); track file; let i = $index) {
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

              <div class="field-file-item__actions">
                <button
                  type="button"
                  class="field-file-item__action"
                  [attr.aria-label]="'field.upload.preview' | translate"
                  (click)="preview(file, $event)"
                >
                  <app-icon name="eye" />
                </button>

                <button
                  type="button"
                  class="field-file-item__action"
                  [attr.aria-label]="'field.upload.download' | translate"
                  (click)="download(file, $event)"
                >
                  <app-icon name="download" />
                </button>

                <button
                  type="button"
                  class="field-file-item__remove"
                  [attr.aria-label]="'field.upload.remove' | translate"
                  [disabled]="disabled() || readOnly()"
                  (click)="remove(i, $event)"
                >
                  <app-icon name="trash-2" />
                </button>
              </div>
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

  readonly showPreview = input(true);

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

  private readonly file_input =
    viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  constructor() {
    super(null);
  }

  // ========================================
  // File input
  // ========================================

  protected select_file(): void {
    if (this.disabled() || this.readOnly()) {
      return;
    }

    this.file_input().nativeElement.click();
  }

  protected on_choose_button_click(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.select_file();
  }

  protected on_select(event: Event): void {
    const input_element = event.target as HTMLInputElement;

    this.accept_files(
      Array.from(input_element.files ?? []),
    );

    // Allow selecting the same file again.
    input_element.value = '';

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
  // Preview
  // ========================================

  protected preview(file: File, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const url = URL.createObjectURL(file);

    const preview_window = window.open(url, '_blank');

    if (!preview_window) {
      URL.revokeObjectURL(url);
      return;
    }

    preview_window.addEventListener(
      'load',
      () => URL.revokeObjectURL(url),
      { once: true },
    );
  }

  // ========================================
  // Download
  // ========================================

  protected download(file: File, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const url = URL.createObjectURL(file);
    const link = document.createElement('a');

    link.href = url;
    link.download = file.name;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  // ========================================
  // Remove file
  // ========================================

  protected remove(index: number, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled() || this.readOnly()) {
      return;
    }

    this.local_error.set(null);

    if (!this.multiple()) {
      this.commit(null);
    } else {
      this.commit(
        this.files().filter(
          (_, file_index) => file_index !== index,
        ),
      );
    }

    this.touch();
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
