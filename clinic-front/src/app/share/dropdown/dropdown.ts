import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';

export type DropdownPlacement =
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end'
  | 'top-start'
  | 'top-center'
  | 'top-end';

/** `outside`: click outside closes; `inside`: click inside the panel closes; `all`: both; `none`: only Escape/API. */
export type DropdownAutoClose = 'outside' | 'inside' | 'all' | 'none';

/**
 * Usage:
 * <app-dropdown placement="bottom-end" autoClose="outside">
 *   <button dropdownTrigger type="button">Open</button>
 *   <p>Panel content</p>
 * </app-dropdown>
 */
@Component({
  selector: 'app-dropdown',
  exportAs: 'appDropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #trigger class="dropdown__trigger" (click)="toggle()">
      <ng-content select="[dropdownTrigger]" />
    </div>
    <div
      #panel
      class="dropdown__panel"
      [class]="'dropdown__panel dropdown__panel--' + resolved_placement()"
      [class.dropdown__panel--open]="open()"
      [class.dropdown__panel--unstyled]="!styled()"
      [class.dropdown__panel--fit]="matchTriggerWidth()"
      [style.--dropdown-offset]="offset() + 'px'"
      [style.--dropdown-max-height]="maxHeight()"
      [attr.role]="panelRole()"
      [attr.aria-label]="ariaLabel()"
      [attr.inert]="open() ? null : ''"
      (click)="onPanelClick()"
    >
      <ng-content />
    </div>
  `,
  styleUrl: './dropdown.scss',
  host: {
    class: 'dropdown',
    '[class.dropdown--block]': 'block()',
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
    '(keydown.escape)': 'onEscape()',
  },
})
export class Dropdown {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly is_browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly trigger_el = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private readonly panel_el = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly flipped = signal(false);

  /** Two-way bindable open state: `[(open)]="is_open"`. */
  readonly open = model(false);
  readonly placement = input<DropdownPlacement>('bottom-start');
  /** Flip to the opposite vertical side when the panel does not fit. */
  readonly autoFlip = input(true);
  readonly autoClose = input<DropdownAutoClose>('outside');
  readonly closeOnEscape = input(true);
  readonly disabled = input(false);
  /** Gap in pixels between the trigger and the panel. */
  readonly offset = input(6);
  /** Apply the default card styling; disable to fully style the panel yourself. */
  readonly styled = input(true);
  readonly matchTriggerWidth = input(false);
  readonly block = input(false);
  /** Any CSS length, e.g. `16rem`. */
  readonly maxHeight = input<string | null>(null);
  readonly panelRole = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);

  readonly opened = output<void>();
  readonly closed = output<void>();

  protected readonly resolved_placement = computed<DropdownPlacement>(() => {
    const placement = this.placement();
    if (!this.flipped()) return placement;
    return placement.startsWith('top')
      ? (placement.replace('top', 'bottom') as DropdownPlacement)
      : (placement.replace('bottom', 'top') as DropdownPlacement);
  });

  toggle(): void {
    if (this.open()) this.close();
    else this.show();
  }

  show(): void {
    if (this.disabled() || this.open()) return;
    this.flipped.set(false);
    this.open.set(true);
    this.flipIfOverflowing();
    this.opened.emit();
  }

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.closed.emit();
  }

  protected onPanelClick(): void {
    const mode = this.autoClose();
    if (mode === 'inside' || mode === 'all') this.close();
  }

  protected onDocumentPointerDown(event: Event): void {
    if (!this.open()) return;
    const mode = this.autoClose();
    if (mode !== 'outside' && mode !== 'all') return;
    if (event.target instanceof Node && this.host.nativeElement.contains(event.target)) return;
    this.close();
  }

  protected onEscape(): void {
    if (!this.open() || !this.closeOnEscape()) return;
    this.close();
    this.trigger_el().nativeElement.querySelector<HTMLElement>('button, [tabindex]')?.focus();
  }

  private flipIfOverflowing(): void {
    if (!this.is_browser || !this.autoFlip()) return;
    const trigger_rect = this.trigger_el().nativeElement.getBoundingClientRect();
    const panel_height = this.panel_el().nativeElement.offsetHeight + this.offset();
    const space_below = window.innerHeight - trigger_rect.bottom;
    const space_above = trigger_rect.top;
    const prefers_top = this.placement().startsWith('top');
    const fits_preferred = (prefers_top ? space_above : space_below) >= panel_height;
    const other_space = prefers_top ? space_below : space_above;
    const preferred_space = prefers_top ? space_above : space_below;
    this.flipped.set(!fits_preferred && other_space > preferred_space);
  }
}
