import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { provideTranslateService } from '@ngx-translate/core';
import { SidebarState } from '../../services/sidebar-state.service';
import { SideBar } from './side-bar';

describe('SideBar', () => {
  let component: SideBar;
  let fixture: ComponentFixture<SideBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideBar],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: AuthStore, useValue: { user: () => ({ organization_name: 'Northstar Clinic' }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SideBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the authenticated organization name in the brand', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.dashboard-brand-name')?.textContent?.trim())
      .toBe('Northstar Clinic');
  });

  it('renders all menu entries with only the implemented dashboard destination', () => {
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('.sidebar-link') as NodeListOf<HTMLElement>;

    expect(links).toHaveLength(11);
    expect(links[0].getAttribute('href')).toBe('/dashboard');
    expect(links[1].tagName).toBe('BUTTON');
    expect(fixture.nativeElement.querySelector('.support-card')).toBeTruthy();
  });

  it('closes the mobile drawer when Escape is pressed', () => {
    const sidebar_state = TestBed.inject(SidebarState);
    sidebar_state.is_open.set(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(sidebar_state.is_open()).toBe(false);
  });

  it('closes the mobile drawer after selecting a navigation link', () => {
    const sidebar_state = TestBed.inject(SidebarState);
    sidebar_state.is_open.set(true);
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelectorAll('.sidebar-link')[1] as HTMLButtonElement
    ).click();

    expect(sidebar_state.is_open()).toBe(false);
  });
});
