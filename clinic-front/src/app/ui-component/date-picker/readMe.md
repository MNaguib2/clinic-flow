# Date Picker

`app-date-picker` is a ControlValueAccessor date field with calendar selection, optional text entry, date restrictions, and single, range, or multiple selection modes.

## Basic Usage

```html
<app-date-picker
	label="Date of birth"
	[dateMode]="'single'"
	[valueFormat]="'iso'"
	[displayFormat]="'dd-MM-yyyy'"
	[allowTyping]="true"
	[required]="false"
	(changed)="onDateChanged($event)"
/>
```

The component also works with Angular forms through `formControlName` or the signal-form `[formField]` binding.

## Selection And Value Format

`dateMode` controls how many dates can be selected:

| Mode | Value |
| --- | --- |
| `single` | One date |
| `range` | Start and end date |
| `multiple` | A list of dates |

`valueFormat` controls the value emitted to the form:

- `date` (default): `Date` for a single date, `Date[]` for multiple dates, or `{ start: Date | null, end: Date | null }` for a range.
- `iso`: ISO date string for a single date; range and multiple values are encoded strings using `/` and `,` respectively. For example, `2026-10-01/2026-10-03` or `2026-10-01,2026-10-03`.

ISO dates use `YYYY-MM-DD` regardless of the display format.

## Display Format

`displayFormat` can be a token pattern string or `Intl.DateTimeFormatOptions`. If omitted, the picker uses the browser's medium date format.

Supported string tokens are case-sensitive:

| Token | Meaning | Example |
| --- | --- | --- |
| `yyyy` | Four-digit year | `2026` |
| `yy` | Two-digit year | `26` |
| `MMMM` | Full month name | `October` |
| `MMM` | Short month name | `Oct` |
| `MM` | Two-digit month | `10` |
| `M` | Month without leading zero | `10` |
| `dd` | Two-digit day | `03` |
| `d` | Day without leading zero | `3` |

Examples:

- `yyyy-MM-dd` -> `2026-10-03`
- `dd-MM-yyyy` -> `03-10-2026`
- `MMM d, yyyy` -> `Oct 3, 2026`

The order in the pattern is the order shown. Use `MM` for month and `mm` is not a supported token. Month names are formatted using the active application language.

## Typing And Clearing

Set `allowTyping` to `true` to let users type a date. Typing is available only in single-date mode with a numeric token string containing day, month, and year, such as `dd-MM-yyyy` or `yyyy-MM-dd`. The typed value is validated on Enter or blur; invalid or restricted dates show an error and are not committed. Patterns containing month names and `Intl.DateTimeFormatOptions` are display-only and cannot be used for typing.

When `required` is `false`, the calendar footer shows a **Clear** action. Selecting it clears the form value and closes the calendar. A typed empty value is also cleared on Enter or blur. When using a form, the value can be cleared programmatically by setting its control or model field to `''` (or `null`, depending on the form's value type).

## Restrictions

`min`, `max`, `disabledDates`, `disabledWeekdays`, and `disabledRanges` prevent selecting disallowed dates. They accept `Date` values or date strings; ranges have optional `from` and `to` bounds. Weekdays use JavaScript numbering: Sunday is `0`, Saturday is `6`.
