import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  for (const count of [0, 2]) {
    it(`shows leave alerts only when pending count is positive (${count})`, () => {
      TestBed.inject(HttpTestingController).expectOne('/api/dashboard/stats').flush({
        totalEmployees: 1, activeEmployees: 1, relievedEmployees: 0,
        presentToday: 0, absentToday: 0, onLeaveToday: 0,
        pendingLeaveRequests: count, totalDepartments: 1, activeProjects: 0,
      });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.leave-alert') !== null).toBe(count > 0);
      expect(fixture.nativeElement.querySelector('.needs-decision') !== null).toBe(count > 0);
      if (count > 0) {
        expect(fixture.nativeElement.querySelector('.leave-alert').getAttribute('href')).toBe('/leaves?tab=pending');
      }
    });
  }
});
