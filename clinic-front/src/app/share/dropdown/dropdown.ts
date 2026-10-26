
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

export type DropdownAutoClose = 'outside' | 'inside' | 'all' | 'none';

@Component({
  selector: 'app-dropdown',
  exportAs: 'appDropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #trigger
      class="dropdown__trigger"
      (click)="toggle()"
    >
      <ng-content select="[dropdownTrigger]" />
    </div>

    <div
      #panel
      class="dropdown__panel"
      [class.dropdown__panel--open]="open()"
      [class.dropdown__panel--unstyled]="!styled()"
      [class.dropdown__panel--fit]="matchTriggerWidth()"
      [style.left.px]="panel_left()"
      [style.top.px]="panel_top()"
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
    '(document:keydown.escape)': 'onEscape()',
    '(window:resize)': 'updatePlacement()',
    '(window:scroll)': 'updatePlacement()',
  },
})
export class Dropdown {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly is_browser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly trigger_el =
    viewChild.required<ElementRef<HTMLElement>>('trigger');

  private readonly panel_el =
    viewChild.required<ElementRef<HTMLElement>>('panel');

  private readonly flipped_vertical = signal(false);
  private readonly flipped_horizontal = signal(false);

  readonly open = model(false);

  readonly placement = input<DropdownPlacement>('bottom-start');
  readonly autoFlip = input(true);
  readonly autoFlipHorizontal = input(true);
  readonly autoClose = input<DropdownAutoClose>('outside');
  readonly closeOnEscape = input(true);
  readonly disabled = input(false);
  readonly offset = input(6);
  readonly styled = input(true);
  readonly matchTriggerWidth = input(false);
  readonly block = input(false);
  readonly maxHeight = input<string | null>(
    'min(24rem, calc(100dvh - 16px))',
  );
  readonly panelRole = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);

  readonly opened = output<void>();
  readonly closed = output<void>();

  readonly panel_left = signal(8);
  readonly panel_top = signal(8);

  protected readonly resolved_placement = computed<DropdownPlacement>(() => {
    let placement = this.placement();

    if (this.flipped_vertical()) {
      placement = placement.startsWith('top')
        ? (placement.replace('top', 'bottom') as DropdownPlacement)
        : (placement.replace('bottom', 'top') as DropdownPlacement);
    }

    if (this.flipped_horizontal()) {
      if (placement.endsWith('start')) {
        placement = placement.replace('start', 'end') as DropdownPlacement;
      } else if (placement.endsWith('end')) {
        placement = placement.replace('end', 'start') as DropdownPlacement;
      }
    }

    return placement;
  });

  toggle(): void {
    if (this.disabled()) return;

    if (this.open()) {
      this.close();
    } else {
      this.show();
    }
  }

  show(): void {
    if (this.disabled() || this.open()) return;

    this.flipped_vertical.set(false);
    this.flipped_horizontal.set(false);
    this.open.set(true);

    this.opened.emit();

    if (this.is_browser) {
      requestAnimationFrame(() => {
        if (this.open()) {
          this.updatePlacement();
        }
      });
    }
  }

  close(): void {
    if (!this.open()) return;

    this.open.set(false);
    this.closed.emit();
  }

  protected onPanelClick(): void {
    const mode = this.autoClose();

    if (mode === 'inside' || mode === 'all') {
      this.close();
    }
  }

  protected onDocumentPointerDown(event: Event): void {
    if (!this.open()) return;

    const mode = this.autoClose();

    if (mode !== 'outside' && mode !== 'all') return;

    const target = event.target;

    if (
      target instanceof Node &&
      this.host.nativeElement.contains(target)
    ) {
      return;
    }

    this.close();
  }

  protected onEscape(): void {
    if (!this.open() || !this.closeOnEscape()) return;

    this.close();

    this.trigger_el()
      .nativeElement
      .querySelector<HTMLElement>('button, [tabindex]')
      ?.focus();
  }

  protected updatePlacement(): void {
    if (!this.is_browser || !this.open()) return;

    const trigger = this.trigger_el().nativeElement;
    const panel = this.panel_el().nativeElement;

    const trigger_rect = trigger.getBoundingClientRect();

    const viewport_width = document.documentElement.clientWidth;
    const viewport_height = document.documentElement.clientHeight;

    const gap = this.offset();
    const padding = 8;

    const is_rtl =
      getComputedStyle(trigger).direction === 'rtl';

    const panel_rect = panel.getBoundingClientRect();
    const panel_width = panel_rect.width;
    const panel_height = panel_rect.height;

    if (!panel_width || !panel_height) return;

    const requested = this.placement();
    const centered = requested.endsWith('center');
    const requested_end = requested.endsWith('end');
    const requested_top = requested.startsWith('top');

    // Vertical placement.
    const space_above = trigger_rect.top - gap - padding;
    const space_below =
      viewport_height - trigger_rect.bottom - gap - padding;

    let place_top = requested_top;

    if (this.autoFlip()) {
      const preferred_space = requested_top
        ? space_above
        : space_below;

      const alternative_space = requested_top
        ? space_below
        : space_above;

      if (
        preferred_space < panel_height &&
        alternative_space > preferred_space
      ) {
        place_top = !requested_top;
      }
    }

    this.flipped_vertical.set(place_top !== requested_top);

    // Horizontal placement.
    let align_right = is_rtl ? !requested_end : requested_end;

    let left = centered
      ? trigger_rect.left + (trigger_rect.width - panel_width) / 2
      : align_right
        ? trigger_rect.right - panel_width
        : trigger_rect.left;

    let horizontal_flip = false;

    if (this.autoFlipHorizontal() && !centered) {
      const overflow_left = left < padding;
      const overflow_right =
        left + panel_width > viewport_width - padding;

      if (overflow_left || overflow_right) {
        const alternative_left = align_right
          ? trigger_rect.left
          : trigger_rect.right - panel_width;

        const alternative_fits =
          alternative_left >= padding &&
          alternative_left + panel_width <= viewport_width - padding;

        if (alternative_fits) {
          left = alternative_left;
          horizontal_flip = true;
        }
      }
    }

    this.flipped_horizontal.set(horizontal_flip);

    // Keep the panel inside the viewport.
    left = Math.max(
      padding,
      Math.min(left, viewport_width - panel_width - padding),
    );

    let top = place_top
      ? trigger_rect.top - panel_height - gap
      : trigger_rect.bottom + gap;

    top = Math.max(
      padding,
      Math.min(top, viewport_height - panel_height - padding),
    );

    this.panel_left.set(left);
    this.panel_top.set(top);
  }
}
