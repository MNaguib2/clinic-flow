import {
  Component,
  effect,
  ElementRef,
  forwardRef,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { Icon } from '../icon/icon';
import { UiButtonComponent } from '../ui-button/ui-button.component';

import { FieldBase } from './field-base';
import { FieldShell } from './field-shell';

import { IMAGE_ACCEPT, validateFile } from './file-validation';

type ImageAppearance = 'default' | 'avatar' | 'cover';
type ImageValue = File | File[] | null;

type ImagePreview = {
  file: File;
  url: string;
};

@Component({
  selector: 'app-field-image',
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
      useExisting: forwardRef(() => FieldImage),
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
        class="field-dropzone"
        [class.field-dropzone--avatar]="appearance() === 'avatar'"
        [class.field-dropzone--cover]="appearance() === 'cover'"
        [class.field-dropzone--has-images]="images().length > 0"
        [class.field-dropzone--dragging]="dragging()"
        [class.field-dropzone--disabled]="disabled() || readOnly()"
        [class.field-dropzone--invalid]="!!error().length"
        [attr.aria-disabled]="disabled() || readOnly()"
        [attr.role]="appearance() === 'avatar' ? 'button' : null"
        [attr.tabindex]="appearance() === 'avatar' ? 0 : null"
        [attr.aria-label]="
          appearance() === 'avatar'
            ? ('field.upload.chooseImage' | translate)
            : null
        "
        (click)="on_dropzone_click()"
        (keydown.enter)="on_avatar_keydown($event)"
        (keydown.space)="on_avatar_keydown($event)"
        (dragover)="on_drag_over($event)"
        (dragleave)="on_drag_leave($event)"
        (drop)="on_drop($event)"
      >
        @if (images().length > 0) {
          <div class="field-image__preview-grid">
            @for (image of images(); track image.file) {
              <div class="field-image__preview-item">
                <img
                  class="field-preview"
                  [src]="image.url"
                  [alt]="previewAlt() | translate"
                />

                @if (appearance() === 'avatar') {
                  <span class="field-image__avatar-overlay">
                    <app-icon name="camera" />

                    <span>
                      {{ 'field.upload.replace' | translate }}
                    </span>
                  </span>
                }

                <button
                  type="button"
                  class="field-image__remove"
                  [disabled]="disabled() || readOnly()"
                  [attr.aria-label]="
                    'field.upload.removeImage' | translate
                  "
                  (click)="remove_image(image.file, $event)"
                >
                  <app-icon name="x" />
                </button>
              </div>
            }
          </div>
        } @else if (appearance() === 'avatar') {
          <div class="field-image__avatar-placeholder">
            <app-icon name="user" />

            <span class="field-image__avatar-overlay">
              <app-icon name="camera" />

              <span>
                {{ 'field.upload.chooseImage' | translate }}
              </span>
            </span>
          </div>
        } @else {
          <app-icon
            name="image"
            class="field-dropzone__empty-icon"
          />
        }

        @if (appearance() !== 'avatar') {
          <span class="field-dropzone__title">
            {{ 'field.upload.dropImage' | translate }}
          </span>

          <app-ui-button
            type="button"
            variant="outline"
            [disabled]="disabled() || readOnly()"
            (click)="on_choose_button_click($event)"
          >
            <app-icon name="cloud-upload" />

            {{
              (
                images().length > 0
                  ? 'field.upload.replace'
                  : 'field.upload.chooseImage'
              ) | translate
            }}
          </app-ui-button>

          @if (hint()) {
            <small class="field-dropzone__hint">
              {{ hint() | translate }}
            </small>
          }
        }

        <input
          #fileInput
          class="field-dropzone__input"
          type="file"
          [id]="uid"
          [attr.accept]="accept() || null"
          [multiple]="multiple()"
          [required]="required() && images().length === 0"
          [disabled]="disabled() || readOnly()"
          [attr.aria-describedby]="described_by()"
          [attr.aria-invalid]="error().length ? 'true' : null"
          (change)="on_select($event)"
          (blur)="touch()"
        />
      </div>

      @if (multiple() && images().length > 0) {
        <small class="field-image__count">
          {{ images().length }}
        </small>
      }
    </app-field-shell>
  `,
})
export class FieldImage extends FieldBase<ImageValue> {
  readonly accept = input(IMAGE_ACCEPT);

  readonly maxFileSize = input<number | null>(5 * 1024 * 1024);

  readonly hint = input('');

  readonly previewAlt = input('field.upload.previewAlt');

  readonly appearance = input<ImageAppearance>('default');

  readonly multiple = input(false);

  protected readonly dragging = signal(false);

  protected readonly images = signal<ImagePreview[]>([]);

  private readonly file_input =
    viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  constructor() {
    super(null);

    effect((on_cleanup) => {
      const files = this.files;

      const previews: ImagePreview[] = files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));

      this.images.set(previews);

      on_cleanup(() => {
        for (const preview of previews) {
          URL.revokeObjectURL(preview.url);
        }
      });
    });
  }

  private get files(): File[] {
    const value = this.current();

    if (!value) {
      return [];
    }

    return Array.isArray(value) ? value : [value];
  }

  protected selectFile(): void {
    if (this.disabled() || this.readOnly()) {
      return;
    }

    this.file_input().nativeElement.click();
  }

  protected on_dropzone_click(): void {
    if (this.appearance() === 'avatar') {
      this.selectFile();
    }
  }

  protected on_avatar_keydown(event: Event): void {
    if (this.appearance() !== 'avatar') {
      return;
    }

    event.preventDefault();
    this.selectFile();
  }

  protected on_choose_button_click(event: MouseEvent): void {
    event.stopPropagation();
    this.selectFile();
  }

  protected on_select(event: Event): void {
    const input_element = event.target as HTMLInputElement;

    this.accept_files(Array.from(input_element.files ?? []));

    // يسمح باختيار نفس الملف مرة أخرى بعد إزالته.
    input_element.value = '';

    this.touch();
  }

  protected on_drag_over(event: DragEvent): void {
    event.preventDefault();

    if (!this.disabled() && !this.readOnly()) {
      this.dragging.set(true);
    }
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

    this.accept_files(Array.from(event.dataTransfer?.files ?? []));
    this.touch();
  }

  protected remove_image(file: File, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled() || this.readOnly()) {
      return;
    }

    this.local_error.set(null);

    const remaining = this.files.filter((item) => item !== file);

    this.commit(this.multiple() ? remaining : null);
    this.touch();
  }

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
        this.local_error.set([
          failure === 'type'
            ? 'field.errors.type'
            : 'field.errors.size',
        ]);

        return;
      }
    }

    this.local_error.set(null);

    const next = this.multiple()
      ? [...this.files, ...candidates]
      : candidates;

    this.commit(this.multiple() ? next : next[0] ?? null);
  }
}
