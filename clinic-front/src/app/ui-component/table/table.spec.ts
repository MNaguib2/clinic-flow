import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { describe, expect, it } from 'vitest';
import { Table } from './table';
import type { TableColumn } from './interfaces/table.interfaces';

interface DemoRow {
  name: string;
}

describe('Table', () => {
  it('emits requested page changes and renders the controlled current page', async () => {
    await TestBed.configureTestingModule({
      imports: [Table],
      providers: [provideTranslateService()],
    }).compileComponents();

    const fixture = TestBed.createComponent(Table<DemoRow>);
    const columns: TableColumn<DemoRow>[] = [{ key: 'name', header: 'Name' }];
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('rows', [{ name: 'Example row' }]);
    fixture.componentRef.setInput('showPagination', true);
    fixture.componentRef.setInput('currentPage', 2);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('totalItems', 60);
    fixture.detectChanges();

    const requested_pages: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => requested_pages.push(page));
    const page_buttons = fixture.nativeElement.querySelectorAll('.pagination__page');
    expect(page_buttons).toHaveLength(6);
    expect(fixture.nativeElement.querySelector('.pagination__page--active')?.textContent).toBe('2');
    expect(fixture.nativeElement.textContent).toContain('Example row');

    fixture.nativeElement.querySelector('.pagination__next').click();
    page_buttons[4].click();

    expect(requested_pages).toEqual([3, 5]);
  });

  it('renders configured empty and error states', async () => {
    await TestBed.configureTestingModule({
      imports: [Table],
      providers: [provideTranslateService()],
    }).compileComponents();

    const fixture = TestBed.createComponent(Table<DemoRow>);
    fixture.componentRef.setInput('columns', [{ key: 'name', header: 'Name' }]);
    fixture.componentRef.setInput('emptyMessage', 'Nothing here yet');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nothing here yet');

    fixture.componentRef.setInput('error', 'Unable to load records');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Unable to load records',
    );
  });
});
