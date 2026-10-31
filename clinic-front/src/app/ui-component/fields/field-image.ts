import { Component, effect, forwardRef, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Icon } from '../icon/icon';
import { FieldBase } from './field-base';
import { FieldShell } from './field-shell';
import { IMAGE_ACCEPT, validateFile } from './file-validation';

/** Value: `File | null`. Errors are arrays of strings. Previews use object URLs that are revoked on replace/destroy. */
@Component({
  selector: 'app-field-image',
  imports: [FieldShell, Icon, TranslatePipe],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FieldImage), multi: true },
  ],
  styleUrls: ['./field-dropzone.scss'],
  template: `
    <app-field-shell
      [control_id]="uid"
      [label]="label()"
      [help_text]="helpText()"
      [error]="error()"
      [required]="required()"
    >
      <label
        class="field-dropzone"
        [class.is-dragging]="dragging()"
        [class.is-disabled]="disabled()"
        [class.is-invalid]="!!error().length"
        (dragover)="on_drag_over($event)"
        (dragleave)="dragging.set(false)"
        (drop)="on_drop($event)"
      >
        @if (preview_url(); as url) {
          <img class="field-preview" [src]="url" [alt]="previewAlt() | translate" />
        } @else {
          <app-icon name="image" class="fs-2 text-primary" />
        }
        <span class="small fw-semibold d-inline-flex align-items-center gap-1">
          <app-icon name="cloud-upload" class="fs-6 text-primary" />
          {{ (preview_url() ? 'field.upload.replace' : 'field.upload.prompt') | translate }}
        </span>
        @if (hint()) {
          <small class="text-body-secondary">{{ hint() | translate }}</small>
        }
        <input
          class="visually-hidden"
          type="file"
          [id]="uid"
          [attr.accept]="accept() || null"
          [required]="required() && !current()"
          [disabled]="disabled() || readOnly()"
          [attr.aria-describedby]="described_by()"
          [attr.aria-invalid]="error().length ? 'true' : null"
          (change)="on_select($event)"
          (blur)="touch()"
        />
      </label>
      @if (current(); as file) {
        <div class="d-flex align-items-center gap-2 mt-2">
          <small class="flex-grow-1 text-truncate" [title]="file.name">{{ file.name }}</small>
          <button
            type="button"
            class="btn btn-sm btn-link text-danger p-0 d-inline-flex align-items-center gap-1"
            [disabled]="disabled() || readOnly()"
            (click)="clear()"
          >
            <app-icon name="x" />
            {{ 'field.upload.removeImage' | translate }}
          </button>
        </div>
      }
    </app-field-shell>
  `,
})
export class FieldImage extends FieldBase<File | null> {
  readonly accept = input(IMAGE_ACCEPT);
  /** Maximum size in bytes; `null` disables the check. */
  readonly maxFileSize = input<number | null>(5 * 1024 * 1024);
  readonly hint = input('');
  readonly previewAlt = input('field.upload.previewAlt');

  protected readonly dragging = signal(false);
  protected readonly preview_url = signal<string | null>(null);

  constructor() {
    super(null);
    effect((on_cleanup) => {
      const file = this.current();
      if (!file) {
        this.preview_url.set(null);
        return;
      }
      const url = URL.createObjectURL(file);
      this.preview_url.set(url);
      on_cleanup(() => URL.revokeObjectURL(url));
    });
  }

  protected on_select(event: Event): void {
    const input_element = event.target as HTMLInputElement;
    this.accept_file(input_element.files?.[0]);
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
    this.accept_file(event.dataTransfer?.files?.[0]);
    this.touch();
  }

  protected clear(): void {
    this.local_error.set(null);
    this.commit(null);
  }

  private accept_file(file: File | undefined): void {
    if (!file || this.disabled() || this.readOnly()) return;
    const failure = validateFile(file, { accept: this.accept(), max_size: this.maxFileSize() });
    if (failure) {
      this.local_error.set(failure === 'type' ? ['field.errors.type'] : ['field.errors.size']);
      return;
    }
    this.local_error.set(null);
    this.commit(file);
  }
}
