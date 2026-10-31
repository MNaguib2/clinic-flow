import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language/language.service';

import { FieldShell } from '../fields/field-shell';
import { Icon } from '../icon/icon';
import { OverlayPanel } from '../overlay-panel/overlay-panel';

import {
  DateLike,
  DateMode,
  DateRangeInput,
  DateRangeValue,
  DateRestrictions,
  dateToIso,
  decodeDates,
  encodeDates,
  fromIsoValue,
  hasDisabledBetween,
  isDateDisabled,
  parseIso,
  toIso,
  toIsoDate,
  toIsoValue,
} from './date-utils';

// ==========================================
// Types
// ==========================================

/** Everything the picker can receive or emit. */
export type DatePickerValue = Date | Date[] | DateRangeValue | string | null;

interface DayCell {
  iso: string;
  ariaLabel: string;
  day: number;
  /** True for leading/trailing days that belong to another month. */
  outside: boolean;
  disabled: boolean;
  today: boolean;
  selected: boolean;
  inRange: boolean;
}

interface CalendarView {
  year: number;
  month: number;
}

const monthIndex = (year: number, month: number): number => year * 12 + month;

let nextDatePickerId = 0;

// ==========================================
// Format helpers
// ==========================================

/** Supported tokens: yyyy, yy, MMMM, MMM, MM, M, dd, d */
function formatByPattern(date: Date, pattern: string, locale: string): string {
  const pad = (value: number): string => String(value).padStart(2, '0');

  const monthName = (style: 'long' | 'short'): string =>
    new Intl.DateTimeFormat(locale, { month: style }).format(date);

  return pattern.replace(/yyyy|yy|MMMM|MMM|MM|M|dd|d/g, (token) => {
    switch (token) {
      case 'yyyy': return String(date.getFullYear());
      case 'yy':   return String(date.getFullYear()).slice(-2);
      case 'MMMM': return monthName('long');
      case 'MMM':  return monthName('short');
      case 'MM':   return pad(date.getMonth() + 1);
      case 'M':    return String(date.getMonth() + 1);
      case 'dd':   return pad(date.getDate());
      default:     return String(date.getDate());
    }
  });
}

const NUMERIC_TOKENS = /yyyy|yy|MM|M|dd|d/g;

/** Converts Arabic-Indic and Persian digits to Latin digits. */
function normalizeDigits(text: string): string {
  return text
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Pattern must contain day, month and year, with numeric tokens only. */
function isNumericPattern(pattern: string): boolean {
  return (
    !pattern.includes('MMM') &&
    /d/.test(pattern) &&
    /M/.test(pattern) &&
    /y/.test(pattern)
  );
}

/** Parses typed text with the pattern. Returns 'YYYY-MM-DD' or undefined if invalid. */
const SEPARATORS = /[-/.\s]/;

/** Parses typed text with the pattern. Returns 'YYYY-MM-DD' or undefined if invalid. */
function parseByPattern(text: string, pattern: string): string | undefined {
  const order: string[] = [];
  const lenient = /[^dMy]/.test(pattern); // pattern has separators between tokens
  let source = '';
  let last = 0;

  for (const match of pattern.matchAll(NUMERIC_TOKENS)) {
    const index = match.index ?? 0;
    const token = match[0];

    source += literalToRegex(pattern.slice(last, index));

    if (token === 'yyyy') {
      source += '(\\d{4})';
    } else if (token === 'yy') {
      source += '(\\d{2})';
    } else {
      // d, dd, M, MM: accept 1 or 2 digits when separators exist (1-10-1994),
      // stay strict for separator-less patterns like ddMMyyyy.
      source += lenient ? '(\\d{1,2})' : token.length === 2 ? '(\\d{2})' : '(\\d{1,2})';
    }

    order.push(token);
    last = index + token.length;
  }

  source += literalToRegex(pattern.slice(last));

  const result = new RegExp(`^${source}$`).exec(
    normalizeDigits(text.trim()).replace(/\s+/g, ' '),
  );

  if (!result) {
    return undefined;
  }

  let year: number | undefined;
  let month: number | undefined;
  let day: number | undefined;

  order.forEach((token, i) => {
    const value = Number(result[i + 1]);

    if (token === 'yyyy') year = value;
    else if (token === 'yy') year = expandTwoDigitYear(value);
    else if (token[0] === 'M') month = value;
    else day = value;
  });

  if (year === undefined || month === undefined || day === undefined) {
    return undefined;
  }

  const iso = toIso(year, month - 1, day);

  // parseIso rejects impossible dates such as 31-09-2026.
  return parseIso(iso) ? iso : undefined;
}

/** Any separator char in the pattern (- / . space) accepts any other of them. */
function literalToRegex(literal: string): string {
  let out = '';
  let inSeparator = false;

  for (const char of literal) {
    if (SEPARATORS.test(char)) {
      if (!inSeparator) out += '\\s*[-/.\\s]\\s*';
      inSeparator = true;
    } else {
      out += escapeRegExp(char);
      inSeparator = false;
    }
  }

  return out;
}

/** 94 -> 1994, 26 -> 2026, 40 -> 2040 (window: up to 10 years ahead). */
function expandTwoDigitYear(value: number): number {
  const currentYear = new Date().getFullYear();
  const century = Math.floor(currentYear / 100) * 100;
  const year = century + value;

  return year > currentYear + 10 ? year - 100 : year;
}

// ==========================================
// Component
// ==========================================

@Component({
  selector: 'app-date-picker',

  imports: [
    FieldShell,
    Icon,
    OverlayPanel,
    TranslatePipe,
  ],

  changeDetection: ChangeDetectionStrategy.OnPush,

  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePicker),
      multi: true,
    },
  ],

  styleUrls: [
    '../fields/field-icon.scss',
    './date-picker.scss',
  ],

  template: `
    <app-field-shell
      [control_id]="uid"
      [label]="label()"
      [help_text]="helpText()"
      [error]="shownError()"
      [required]="required()"
    >
      <app-overlay-panel
        #overlay
        [block]="true"
        [maxHeight]="'none'"
        placement="bottom-start"
        [disabled]="disabled() || readOnly()"
        panelRole="dialog"
        [ariaLabel]="'fields.date.placeholder' | translate"
        (closed)="touch()"
      >
        <!-- Trigger -->
        <div
          overlayPanelTrigger
          class="field-input__control"
        >
          @if (icon()) {
            <app-icon
              [name]="icon()"
              class="field-input__icon"
              aria-hidden="true"
            />
          }

          @if (canType()) {
            <input
              #dateTrigger
              type="text"
              inputmode="numeric"
              autocomplete="off"
              class="field-input__native date-field__button"
              [class.field-input__native--icon]="!!icon()"
              [class.field-input__native--invalid]="shownError().length > 0"
              [id]="uid"
              [value]="inputText()"
              [placeholder]="typedFormat()"
              [disabled]="disabled()"
              [readOnly]="readOnly()"
              [attr.aria-describedby]="described_by()"
              [attr.aria-invalid]="shownError().length > 0 ? 'true' : null"
              (input)="onTyping($event)"
              (keydown)="onTypeKeydown($event)"
              (blur)="applyTyped()"
            />
          } @else {
            <button
              #dateTrigger
              type="button"
              class="field-input__native date-field__button"
              [class.field-input__native--icon]="!!icon()"
              [class.field-input__native--invalid]="shownError().length > 0"
              [class.date-field__button--empty]="!display()"
              [id]="uid"
              [disabled]="disabled() || readOnly()"
              aria-haspopup="dialog"
              [attr.aria-expanded]="overlay.open()"
              [attr.aria-describedby]="described_by()"
              [attr.aria-invalid]="shownError().length > 0 ? 'true' : null"
            >
              <span class="date-field__value">
                {{ display() || (placeholder() | translate) }}
              </span>
            </button>
          }
        </div>

        <!-- Calendar -->
        <div class="date-picker">

          <!-- Header -->
          <div class="date-picker__header">
            <button
            style="transform: rotate(-90deg);"
              type="button"
              class="date-picker__nav date-picker__nav--previous"
              [disabled]="!canGoPrevious()"
              (click)="shiftMonth(-12)"
              [attr.aria-label]="'fields.date.previousYear' | translate"
            >
              <span class="date-picker__chevrons" aria-hidden="true"></span>
            </button>

            <button
            style="transform: rotate(-90deg);"
              type="button"
              class="date-picker__nav date-picker__nav--previous"
              [disabled]="!canGoPrevious()"
              (click)="shiftMonth(-1)"
              [attr.aria-label]="'fields.date.previousMonth' | translate"
            >
              <span class="date-picker__chevron" aria-hidden="true"></span>
            </button>

            <strong
              class="date-picker__title"
              aria-live="polite"
              aria-atomic="true"
            >
              {{ title() }}
            </strong>

            <button
            style="transform: rotate(90deg);"
              type="button"
              class="date-picker__nav date-picker__nav--next"
              [disabled]="!canGoNext()"
              (click)="shiftMonth(1)"
              [attr.aria-label]="'fields.date.nextMonth' | translate"
            >
              <span class="date-picker__chevron" aria-hidden="true"></span>
            </button>

            <button
            style="transform: rotate(90deg);"
              type="button"
              class="date-picker__nav date-picker__nav--next"
              [disabled]="!canGoNext()"
              (click)="shiftMonth(12)"
              [attr.aria-label]="'fields.date.nextYear' | translate"
            >
              <span class="date-picker__chevrons" aria-hidden="true"></span>
            </button>
          </div>

          <div
            #calendar
            class="date-picker__calendar"
            role="grid"
            [attr.aria-label]="title()"
            (keydown)="onCalendarKeydown($event)"
          >
            <div class="date-picker__grid date-picker__weekdays" role="row">
              @for (weekday of weekdays(); track $index) {
                <span
                  class="date-picker__weekday"
                  role="columnheader"
                  [attr.aria-label]="weekday.long"
                >
                  {{ weekday.short }}
                </span>
              }
            </div>

            <div class="date-picker__days" role="rowgroup">
              @for (week of weeks(); track $index) {
                <div class="date-picker__grid date-picker__week" role="row">
                  @for (cell of week; track cell.iso) {
                    <div
                      class="date-picker__day-cell"
                      role="gridcell"
                      [attr.aria-selected]="cell.selected || cell.inRange"
                    >
                      <button
                        type="button"
                        class="date-picker__day"
                        [class.date-picker__day--outside]="cell.outside"
                        [class.date-picker__day--today]="cell.today"
                        [class.date-picker__day--selected]="cell.selected"
                        [class.date-picker__day--in-range]="cell.inRange"
                        [disabled]="cell.disabled"
                        [attr.data-date]="cell.iso"
                        [attr.tabindex]="cell.iso === tabStopDate() ? 0 : -1"
                        [attr.aria-label]="cell.ariaLabel"
                        [attr.aria-current]="cell.today ? 'date' : null"
                        (focus)="activeDate.set(cell.iso)"
                        (click)="pick(cell.iso)"
                      >
                        {{ cell.day }}
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Footer -->
          <div class="date-picker__footer">
            <button
              type="button"
              class="date-picker__link"
              [disabled]="today_disabled()"
              (click)="pickToday()"
            >
              {{ 'fields.date.today' | translate }}
            </button>

            @if (!required()) {
              <button
                type="button"
                class="date-picker__link"
                (click)="clear()"
              >
                {{ 'fields.date.clear' | translate }}
              </button>
            }
          </div>
        </div>
      </app-overlay-panel>
    </app-field-shell>
  `,
})
export class DatePicker implements ControlValueAccessor {

  // ========================================
  // Inputs (previously from FieldBase)
  // ========================================

  /** Translation key or plain text. */
  readonly label = input<string>('');

  readonly helpText = input<string>('');

  /** Translation key or plain text; shown when set. */
  readonly error = input<string | null>(null);

  readonly required = input(false, { transform: booleanAttribute });

  readonly readOnly = input(false, { alias: 'readonly', transform: booleanAttribute });

  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });

  /** Seeds the value without Forms. Accepts Date, Date[], { start, end } or ISO string. */
  readonly initialValue = input<DatePickerValue | undefined>(undefined);

  // ========================================
  // Outputs (previously from FieldBase)
  // ========================================

  /** Emits the same value the form receives. */
  readonly changed = output<DatePickerValue>();

  readonly blurred = output<void>();

  // ========================================
  // Date picker inputs
  // ========================================

  readonly dateMode = input<DateMode>('single');

  readonly placeholder = input('fields.date.placeholder');

  /** What the form receives: Date objects (default) or ISO strings. */
  readonly valueFormat = input<'date' | 'iso'>('date');

  /** Display only. Pattern ('dd/MM/yyyy') or Intl options. Default: medium date. */
  readonly displayFormat = input<string | Intl.DateTimeFormatOptions>();

  /** Let the user type the date using `displayFormat` (single mode, numeric pattern only). */
  readonly allowTyping = input(false, { transform: booleanAttribute });

  /** Date objects or ISO strings (YYYY-MM-DD). */
  readonly min = input<DateLike>();

  readonly max = input<DateLike>();

  readonly disabledDates = input<readonly DateLike[]>([]);

  /** 0 = Sunday ... 6 = Saturday */
  readonly disabledWeekdays = input<readonly number[]>([]);

  readonly disabledRanges = input<readonly DateRangeInput[]>([]);

  readonly icon = input('calendar');

  // ========================================
  // Dependencies
  // ========================================

  private readonly overlay =
    viewChild.required<OverlayPanel>('overlay');

  private readonly calendar =
    viewChild.required<ElementRef<HTMLElement>>('calendar');

  /** A button, or a text input when typing is enabled. */
  private readonly dateTrigger =
    viewChild.required<ElementRef<HTMLElement>>('dateTrigger');

  private readonly language = inject(LanguageService);

  private readonly translate = inject(TranslateService);

  private readonly destroyRef = inject(DestroyRef);

  private readonly platformId = inject(PLATFORM_ID);

  // ========================================
  // Form state
  // ========================================

  protected readonly uid = `date-picker-${nextDatePickerId++}`;

  /** Latest value (written by Forms, initialValue or user selection). */
  private readonly value = signal<unknown>(null);

  /** Only values coming from outside (Forms / initialValue); used to sync the view. */
  private readonly external = signal<unknown>(null);

  /** Internal encoded ISO string: '', 'a', 'a/b' or 'a,b'. */
  private readonly current = computed(() =>
    toIsoValue(this.dateMode(), this.value()),
  );

  private readonly formsDisabled = signal(false);

  protected readonly disabled = computed(
    () => this.disabledInput() || this.formsDisabled(),
  );

  private onChange: (value: unknown) => void = () => undefined;

  private onTouched: () => void = () => undefined;

  // ========================================
  // Typing state
  // ========================================

  /** Text the user is currently typing (null = show the formatted value). */
  private readonly draft = signal<string | null>(null);

  /** Error produced by typing (wrong format, disabled date). */
  private readonly typedError = signal<string | null>(null);

  protected readonly shownError = computed(
    () => [this.typedError(), this.error()].filter(
      (message): message is string => Boolean(message),
    ),
  );

  protected readonly canType = computed(() => {
    const format = this.displayFormat();

    return (
      this.allowTyping() &&
      this.dateMode() === 'single' &&
      typeof format === 'string' &&
      isNumericPattern(format)
    );
  });

  protected readonly typedFormat = computed(() => {
    const format = this.displayFormat();

    return typeof format === 'string' ? format : '';
  });

  protected readonly described_by = computed(() => {
    const ids = [
      this.helpText() ? `${this.uid}-help` : '',
      this.shownError().length > 0 ? `${this.uid}-error` : '',
    ].filter(Boolean);

    return ids.length ? ids.join(' ') : null;
  });

  // ========================================
  // Calendar state
  // ========================================

  private readonly view = signal<CalendarView>(
    this.monthOf(new Date()),
  );

  // ========================================
  // Locale
  // ========================================

  private readonly locale = computed(() =>
    this.language.language() === 'ar'
      ? 'ar-u-nu-latn'
      : 'en',
  );

  private readonly dateFormatter = computed(() => {
    const format = this.displayFormat();

    return new Intl.DateTimeFormat(
      this.locale(),
      typeof format === 'object' ? format : { dateStyle: 'medium' },
    );
  });

  private readonly monthFormatter = computed(
    () =>
      new Intl.DateTimeFormat(this.locale(), {
        month: 'long',
        year: 'numeric',
      }),
  );

  private readonly weekdayFormatter = computed(
    () => new Intl.DateTimeFormat(this.locale(), { weekday: 'short' }),
  );

  private readonly fullWeekdayFormatter = computed(
    () => new Intl.DateTimeFormat(this.locale(), { weekday: 'long' }),
  );

  private readonly fullDateFormatter = computed(
    () => new Intl.DateTimeFormat(this.locale(), { dateStyle: 'full' }),
  );

  // ========================================
  // Selected dates
  // ========================================

  private readonly selected = computed(() =>
    decodeDates(this.dateMode(), this.current()),
  );

  private readonly selectedSet = computed(
    () => new Set(this.selected()),
  );

  /** Inputs normalised to ISO strings, so Date objects and strings both work. */
  private readonly restrictions = computed<DateRestrictions>(() => ({
    min: toIsoDate(this.min()),
    max: toIsoDate(this.max()),
    disabledDates: this.disabledDates()
      .map((value) => toIsoDate(value))
      .filter((iso): iso is string => !!iso),
    disabledWeekdays: this.disabledWeekdays(),
    disabledRanges: this.disabledRanges().map((range) => ({
      from: toIsoDate(range.from),
      to: toIsoDate(range.to),
    })),
  }));

  // ========================================
  // Month bounds (from min / max)
  // ========================================

  private readonly monthBounds = computed(() => {
    const { min, max } = this.restrictions();
    const minDate = parseIso(min);
    const maxDate = parseIso(max);

    return {
      first: minDate
        ? monthIndex(minDate.getFullYear(), minDate.getMonth())
        : -Infinity,
      last: maxDate
        ? monthIndex(maxDate.getFullYear(), maxDate.getMonth())
        : Infinity,
    };
  });

  protected readonly canGoPrevious = computed(() => {
    const { year, month } = this.view();

    return monthIndex(year, month) > this.monthBounds().first;
  });

  protected readonly canGoNext = computed(() => {
    const { year, month } = this.view();

    return monthIndex(year, month) < this.monthBounds().last;
  });

  // ========================================
  // Display
  // ========================================

  protected readonly display = computed(() => {
    const format = this.displayFormat();
    const formatter = this.dateFormatter();
    const locale = this.locale();

    const separator =
      this.dateMode() === 'range'
        ? ' – '
        : locale.startsWith('ar')
          ? '، '
          : ', ';

    return this.selected()
      .map((iso) => {
        const date = parseIso(iso);

        if (!date) {
          return iso;
        }

        return typeof format === 'string'
          ? formatByPattern(date, format, locale)
          : formatter.format(date);
      })
      .join(separator);
  });

  /** Text shown inside the typing input. */
  protected readonly inputText = computed(
    () => this.draft() ?? this.display(),
  );

  protected readonly title = computed(() => {
    const { year, month } = this.view();

    return this.monthFormatter().format(new Date(year, month, 1));
  });

  // ========================================
  // Weekdays
  // ========================================

  private readonly weekStart = computed(() =>
    this.locale().startsWith('ar') ? 6 : 0,
  );

  protected readonly weekdays = computed(() => {
    const formatter = this.weekdayFormatter();
    const fullFormatter = this.fullWeekdayFormatter();
    const start = this.weekStart();

    // 2023-01-01 is a Sunday.
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(2023, 0, 1 + ((start + index) % 7));

      return {
        short: formatter.format(date),
        long: fullFormatter.format(date),
      };
    });
  });

  // ========================================
  // Today
  // ========================================

  private readonly today = signal(dateToIso(new Date()));

  protected readonly activeDate = signal(this.today());

  protected readonly today_disabled = computed(() =>
    isDateDisabled(this.today(), this.restrictions()),
  );

  // ========================================
  // Calendar cells
  // ========================================

  protected readonly cells = computed<DayCell[]>(() => {
    const { year, month } = this.view();

    const restrictions = this.restrictions();
    const selectedSet = this.selectedSet();
    const [start, end] = this.selected();
    const isRange = this.dateMode() === 'range';
    const today = this.today();
    const formatter = this.fullDateFormatter();
    const viewIndex = monthIndex(year, month);

    // How many days of the previous month are shown before the 1st.
    const offset =
      (new Date(year, month, 1).getDay() - this.weekStart() + 7) % 7;

    // Only as many weeks as the month needs (4, 5 or 6).
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weekCount = Math.ceil((offset + daysInMonth) / 7);

    return Array.from({ length: weekCount * 7 }, (_, index) => {
      const date = new Date(year, month, 1 - offset + index);

      const iso = dateToIso(date);
      const dateIndex = monthIndex(date.getFullYear(), date.getMonth());

      return {
        iso,
        ariaLabel: formatter.format(date),
        day: date.getDate(),
        outside: dateIndex !== viewIndex,
        disabled: isDateDisabled(iso, restrictions),
        today: iso === today,
        selected: selectedSet.has(iso),
        inRange: isRange && !!start && !!end && iso > start && iso < end,
      };
    });
  });

  protected readonly weeks = computed(() => {
    const cells = this.cells();

    return Array.from({ length: cells.length / 7 }, (_, index) =>
      cells.slice(index * 7, index * 7 + 7),
    );
  });

  protected readonly tabStopDate = computed(() => {
    const cells = this.cells();
    const active = this.activeDate();

    return (
      cells.find((cell) => cell.iso === active && !cell.disabled)?.iso
      ?? cells.find((cell) => !cell.outside && !cell.disabled)?.iso
      ?? cells.find((cell) => !cell.disabled)?.iso
      ?? ''
    );
  });

  // ========================================
  // Constructor
  // ========================================

  constructor() {
    // initialValue seeds the value without Forms.
    effect(() => {
      const initialValue = this.initialValue();

      if (initialValue !== undefined) {
        untracked(() => {
          this.value.set(initialValue);
          this.external.set(initialValue);
        });
      }
    });

    // Move the calendar to the externally written value (not on user clicks).
    effect(() => {
      const iso = toIsoValue(this.dateMode(), this.external());

      untracked(() => this.syncViewToValue(iso));
    });

    // Keep the visible month inside [min, max].
    effect(() => {
      const { first, last } = this.monthBounds();

      untracked(() => {
        this.view.update(({ year, month }) => {
          const current = monthIndex(year, month);
          const clamped = Math.min(Math.max(current, first), last);

          return clamped === current || first > last
            ? { year, month }
            : { year: Math.floor(clamped / 12), month: clamped % 12 };
        });
      });
    });

    this.scheduleTodayRefresh();
  }

  // ========================================
  // ControlValueAccessor
  // ========================================

  /** Form -> component. Never emits. Accepts Date, Date[], { start, end } or ISO string. */
  writeValue(value: unknown): void {
    this.draft.set(null);
    this.typedError.set(null);
    this.value.set(value ?? null);
    this.external.set(value ?? null);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }

  /** User interaction: store the ISO value, send Date (or ISO) to the form. */
  private commit(iso: string): void {
    const output: DatePickerValue =
      this.valueFormat() === 'date'
        ? fromIsoValue(this.dateMode(), iso)
        : iso;

    this.draft.set(null);
    this.typedError.set(null);
    this.value.set(iso);
    this.onChange(output);
    this.changed.emit(output);
  }

  protected touch(): void {
    this.onTouched();
    this.blurred.emit();
  }

  // ========================================
  // Typing
  // ========================================

  protected onTyping(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
    this.typedError.set(null);
  }

  protected onTypeKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.applyTyped();
    }

    // Keep Space / arrows from reaching the overlay while typing.
    if (event.key !== 'Escape' && event.key !== 'Tab') {
      event.stopPropagation();
    }
  }

  /** Validate and commit the typed text (Enter or blur). */
  protected applyTyped(): void {
    const text = this.draft();
    const format = this.displayFormat();

    if (text === null || typeof format !== 'string') {
      return;
    }

    if (!text.trim()) {
      this.commit('');
      return;
    }

    const iso = parseByPattern(text, format);

    if (!iso) {
      this.typedError.set(
        this.translate.instant('fields.date.invalidFormat', { format }),
      );
      return;
    }

    if (isDateDisabled(iso, this.restrictions())) {
      this.typedError.set(this.translate.instant('fields.date.notAllowed'));
      return;
    }

    const date = parseIso(iso);

    if (date) {
      this.view.set(this.monthOf(date));
      this.activeDate.set(iso);
    }

    this.commit(iso);
  }

  // ========================================
  // Navigation
  // ========================================

  protected shiftMonth(delta: number): void {
    this.view.update(({ year, month }) => {
      const { first, last } = this.monthBounds();

      if (first > last) {
        return { year, month };
      }

      const target = Math.min(
        Math.max(monthIndex(year, month) + delta, first),
        last,
      );

      return { year: Math.floor(target / 12), month: target % 12 };
    });
  }

  protected onCalendarKeydown(event: KeyboardEvent): void {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }

    const button = event.target.closest<HTMLButtonElement>('[data-date]');
    const date = parseIso(button?.dataset['date']);

    if (!button || !date) {
      return;
    }

    const rtl = this.locale().startsWith('ar');
    const weekday = (date.getDay() - this.weekStart() + 7) % 7;
    let delta: number;

    switch (event.key) {
      case 'ArrowLeft':
        delta = rtl ? 1 : -1;
        break;
      case 'ArrowRight':
        delta = rtl ? -1 : 1;
        break;
      case 'ArrowUp':
        delta = -7;
        break;
      case 'ArrowDown':
        delta = 7;
        break;
      case 'Home':
        delta = -weekday;
        break;
      case 'End':
        delta = 6 - weekday;
        break;
      case 'PageUp':
        event.preventDefault();
        this.moveByMonth(date, event.shiftKey ? -12 : -1);
        return;
      case 'PageDown':
        event.preventDefault();
        this.moveByMonth(date, event.shiftKey ? 12 : 1);
        return;
      default:
        return;
    }

    event.preventDefault();
    this.moveByDays(date, delta);
  }

  // ========================================
  // Today / Clear
  // ========================================

  protected pickToday(): void {
    if (this.today_disabled()) {
      return;
    }

    this.pick(this.today());
  }

  protected clear(): void {
    this.commit('');
    this.closeAfterSelection();
  }

  // ========================================
  // Pick date
  // ========================================

  protected pick(iso: string): void {
    if (isDateDisabled(iso, this.restrictions())) {
      return;
    }

    const mode = this.dateMode();
    const current = this.selected();
    const pickedDate = parseIso(iso);

    if (pickedDate) {
      this.activeDate.set(iso);

      if (mode !== 'multiple') {
        this.view.set(this.monthOf(pickedDate));
      }
    }

    // Single
    if (mode === 'single') {
      this.commit(encodeDates(mode, [iso]));
      this.closeAfterSelection();
      return;
    }

    // Multiple
    if (mode === 'multiple') {
      const next = current.includes(iso)
        ? current.filter((date) => date !== iso)
        : [...current, iso].sort();

      this.commit(encodeDates(mode, next));
      return;
    }

    // Range
    const [start, end] = current;

    if (
      !start ||
      end ||
      hasDisabledBetween(start, iso, this.restrictions())
    ) {
      this.commit(encodeDates(mode, [iso]));
      return;
    }

    this.commit(
      encodeDates(mode, iso < start ? [iso, start] : [start, iso]),
    );

    this.closeAfterSelection();
  }

  // ========================================
  // Helpers
  // ========================================

  private monthOf(date: Date): CalendarView {
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
    };
  }

  private syncViewToValue(value: string | null | undefined): void {
    const firstSelected = decodeDates(this.dateMode(), value)[0];
    const date = parseIso(firstSelected);

    if (!firstSelected || !date) {
      return;
    }

    this.view.set(this.monthOf(date));
    this.activeDate.set(firstSelected);
  }

  private closeAfterSelection(): void {
    this.overlay().close();
    this.dateTrigger().nativeElement.focus();
  }

  private moveByDays(date: Date, delta: number): void {
    const candidate = new Date(date);
    const step = delta === 0 ? 0 : Math.sign(delta);

    candidate.setDate(candidate.getDate() + delta);
    this.focusEnabledDate(candidate, step);
  }

  private moveByMonth(date: Date, delta: number): void {
    const target = new Date(date.getFullYear(), date.getMonth() + delta, 1);
    const lastDay = new Date(
      target.getFullYear(),
      target.getMonth() + 1,
      0,
    ).getDate();

    target.setDate(Math.min(date.getDate(), lastDay));
    this.focusEnabledDate(target, Math.sign(delta));
  }

  private focusEnabledDate(date: Date, step: number): void {
    const candidate = new Date(date);

    for (let attempt = 0; attempt < 366; attempt += 1) {
      const iso = dateToIso(candidate);

      if (!isDateDisabled(iso, this.restrictions())) {
        this.activeDate.set(iso);
        this.view.set(this.monthOf(candidate));

        requestAnimationFrame(() => {
          this.calendar()
            .nativeElement
            .querySelector<HTMLButtonElement>(`[data-date="${iso}"]`)
            ?.focus();
        });

        return;
      }

      if (step === 0) {
        return;
      }

      candidate.setDate(candidate.getDate() + step);
    }
  }

  private scheduleTodayRefresh(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let timeout: ReturnType<typeof setTimeout> | undefined;

    const scheduleNextRefresh = (): void => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );

      timeout = setTimeout(() => {
        this.today.set(dateToIso(new Date()));
        scheduleNextRefresh();
      }, nextMidnight.getTime() - now.getTime());
    };

    scheduleNextRefresh();

    this.destroyRef.onDestroy(() => {
      if (timeout !== undefined) {
        clearTimeout(timeout);
      }
    });
  }
}
