
import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
  model,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Icon } from '@components/icon/icon';
import { ILoadMoreEvent } from './interfaces/load-more-event';
import type {
  TableCellContext,
  TableColumn,
  TableContextMenuEvent,
  TableRowContext,
  TableSortChange,
  TableSortDirection,
} from './interfaces/table.interfaces';

@Component({
  selector: 'app-table',
  imports: [Icon, NgTemplateOutlet, TranslatePipe],
  templateUrl: './table.html',
  styleUrl: './table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Table<T extends object> {
  // Data
  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly rows = input<readonly T[]>([]);

  protected blocks = signal<readonly T[]>([]);

  // Accessibility and states
  readonly ariaLabel = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly emptyMessage = input<string | null>(null);
  readonly loadingMore = signal(false);

  // Virtual scroll
  readonly virtualScroll = input(true);
  readonly itemSize = input(48);
  readonly bufferSize = input(5);

  // Infinite scroll
  readonly infiniteScroll = input(true);
  // null init
  // true after load total items are known
  // false if there are no more items to load
  private readonly hasMore = computed(() => {
    if (this.totalItems() === 0) return false;
    if (this.totalItems() === null) return null;
    return this.blocks().length < (this.totalItems() ?? 0);
  });

  // Templates
  readonly actionsTemplate =
    input<TemplateRef<TableRowContext<T>> | null>(null);

  // Sorting
  readonly sortKey = input<string>();
  readonly sortDirection = input<TableSortDirection>('asc');
  readonly sortChange = output<TableSortChange>();

  // Events
  readonly loadMore = output<ILoadMoreEvent>();
  readonly contextMenu = output<TableContextMenuEvent<T>>();

  // Pagination
  readonly showPagination = input(false);
  readonly showPageSummary = input(true);
  readonly currentPage = model(0);
  readonly pageSize = model<number | 'all'>(20);
  readonly totalItems = model<number | null>(null);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);

  private readonly viewport =
    viewChild<ElementRef<HTMLElement>>('tableViewport');

  private readonly sentinel =
    viewChild<ElementRef<HTMLElement>>('loadMoreSentinel');

  protected readonly scrollTop = signal(0);
  protected readonly viewportHeight = signal(500);

  private touchTimer: ReturnType<typeof setTimeout> | null = null;

  private touchStart: {
    x: number;
    y: number;
    row: T;
  } | null = null;

  private contextMenuOpenedByTouch = false;

  private viewportResizeObserver: ResizeObserver | null = null;
  private scrollAnimationFrame: number | null = null;

  private readonly handleViewportScroll = (): void => {
    this.closeContextMenuOnScroll();

    if (this.scrollAnimationFrame !== null) {
      return;
    }

    this.scrollAnimationFrame = requestAnimationFrame(() => {
      this.scrollAnimationFrame = null;

      const viewportElement = this.viewport()?.nativeElement;

      if (!viewportElement) {
        return;
      }

      const scroll_top = viewportElement.scrollTop;
      const viewport_height = Math.max(1, viewportElement.clientHeight);

      if (this.scrollTop() !== scroll_top) {
        this.scrollTop.set(scroll_top);
      }

      if (this.viewportHeight() !== viewport_height) {
        this.viewportHeight.set(viewport_height);
      }
    });
  };

  protected readonly safeBufferSize = computed(
    () => Math.max(0, this.bufferSize()),
  );

  protected readonly effectiveItemSize = computed(() => {
    return Math.max(1, this.itemSize());
  });

  protected readonly visibleColumnCount = computed(
    () => this.columns().length + (this.actionsTemplate() ? 1 : 0),
  );

  // Virtual viewport calculations.
  protected readonly visibleCount = computed(() => {
    if (!this.virtualScroll()) {
      return this.blocks().length;
    }

    return Math.ceil(
      this.viewportHeight() / this.effectiveItemSize(),
    ) + this.safeBufferSize() * 2;
  });

  protected readonly startIndex = computed(() => {
    if (!this.virtualScroll()) {
      return 0;
    }

    const maxStart = Math.max(
      0,
      this.blocks().length - this.visibleCount(),
    );

    const requestedStart = Math.max(
      0,
      Math.floor(
        this.scrollTop() / this.effectiveItemSize(),
      ) - this.safeBufferSize(),
    );

    return Math.min(requestedStart, maxStart);
  });

  protected readonly visibleRows = computed(() => {
    if (!this.virtualScroll()) {
      return this.blocks();
    }

    return this.blocks().slice(
      this.startIndex(),
      this.startIndex() + this.visibleCount(),
    );
  });

  protected readonly topSpacerHeight = computed(() => {
    if (!this.virtualScroll()) {
      return 0;
    }

    return this.startIndex() * this.effectiveItemSize();
  });

  protected readonly bottomSpacerHeight = computed(() => {
    if (!this.virtualScroll()) {
      return 0;
    }

    const remainingRows = Math.max(
      0,
      this.blocks().length -
        this.startIndex() -
        this.visibleRows().length,
    );

    return remainingRows * this.effectiveItemSize();
  });

  // Pagination calculations.
  protected readonly effectivePageSize = computed(() => {
    const page_size = this.pageSize();

    return page_size === 'all'
      ? Math.max(1, this.totalItems() ?? this.blocks().length)
      : Math.max(1, page_size);
  });

  protected readonly pageCount = computed(() =>
    Math.max(
      1,
      Math.ceil(
        Math.max(0, (this.totalItems() ?? 0)) /
          this.effectivePageSize(),
      ),
    ),
  );

  protected readonly pages = computed(() =>
    Array.from(
      { length: this.pageCount() },
      (_, index) => index + 1,
    ),
  );

  protected readonly summaryStart = computed(() =>
    this.totalItems() === 0
      ? 0
      : (this.currentPage() - 1) *
          this.effectivePageSize() +
        1,
  );

  protected readonly summaryEnd = computed(() =>
    Math.min(
      this.currentPage() * this.effectivePageSize(),
      Math.max(0, (this.totalItems() ?? 0)),
    ),
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearTouchTimer();
      this.viewportResizeObserver?.disconnect();
      this.viewportResizeObserver = null;
      this.viewport()?.nativeElement.removeEventListener(
        'scroll',
        this.handleViewportScroll,
      );

      if (this.scrollAnimationFrame !== null) {
        cancelAnimationFrame(this.scrollAnimationFrame);
        this.scrollAnimationFrame = null;
      }
    });

    afterNextRender(() => {
      this.setupViewportResizeObserver();
      this.requestMore();
    });

    let previousRows = this.rows();
    effect(() => {
      const rows = this.rows();

      if (previousRows !== rows) {
        previousRows = rows;
        this.loadingMore.set(false);
        this.blocks.update((blocks) => [...blocks, ...rows]);
      }
    });

    // Observe the infinite-scroll sentinel.
    effect((onCleanup) => {
      const target = this.sentinel()?.nativeElement;
      const root = this.host.nativeElement.querySelector<HTMLElement>(
        '.table-scroll',
      );

      if (
        !target ||
        !root ||
        !this.infiniteScroll() ||
        !this.hasMore() ||
        typeof IntersectionObserver === 'undefined'
      ) {
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.requestMore();
          }
        },
        {
          root,
          rootMargin: '0px 0px 10px 0px',
          threshold: 0,
        },
      );

      observer.observe(target);

      onCleanup(() => observer.disconnect());
    });
  }

  /**
   * Update the viewport metrics on scrolling and resizing.
   */
  protected onPageSizeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.pageSize.set(value === 'all' ? 'all' : Number(value));
    this.requestMore({ page: 1, refresh: true });
  }

  private setupViewportResizeObserver(): void {
    const viewportElement = this.viewport()?.nativeElement;

    if (!viewportElement) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      viewportElement.addEventListener(
        'scroll',
        this.handleViewportScroll,
        { passive: true },
      );
    });

    const updateViewportHeight = (): void => {
      const height = Math.max(1, viewportElement.clientHeight);

      if (this.viewportHeight() !== height) {
        this.viewportHeight.set(height);
      }
    };

    updateViewportHeight();

    if (typeof ResizeObserver !== 'undefined') {
      this.viewportResizeObserver = new ResizeObserver(updateViewportHeight);
      this.viewportResizeObserver.observe(viewportElement);
    }
  }

  protected cellValue(
    row: T,
    column: TableColumn<T>,
  ): unknown {
    return column.value
      ? column.value(row)
      : (row as Record<string, unknown>)[String(column.key)];
  }

  protected cellContext(
    row: T,
    column: TableColumn<T>,
  ): TableCellContext<T> {
    return {
      $implicit: row,
      row,
      value: this.cellValue(row, column),
      column,
    };
  }

  protected rowContext(row: T): TableRowContext<T> {
    return {
      $implicit: row,
      row,
    };
  }

  protected requestMore(event?: { page?: number, refresh?: boolean }): void {
    const limit = this.effectivePageSize();
    if (
      ((!this.hasMore() && this.hasMore() !== null) && !event?.refresh) ||
      this.loadingMore() ||
      this.error()
    ) {
      return;
    }
    this.loadingMore.set(true);

    if (event?.refresh) {
      this.totalItems.set(null);
      this.currentPage.set(0);
      this.blocks.set([]);
      this.scrollTop.set(0);

      const viewportElement = this.viewport()?.nativeElement;

      if (viewportElement) {
        viewportElement.scrollTop = 0;
      }
    }
    this.currentPage.set(event?.page ?? this.currentPage() + 1);
    this.loadMore.emit({page: this.currentPage(), sortKey: this.sortKey(), sortDirection: this.sortDirection(), limit});
  }

  protected requestSort(column: TableColumn<T>): void {
    if (!column.sortable) {
      return;
    }

    const key = String(column.key);

    const direction: TableSortDirection =
      this.sortKey() === key && this.sortDirection() === 'asc'
        ? 'desc'
        : 'asc';
        this.sortChange.emit({ key, direction });
        this.requestMore({ refresh: true });
  }

  protected onRowContextMenu(
    event: MouseEvent,
    row: T,
  ): void {
    if (this.contextMenuOpenedByTouch) {
      this.contextMenuOpenedByTouch = false;
      event.preventDefault();
      return;
    }

    event.preventDefault();

    this.contextMenu.emit({
      row,
      x: event.clientX,
      y: event.clientY,
      source: 'mouse',
    });
  }

  protected onTouchStart(
    event: TouchEvent,
    row: T,
  ): void {
    if (
      event.touches.length !== 1 ||
      this.isInteractiveTarget(event.target)
    ) {
      return;
    }

    this.clearTouchTimer();

    const touch = event.touches[0];

    this.touchStart = {
      x: touch.clientX,
      y: touch.clientY,
      row,
    };

    this.touchTimer = setTimeout(() => {
      if (!this.touchStart) {
        return;
      }

      const { row: touchedRow, x, y } = this.touchStart;

      this.contextMenuOpenedByTouch = true;

      this.contextMenu.emit({
        row: touchedRow,
        x,
        y,
        source: 'touch',
      });

      this.clearTouchTimer();
    }, 2000);
  }

  protected onTouchMove(event: TouchEvent): void {
    if (!this.touchStart || !event.touches.length) {
      return;
    }

    const touch = event.touches[0];

    if (
      Math.abs(touch.clientX - this.touchStart.x) > 10 ||
      Math.abs(touch.clientY - this.touchStart.y) > 10
    ) {
      this.clearTouchTimer();
    }
  }

  protected onTouchEnd(): void {
    this.clearTouchTimer();
  }

  protected closeContextMenuOnScroll(): void {
    this.clearTouchTimer();
  }

  protected retryLoad(): void {
    this.requestMore({ refresh: true });
  }

  private isInteractiveTarget(
    target: EventTarget | null,
  ): boolean {
    return (
      target instanceof Element &&
      Boolean(
        target.closest(
          'button, input, select, textarea, a, details, summary, [data-no-row-context]',
        ),
      )
    );
  }

  private clearTouchTimer(): void {
    if (this.touchTimer) {
      clearTimeout(this.touchTimer);
    }

    this.touchTimer = null;
    this.touchStart = null;
  }
}
