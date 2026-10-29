export interface ILoadMoreEvent {
  page: number;
  sortKey: string | undefined;
  sortDirection: SortDirection;
  limit: number;
}

export type SortDirection = 'asc' | 'desc';
