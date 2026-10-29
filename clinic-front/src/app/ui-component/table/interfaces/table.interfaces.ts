import type { TemplateRef } from '@angular/core';

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
