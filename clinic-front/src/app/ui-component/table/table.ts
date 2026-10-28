
import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Icon } from '@components/icon/icon';

export interface TableRowContext<T> {
  $implicit: T;
  row: T;
}

export interface TableCellContext<T> extends TableRowContext<T> {
  value: unknown;
  column: TableColumn<T>;
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  value?: (row: T) => unknown;
  headerTemplate?: TemplateRef<unknown>;
  cellTemplate?: TemplateRef<TableCellContext<T>>;
  sortable?: boolean;
  width?: string;
  minWidth?: string;
  align?: 'start' | 'center' | 'end';
}

export type TableSortDirection = 'asc' | 'desc';

export interface TableSortChange {
  key: string;
  direction: TableSortDirection;
}

export interface TableContextMenuEvent<T> {
  row: T;
  x: number;
  y: number;
  source: 'mouse' | 'touch';
}

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

  // Accessibility and states
  readonly ariaLabel = input<string | null>(null);
  readonly loading = input(false);
  readonly loadingMore = input(false);
  readonly error = input<string | null>(null);
  readonly emptyMessage = input<string | null>(null);

  // Virtual scroll
  readonly virtualScroll = input(true);
  readonly itemSize = input(48);
  readonly bufferSize = input(5);

  // Infinite scroll
  readonly infiniteScroll = input(true);
  readonly hasMore = input(false);

  // Templates
  readonly actionsTemplate =
    input<TemplateRef<TableRowContext<T>> | null>(null);

  // Sorting
  readonly sortKey = input<string | null>(null);
  readonly sortDirection = input<TableSortDirection>('asc');
  readonly sortChange = output<TableSortChange>();

  // Events
  readonly loadMore = output<void>();
  readonly contextMenu = output<TableContextMenuEvent<T>>();
  readonly retryRequested = output<void>();

  // Pagination
  readonly showPagination = input(false);
  readonly showPageSummary = input(true);
  readonly currentPage = input(1);
  readonly pageSize = input(10);
  readonly totalItems = input(0);
  readonly pageChange = output<number>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  private readonly viewport =
    viewChild<ElementRef<HTMLElement>>('tableViewport');

  private readonly sentinel =
    viewChild<ElementRef<HTMLElement>>('loadMoreSentinel');

  private readonly renderedRows =
    viewChild<ElementRef<HTMLElement>>('virtualRows');

  protected readonly scrollTop = signal(0);
  protected readonly viewportHeight = signal(500);

  // Automatically measured average row height.
  protected readonly measuredItemSize = signal(48);

  private touchTimer: ReturnType<typeof setTimeout> | null = null;

  private touchStart: {
    x: number;
    y: number;
    row: T;
  } | null = null;

  private contextMenuOpenedByTouch = false;

  private rowResizeObserver: ResizeObserver | null = null;
  private resizeObservedRows = new Set<Element>();

  private readonly measureRequest = signal(0);

  protected readonly safeItemSize = computed(
    () => Math.max(1, this.itemSize()),
  );

  protected readonly safeBufferSize = computed(
    () => Math.max(0, this.bufferSize()),
  );

  /**
   * The virtual scroll uses the measured average while enabled.
   * The itemSize input is used as the initial/fallback estimate.
   */
  protected readonly effectiveItemSize = computed(() => {
    if (!this.virtualScroll()) {
      return this.safeItemSize();
    }

    return Math.max(
      1,
      this.measuredItemSize() || this.safeItemSize(),
    );
  });

  protected readonly visibleColumnCount = computed(
    () => this.columns().length + (this.actionsTemplate() ? 1 : 0),
  );

  // Virtual viewport calculations.
  protected readonly visibleCount = computed(() => {
    if (!this.virtualScroll()) {
      return this.rows().length;
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
      this.rows().length - this.visibleCount(),
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
      return this.rows();
    }

    return this.rows().slice(
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
      this.rows().length -
        this.startIndex() -
        this.visibleRows().length,
    );

    return remainingRows * this.effectiveItemSize();
  });

  // Pagination calculations.
  protected readonly pageCount = computed(() =>
    Math.max(
      1,
      Math.ceil(
        Math.max(0, this.totalItems()) /
          Math.max(1, this.pageSize()),
      ),
    ),
  );

  protected readonly activePage = computed(() =>
    Math.min(
      Math.max(1, this.currentPage()),
      this.pageCount(),
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
      : (this.activePage() - 1) *
          Math.max(1, this.pageSize()) +
        1,
  );

  protected readonly summaryEnd = computed(() =>
    Math.min(
      this.activePage() * Math.max(1, this.pageSize()),
      Math.max(0, this.totalItems()),
    ),
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearTouchTimer();
      this.rowResizeObserver?.disconnect();
      this.rowResizeObserver = null;
      this.resizeObservedRows.clear();
    });

    // Set up observers after the initial DOM render.
    afterNextRender(() => {
      this.setupRowResizeObserver();
      this.measureRenderedRows();
    });

    // Reconcile observed rows after Angular renders changes.
    effect(() => {
      this.virtualScroll();
      this.rows();
      this.visibleRows();
      this.startIndex();
      this.measureRequest();

      this.reconcileObservedRows();
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
          rootMargin: '0px 0px 180px 0px',
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
  protected onTableScroll(event: Event): void {
    const element = event.target as HTMLElement;

    this.scrollTop.set(element.scrollTop);
    this.viewportHeight.set(Math.max(1, element.clientHeight));
  }

  /**
   * Create the observer used to measure actual rendered row heights.
   */
  private setupRowResizeObserver(): void {
    if (
      !this.virtualScroll() ||
      typeof ResizeObserver === 'undefined'
    ) {
      return;
    }

    this.rowResizeObserver?.disconnect();
    this.resizeObservedRows.clear();

    this.rowResizeObserver = new ResizeObserver(() => {
      this.measureRenderedRows();
    });

    const viewportElement = this.viewport()?.nativeElement;

    if (viewportElement) {
      this.rowResizeObserver.observe(viewportElement);
    }

    this.reconcileObservedRows();
  }

  /**
   * Keep ResizeObserver attached only to currently rendered data rows.
   *
   * Requires data-virtual-row on each rendered data <tr>.
   */
  private reconcileObservedRows(): void {
    const observer = this.rowResizeObserver;

    if (!observer) {
      return;
    }

    const viewportElement = this.viewport()?.nativeElement;

    if (!viewportElement || !this.virtualScroll()) {
      observer.disconnect();
      this.resizeObservedRows.clear();
      return;
    }

    const currentRows = new Set<Element>(
      Array.from(
        viewportElement.querySelectorAll<HTMLElement>(
          'tbody tr[data-virtual-row]',
        ),
      ),
    );

    for (const oldRow of this.resizeObservedRows) {
      if (!currentRows.has(oldRow)) {
        observer.unobserve(oldRow);
        this.resizeObservedRows.delete(oldRow);
      }
    }

    for (const row of currentRows) {
      if (!this.resizeObservedRows.has(row)) {
        observer.observe(row);
        this.resizeObservedRows.add(row);
      }
    }

    this.measureRenderedRows();
  }

  /**
   * Measure visible rows and use their average height as the estimate
   * for the virtual scroll spacer calculations.
   */
  private measureRenderedRows(): void {
    if (!this.virtualScroll()) {
      return;
    }

    const viewportElement = this.viewport()?.nativeElement;

    if (!viewportElement) {
      return;
    }

    const rowElements = Array.from(
      viewportElement.querySelectorAll<HTMLElement>(
        'tbody tr[data-virtual-row]',
      ),
    );

    if (rowElements.length === 0) {
      return;
    }

    const heights = rowElements
      .map((row) => row.getBoundingClientRect().height)
      .filter(
        (height) => Number.isFinite(height) && height > 0,
      );

    if (heights.length === 0) {
      return;
    }

    const averageHeight =
      heights.reduce((sum, height) => sum + height, 0) /
      heights.length;

    // Keep fractional pixels for a more accurate estimate.
    const roundedAverage =
      Math.round(averageHeight * 100) / 100;

    if (
      Math.abs(this.measuredItemSize() - roundedAverage) > 0.5
    ) {
      this.measuredItemSize.set(roundedAverage);
    }
  }

  /**
   * Optional explicit remeasurement hook for template or content changes.
   */
  protected refreshItemSize(): void {
    this.measureRequest.update((value) => value + 1);
    this.measureRenderedRows();
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

  protected requestMore(): void {
    if (
      !this.infiniteScroll() ||
      !this.hasMore() ||
      this.loading() ||
      this.loadingMore() ||
      this.error()
    ) {
      return;
    }

    this.loadMore.emit();
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
    this.retryRequested.emit();
  }

  protected requestPage(page: number): void {
    if (
      page < 1 ||
      page > this.pageCount() ||
      page === this.activePage()
    ) {
      return;
    }

    this.pageChange.emit(page);
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
