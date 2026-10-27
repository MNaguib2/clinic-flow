import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Icon } from '../icon/icon';

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
  cellTemplate?: TemplateRef<TableCellContext<T>>;
}

@Component({
  selector: 'app-table',
  imports: [Icon, NgTemplateOutlet, TranslatePipe],
  templateUrl: './table.html',
  styleUrl: './table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Table<T extends object> {
  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly rows = input<readonly T[]>([]);
  readonly ariaLabel = input<string | null>(null);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly emptyMessage = input<string | null>(null);
  readonly showPagination = input(false);
  readonly showPageSummary = input(true);
  readonly currentPage = input(1);
  readonly pageSize = input(10);
  readonly totalItems = input(0);
  readonly actionsTemplate = input<TemplateRef<TableRowContext<T>> | null>(null);
  readonly pageChange = output<number>();

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(Math.max(0, this.totalItems()) / Math.max(1, this.pageSize()))),
  );
  protected readonly activePage = computed(() =>
    Math.min(Math.max(1, this.currentPage()), this.pageCount()),
  );
  protected readonly pages = computed(() =>
    Array.from({ length: this.pageCount() }, (_, index) => index + 1),
  );
  protected readonly summaryStart = computed(() =>
    this.totalItems() === 0 ? 0 : (this.activePage() - 1) * Math.max(1, this.pageSize()) + 1,
  );
  protected readonly summaryEnd = computed(() =>
    Math.min(this.activePage() * Math.max(1, this.pageSize()), Math.max(0, this.totalItems())),
  );

  protected cellValue(row: T, column: TableColumn<T>): unknown {
    return column.value
      ? column.value(row)
      : (row as Record<string, unknown>)[String(column.key)];
  }

  protected cellContext(row: T, column: TableColumn<T>): TableCellContext<T> {
    return { $implicit: row, row, value: this.cellValue(row, column), column };
  }

  protected rowContext(row: T): TableRowContext<T> {
    return { $implicit: row, row };
  }

  protected visibleColumnCount(): number {
    return this.columns().length + (this.actionsTemplate() ? 1 : 0);
  }

  protected requestPage(page: number): void {
    if (page < 1 || page > this.pageCount() || page === this.activePage()) return;
    this.pageChange.emit(page);
  }
}