import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  afterRenderEffect,
  inject,
  input,
  model,
  output,
  untracked,
  viewChild,
} from '@angular/core';

export type OverlayPanelPlacement =
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end'
  | 'top-start'
  | 'top-center'
  | 'top-end';

export type OverlayPanelAutoClose = 'outside' | 'inside' | 'all' | 'none';

const VIEWPORT_PADDING = 8;

/**
 * Performance notes (vs. the previous version):
 *  - No per-frame polling loop: ResizeObserver + IntersectionObserver + a
 *    capture-phase scroll listener, all coalesced into one rAF per frame.
 *  - All global listeners (scroll, resize, pointerdown, keydown) exist ONLY
 *    while the panel is open, and run outside Angular's zone.
 *  - Position is written straight to the DOM (no signals -> no change
 *    detection on scroll/resize), and only when the value actually changed.
 *  - No getComputedStyle ancestor walk: IntersectionObserver already accounts
 *    for clipping by scrollable/overflow ancestors.
 *  - Layout reads are batched before writes (no layout thrashing).
 *  - RTL direction is read once per open instead of on every update.
 */
@Component({
  selector: 'app-overlay-panel',
  exportAs: 'overlayPanel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #trigger
      class="overlay-panel__trigger"
      (click)="toggle()"
    >
      <ng-content select="[overlayPanelTrigger]" />
    </div>

    <div
      #panel
      class="overlay-panel__panel"
      [class.overlay-panel__panel--open]="open()"
      [class.overlay-panel__panel--unstyled]="!styled()"
      [class.overlay-panel__panel--fit]="matchTriggerWidth()"
      [style.--overlay-panel-max-height]="maxHeight()"
      [attr.role]="panelRole()"
      [attr.aria-label]="ariaLabel()"
      [attr.inert]="open() ? null : ''"
      (click)="onPanelClick()"
    >
      <ng-content />
    </div>
  `,
  styleUrl: './overlay-panel.scss',
  host: {
    class: 'overlay-panel',
    '[class.overlay-panel--block]': 'block()',
  },
})
export class OverlayPanel {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);
  private readonly is_browser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly trigger_el =
    viewChild.required<ElementRef<HTMLElement>>('trigger');

  private readonly panel_el =
    viewChild.required<ElementRef<HTMLElement>>('panel');

  /** Cached reference so the panel can be cleaned up even after being moved. */
  private panel_node: HTMLElement | null = null;

  // Non-reactive placement state (never read by the template).
  private raf = 0;
  private is_rtl = false;
  private last_left = Number.NaN;
  private last_top = Number.NaN;
  private last_side = '';
  private last_fit_width = Number.NaN;

  readonly open = model(false);

  readonly placement = input<OverlayPanelPlacement>('bottom-start');
  readonly autoFlip = input(true);
  readonly autoFlipHorizontal = input(true);
  readonly autoClose = input<OverlayPanelAutoClose>('outside');
  readonly closeOnEscape = input(true);

  /**
   * Close the panel when the trigger is scrolled completely out of view
   * (by the page or by any scrollable/clipping ancestor).
   */
  readonly closeOnTriggerHidden = input(true);

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

  /**
   * Where to render the panel. Accepts a CSS selector (e.g. 'body', '#app-root')
   * or an HTMLElement. When null, the panel stays inside the component.
   */
  readonly appendTo = input<string | HTMLElement | null>(null);

  readonly opened = output<void>();
  readonly closed = output<void>();

  constructor() {
    // Re-attach the panel whenever `appendTo` changes, then reposition it.
    afterRenderEffect(() => {
      this.appendTo();

      untracked(() => {
        this.syncAppendTarget();

        if (this.open()) this.schedulePlacement();
      });
    });

    // Everything that watches the outside world exists only while open.
    afterRenderEffect((onCleanup) => {
      if (!this.open()) return;

      untracked(() => onCleanup(this.attachOpenListeners()));
    });

    // Angular only removes the host's own children, so a panel that was
    // moved elsewhere in the DOM must be removed manually.
    this.destroyRef.onDestroy(() => {
      const panel = this.panel_node;

      if (panel && panel.parentElement !== this.host.nativeElement) {
        panel.remove();
      }
    });
  }

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

    // Re-resolve the target: a selector's element may not have existed earlier.
    this.syncAppendTarget();

    this.open.set(true);
    this.opened.emit();
    // Placement happens synchronously in the post-render effect, before paint.
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

  // ---------------------------------------------------------------------
  // Open-state listeners (all outside the Angular zone)
  // ---------------------------------------------------------------------

  /** Wires up everything needed while open. Returns the teardown function. */
  private attachOpenListeners(): () => void {
    const trigger = this.trigger_el().nativeElement;
    const panel = this.panel_el().nativeElement;

    // Read once per open instead of on every placement.
    this.is_rtl = getComputedStyle(trigger).direction === 'rtl';
    this.last_left = Number.NaN;
    this.last_top = Number.NaN;
    this.last_side = '';
    this.last_fit_width = Number.NaN;

    // Position synchronously so the first painted frame is already correct.
    this.placeNow();

    const teardown: Array<() => void> = [];

    this.zone.runOutsideAngular(() => {
      const schedule = () => this.schedulePlacement();

      // Capture phase catches scrolling of ANY ancestor container; only
      // scrolls that can actually move the trigger are processed.
      const onScroll = (event: Event) => {
        const target = event.target;

        if (target instanceof Node && target.contains(trigger)) {
          schedule();
        }
      };

      const onPointerDown = (event: Event) => {
        const mode = this.autoClose();

        if (mode !== 'outside' && mode !== 'all') return;

        const target = event.target;

        // The panel may live outside the host (appendTo), so check both.
        if (
          target instanceof Node &&
          (this.host.nativeElement.contains(target) || panel.contains(target))
        ) {
          return;
        }

        this.zone.run(() => this.close());
      };

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape' || !this.closeOnEscape()) return;

        this.zone.run(() => this.close());

        trigger.querySelector<HTMLElement>('button, [tabindex]')?.focus();
      };

      document.addEventListener('scroll', onScroll, {
        capture: true,
        passive: true,
      });
      window.addEventListener('resize', schedule, { passive: true });
      document.addEventListener('pointerdown', onPointerDown, {
        capture: true,
        passive: true,
      });
      document.addEventListener('keydown', onKeyDown);

      teardown.push(
        () =>
          document.removeEventListener('scroll', onScroll, { capture: true }),
        () => window.removeEventListener('resize', schedule),
        () =>
          document.removeEventListener('pointerdown', onPointerDown, {
            capture: true,
          }),
        () => document.removeEventListener('keydown', onKeyDown),
      );

      // Trigger / panel size changes (content loaded, fonts, etc.).
      if (typeof ResizeObserver !== 'undefined') {
        const resize_observer = new ResizeObserver(schedule);

        resize_observer.observe(trigger);
        resize_observer.observe(panel);

        teardown.push(() => resize_observer.disconnect());
      }

      // Trigger scrolled out of view (viewport or any clipping ancestor).
      if (typeof IntersectionObserver !== 'undefined') {
        const intersection_observer = new IntersectionObserver((entries) => {
          if (!this.closeOnTriggerHidden()) return;

          const latest = entries[entries.length - 1];

          if (latest && !latest.isIntersecting) {
            this.zone.run(() => this.close());
          }
        });

        intersection_observer.observe(trigger);

        teardown.push(() => intersection_observer.disconnect());
      }
    });

    return () => {
      for (const fn of teardown) fn();

      if (this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
      }
    };
  }

  // ---------------------------------------------------------------------
  // Placement
  // ---------------------------------------------------------------------

  /** Coalesces any number of triggers into a single placement per frame. */
  private schedulePlacement(): void {
    if (this.raf || !this.is_browser) return;

    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.placeNow();
    });
  }

  /** Reads geometry first, then writes once. Touches the DOM directly. */
  private placeNow(): void {
    if (!this.is_browser || !this.open()) return;

    const trigger = this.trigger_el().nativeElement;
    const panel = this.panel_el().nativeElement;

    // --- READ -----------------------------------------------------------
    const trigger_rect = trigger.getBoundingClientRect();

    // Width-matching must be applied before measuring the panel.
    if (this.matchTriggerWidth() && trigger_rect.width !== this.last_fit_width) {
      this.last_fit_width = trigger_rect.width;
      panel.style.setProperty(
        '--overlay-panel-trigger-width',
        `${trigger_rect.width}px`,
      );
    }

    const panel_rect = panel.getBoundingClientRect();
    const panel_width = panel_rect.width;
    const panel_height = panel_rect.height;

    if (!panel_width || !panel_height) return;

    const root = document.documentElement;
    const viewport_width = root.clientWidth;
    const viewport_height = root.clientHeight;

    // --- COMPUTE (pure math, no DOM access) ------------------------------
    const gap = this.offset();
    const requested = this.placement();
    const centered = requested.endsWith('center');
    const requested_end = requested.endsWith('end');
    const requested_top = requested.startsWith('top');

    // Vertical placement.
    let place_top = requested_top;

    if (this.autoFlip()) {
      const space_above = trigger_rect.top - gap - VIEWPORT_PADDING;
      const space_below =
        viewport_height - trigger_rect.bottom - gap - VIEWPORT_PADDING;

      const preferred_space = requested_top ? space_above : space_below;
      const alternative_space = requested_top ? space_below : space_above;

      if (
        preferred_space < panel_height &&
        alternative_space > preferred_space
      ) {
        place_top = !requested_top;
      }
    }

    // Horizontal placement.
    const align_right = this.is_rtl ? !requested_end : requested_end;

    let left = centered
      ? trigger_rect.left + (trigger_rect.width - panel_width) / 2
      : align_right
        ? trigger_rect.right - panel_width
        : trigger_rect.left;

    if (this.autoFlipHorizontal() && !centered) {
      const overflows =
        left < VIEWPORT_PADDING ||
        left + panel_width > viewport_width - VIEWPORT_PADDING;

      if (overflows) {
        const alternative_left = align_right
          ? trigger_rect.left
          : trigger_rect.right - panel_width;

        if (
          alternative_left >= VIEWPORT_PADDING &&
          alternative_left + panel_width <= viewport_width - VIEWPORT_PADDING
        ) {
          left = alternative_left;
        }
      }
    }

    // Keep the panel inside the viewport.
    left = Math.max(
      VIEWPORT_PADDING,
      Math.min(left, viewport_width - panel_width - VIEWPORT_PADDING),
    );

    let top = place_top
      ? trigger_rect.top - panel_height - gap
      : trigger_rect.bottom + gap;

    top = Math.max(
      VIEWPORT_PADDING,
      Math.min(top, viewport_height - panel_height - VIEWPORT_PADDING),
    );

    // Snap to device pixels: avoids blurry text and redundant writes.
    const dpr = window.devicePixelRatio || 1;

    left = Math.round(left * dpr) / dpr;
    top = Math.round(top * dpr) / dpr;

    // --- WRITE (only what changed) ---------------------------------------
    if (left !== this.last_left) {
      this.last_left = left;
      panel.style.left = `${left}px`;
    }

    if (top !== this.last_top) {
      this.last_top = top;
      panel.style.top = `${top}px`;
    }

    const side = place_top ? 'top' : 'bottom';

    if (side !== this.last_side) {
      this.last_side = side;
      panel.dataset['side'] = side; // styling hook: [data-side='top']
    }
  }

  // ---------------------------------------------------------------------
  // Append target
  // ---------------------------------------------------------------------

  private resolveAppendTarget(): HTMLElement | null {
    if (!this.is_browser) return null;

    const target = this.appendTo();

    if (!target) return null;

    if (typeof target === 'string') {
      return document.querySelector<HTMLElement>(target);
    }

    return target;
  }

  private syncAppendTarget(): void {
    if (!this.is_browser) return;

    const panel = this.panel_el().nativeElement;
    this.panel_node = panel;

    const target = this.resolveAppendTarget();

    if (target) {
      if (panel.parentElement !== target) {
        target.appendChild(panel);
      }
    } else {
      this.restorePanel();
    }
  }

  private restorePanel(): void {
    const panel = this.panel_el().nativeElement;
    const host = this.host.nativeElement;

    if (panel.parentElement !== host) {
      host.appendChild(panel);
    }
  }
}
