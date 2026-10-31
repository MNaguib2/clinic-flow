export type DateMode = 'single' | 'range' | 'multiple';

/** Inclusive interval of ISO dates; an omitted side is open-ended. */
export interface DateInterval {
  from?: string;
  to?: string;
}

export interface DateRestrictions {
  min?: string;
  max?: string;
  disabledDates?: readonly string[];
  disabledWeekdays?: readonly number[];
  disabledRanges?: readonly DateInterval[];
}

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function toIso(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function dateToIso(date: Date): string {
  return toIso(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Parses `YYYY-MM-DD` as a local date; returns null for invalid input. */
export function parseIso(value: string | null | undefined): Date | null {
  const match = ISO_PATTERN.exec(value ?? '');
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
  const date = new Date(year, month, day);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day
    ? date
    : null;
}

/**
 * Value encoding keeps the form value a plain string:
 * single `2026-01-05`, range `2026-01-05/2026-01-09`, multiple `2026-01-05,2026-01-09`.
 */
export function decodeDates(
  mode: DateMode,
  value: string | number | null | undefined,
): string[] {
  const text = value == null ? '' : String(value);

  const separator = mode === 'range' ? '/' : ',';

  const parts = mode === 'single' ? [text] : text.split(separator);

  const dates = parts.filter((part) => parseIso(part));

  if (mode === 'range') {
    const [first, second] = dates.slice(0, 2);

    if (!first) return [];
    if (!second) return [first];

    return first <= second
      ? [first, second]
      : [second, first];
  }

  return mode === 'multiple'
    ? [...new Set(dates)].sort()
    : dates.slice(0, 1);
}

export function encodeDates(mode: DateMode, dates: readonly string[]): string {
  return dates.join(mode === 'range' ? '/' : ',');
}

export function isDateDisabled(iso: string, restrictions: DateRestrictions): boolean {
  const { min, max, disabledDates, disabledWeekdays, disabledRanges } = restrictions;
  if ((min && iso < min) || (max && iso > max)) return true;
  if (disabledDates?.includes(iso)) return true;

  const date = parseIso(iso);
  if (date && disabledWeekdays?.includes(date.getDay())) return true;

  return (
    disabledRanges?.some(
      (range) => (!range.from || iso >= range.from) && (!range.to || iso <= range.to),
    ) ?? false
  );
}

/** True when any date strictly between the two ISO dates is disabled. */
export function hasDisabledBetween(
  start: string,
  end: string,
  restrictions: DateRestrictions,
): boolean {
  const [low, high] = start <= end ? [start, end] : [end, start];
  const cursor = parseIso(low);
  const last = parseIso(high);
  if (!cursor || !last) return false;

  cursor.setDate(cursor.getDate() + 1);
  while (cursor < last) {
    if (isDateDisabled(dateToIso(cursor), restrictions)) return true;
    cursor.setDate(cursor.getDate() + 1);
  }
  return false;
}
export type DateLike = Date | string;

export interface DateRangeInput {
  from?: DateLike;
  to?: DateLike;
}

export interface DateRangeValue {
  start: Date | null;
  end: Date | null;
}

/** Date or string -> 'YYYY-MM-DD' (local). Returns undefined if invalid. */
export function toIsoDate(value: DateLike | null | undefined): string | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : dateToIso(value);
  }

  if (typeof value === 'string' && value) {
    if (ISO_PATTERN.test(value)) {
      return parseIso(value) ? value : undefined;
    }

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? undefined : dateToIso(parsed);
  }

  return undefined;
}

/** Any accepted outside value -> internal encoded string. */
export function toIsoValue(mode: DateMode, value: unknown): string {
  if (value == null || value === '') return '';

  // Already-encoded string ('a/b' or 'a,b') or a single date string.
  if (typeof value === 'string') {
    return mode === 'single' ? (toIsoDate(value) ?? '') : value;
  }

  let list: unknown[];

  if (value instanceof Date) {
    list = [value];
  } else if (Array.isArray(value)) {
    list = value;
  } else if (typeof value === 'object') {
    const { start, end } = value as Partial<DateRangeValue>;
    list = [start, end];
  } else {
    return '';
  }

  const dates = list
    .map((item) => toIsoDate(item as DateLike))
    .filter((iso): iso is string => !!iso);

  // decode() sorts, de-duplicates and applies the mode rules.
  return encodeDates(mode, decodeDates(mode, encodeDates(mode, dates)));
}

/** Internal encoded string -> value emitted to the form. */
export function fromIsoValue(
  mode: DateMode,
  value: string,
): Date | Date[] | DateRangeValue | null {
  const dates = decodeDates(mode, value)
    .map((iso) => parseIso(iso))
    .filter((date): date is Date => !!date);

  if (mode === 'multiple') return dates;
  if (mode === 'range') return { start: dates[0] ?? null, end: dates[1] ?? null };

  return dates[0] ?? null;
}
