import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import * as i0 from "@angular/core";
const _c0 = () => ({ isActive: true });
const _c1 = () => ({ isActive: false });
const _c2 = () => ({ tab: "history", date: "today", status: "Present" });
const _c3 = () => ({ tab: "history", date: "today", status: "Absent" });
const _c4 = () => ({ tab: "calendar" });
const _c5 = () => ({ tab: "pending" });
const _c6 = () => ({ tab: "current", status: "Active" });
function Dashboard_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4);
    i0.ɵɵtext(1, "Loading dashboard...");
    i0.ɵɵelementEnd();
} }
function Dashboard_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 5)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 6);
    i0.ɵɵlistener("click", function Dashboard_Conditional_12_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.loadDashboard()); });
    i0.ɵɵtext(4, "Try Again");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.errorMessage());
} }
function Dashboard_Conditional_13_Conditional_64_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 16)(1, "p");
    i0.ɵɵtext(2, "Your directory is empty. Add an employee to populate the dashboard.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "a", 17);
    i0.ɵɵtext(4, "Add Employee");
    i0.ɵɵelementEnd()();
} }
function Dashboard_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 7)(1, "a", 8)(2, "p");
    i0.ɵɵtext(3, "Total Employees");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "strong");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span");
    i0.ɵɵtext(7, "Active and relieved employees");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "a", 9)(9, "p");
    i0.ɵɵtext(10, "Active Employees");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "strong");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "span");
    i0.ɵɵtext(14, "Currently active team members");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "a", 10)(16, "p");
    i0.ɵɵtext(17, "Relieved Employees");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "strong");
    i0.ɵɵtext(19);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "span");
    i0.ɵɵtext(21, "Former employees with preserved history");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "a", 11)(23, "p");
    i0.ɵɵtext(24, "Present Today");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "strong");
    i0.ɵɵtext(26);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "span");
    i0.ɵɵtext(28, "Employees marked present");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(29, "a", 12)(30, "p");
    i0.ɵɵtext(31, "Absent Today");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "strong");
    i0.ɵɵtext(33);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "span");
    i0.ɵɵtext(35, "Employees marked absent");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(36, "a", 13)(37, "p");
    i0.ɵɵtext(38, "On Leave Today");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(39, "strong");
    i0.ɵɵtext(40);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(41, "span");
    i0.ɵɵtext(42, "Active employees with approved leave");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(43, "a", 13)(44, "p");
    i0.ɵɵtext(45, "Pending Leaves");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(46, "strong");
    i0.ɵɵtext(47);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(48, "span");
    i0.ɵɵtext(49, "Requests awaiting a decision");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(50, "a", 14)(51, "p");
    i0.ɵɵtext(52, "Departments");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(53, "strong");
    i0.ɵɵtext(54);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(55, "span");
    i0.ɵɵtext(56, "Organization departments");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(57, "a", 15)(58, "p");
    i0.ɵɵtext(59, "Active Projects");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(60, "strong");
    i0.ɵɵtext(61);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(62, "span");
    i0.ɵɵtext(63, "Projects currently active");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(64, Dashboard_Conditional_13_Conditional_64_Template, 5, 0, "div", 16);
} if (rf & 2) {
    const dashboard_r3 = ctx;
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(dashboard_r3.totalEmployees);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("queryParams", i0.ɵɵpureFunction0(17, _c0));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(dashboard_r3.activeEmployees);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("queryParams", i0.ɵɵpureFunction0(18, _c1));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(dashboard_r3.relievedEmployees);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("queryParams", i0.ɵɵpureFunction0(19, _c2));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(dashboard_r3.presentToday);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("queryParams", i0.ɵɵpureFunction0(20, _c3));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(dashboard_r3.absentToday);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("queryParams", i0.ɵɵpureFunction0(21, _c4));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(dashboard_r3.onLeaveToday);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("queryParams", i0.ɵɵpureFunction0(22, _c5));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(dashboard_r3.pendingLeaveRequests);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(dashboard_r3.totalDepartments);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("queryParams", i0.ɵɵpureFunction0(23, _c6));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(dashboard_r3.activeProjects);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(dashboard_r3.totalEmployees === 0 ? 64 : -1);
} }
export class Dashboard {
    dashboardService = inject(DashboardService);
    stats = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "stats" }] : /* istanbul ignore next */ []));
    isLoading = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isLoading" }] : /* istanbul ignore next */ []));
    errorMessage = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorMessage" }] : /* istanbul ignore next */ []));
    ngOnInit() {
        this.loadDashboard();
    }
    loadDashboard() {
        this.isLoading.set(true);
        this.errorMessage.set('');
        this.dashboardService
            .getStats()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
            next: (stats) => this.stats.set(stats),
            error: (error) => {
                const message = error.status === 0
                    ? 'The API is unavailable. Confirm that the .NET backend is running.'
                    : 'Dashboard statistics could not be loaded. Please try again.';
                this.errorMessage.set(message);
            },
        });
    }
    static ɵfac = function Dashboard_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Dashboard)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: Dashboard, selectors: [["app-dashboard"]], decls: 14, vars: 1, consts: [[1, "dashboard-page"], [1, "page-heading"], [1, "eyebrow"], ["routerLink", "/employees", 1, "primary-button"], ["role", "status", 1, "state-card"], ["role", "alert", 1, "state-card", "error-state"], ["type", "button", 3, "click"], [1, "statistics-grid"], ["routerLink", "/employees", 1, "stat-card", "total-card"], ["routerLink", "/employees", 1, "stat-card", "active-card", 3, "queryParams"], ["routerLink", "/employees", 1, "stat-card", 3, "queryParams"], ["routerLink", "/attendance", 1, "stat-card", "present-card", 3, "queryParams"], ["routerLink", "/attendance", 1, "stat-card", "absent-card", 3, "queryParams"], ["routerLink", "/leaves", 1, "stat-card", "leave-card", 3, "queryParams"], ["routerLink", "/departments", 1, "stat-card", "department-card"], ["routerLink", "/projects", 1, "stat-card", "project-card", 3, "queryParams"], [1, "empty-message"], ["routerLink", "/employees/add", 1, "primary-button"]], template: function Dashboard_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "div")(3, "p", 2);
            i0.ɵɵtext(4, "Organization overview");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "h1");
            i0.ɵɵtext(6, "Dashboard");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "p");
            i0.ɵɵtext(8, "A live summary of employees, attendance, leave, and projects.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "a", 3);
            i0.ɵɵtext(10, "View Employees");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(11, Dashboard_Conditional_11_Template, 2, 0, "div", 4)(12, Dashboard_Conditional_12_Template, 5, 1, "div", 5)(13, Dashboard_Conditional_13_Template, 65, 24);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_0_0;
            i0.ɵɵadvance(11);
            i0.ɵɵconditional(ctx.isLoading() ? 11 : ctx.errorMessage() ? 12 : (tmp_0_0 = ctx.stats()) ? 13 : -1, tmp_0_0);
        } }, dependencies: [RouterLink], styles: [".dashboard-page[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 1.5rem;\n}\n\n.page-heading[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-end;\n  justify-content: space-between;\n  gap: 1.5rem;\n}\n\n.eyebrow[_ngcontent-%COMP%] {\n  margin: 0 0 0.35rem;\n  color: #2563eb;\n  font-size: 0.75rem;\n  font-weight: 700;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n}\n\nh1[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #0f172a;\n  font-size: 2rem;\n}\n\n.page-heading[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]    > p[_ngcontent-%COMP%]:last-child {\n  margin: 0.5rem 0 0;\n  color: #64748b;\n}\n\n.primary-button[_ngcontent-%COMP%], \n.state-card[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  border: 0;\n  border-radius: 8px;\n  background: #2563eb;\n  padding: 0.7rem 1rem;\n  color: #ffffff;\n  font: inherit;\n  font-weight: 600;\n  text-decoration: none;\n  cursor: pointer;\n}\n\n.primary-button[_ngcontent-%COMP%]:hover, \n.state-card[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  background: #1d4ed8;\n  box-shadow: 0 6px 14px rgb(37 99 235 / 20%);\n  transform: translateY(-1px);\n}\n\n.statistics-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(4, minmax(0, 1fr));\n  gap: 1rem;\n}\n\n.stat-card[_ngcontent-%COMP%], \n.state-card[_ngcontent-%COMP%], \n.empty-message[_ngcontent-%COMP%] {\n  border: 1px solid #e2e8f0;\n  border-radius: 12px;\n  background: #ffffff;\n  box-shadow: 0 4px 14px rgb(15 23 42 / 5%);\n}\n\n.stat-card[_ngcontent-%COMP%] {\n  border-top: 4px solid #2563eb;\n  padding: 1.25rem;\n  color: inherit;\n  text-decoration: none;\n  transition:\n    box-shadow 160ms ease,\n    transform 160ms ease;\n}\n\n.stat-card[_ngcontent-%COMP%]:focus-visible {\n  outline: 3px solid rgb(37 99 235 / 25%);\n  outline-offset: 3px;\n}\n\n.stat-card[_ngcontent-%COMP%]:hover {\n  box-shadow: 0 10px 24px rgb(15 23 42 / 9%);\n  transform: translateY(-2px);\n}\n\n.stat-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #475569;\n  font-weight: 600;\n}\n\n.stat-card[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  display: block;\n  margin: 0.8rem 0 0.35rem;\n  color: #0f172a;\n  font-size: 2rem;\n}\n\n.stat-card[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: #64748b;\n  font-size: 0.85rem;\n}\n\n.active-card[_ngcontent-%COMP%] {\n  border-top-color: #16a34a;\n}\n\n.absent-card[_ngcontent-%COMP%] {\n  border-top-color: #f97316;\n}\n\n.present-card[_ngcontent-%COMP%] { border-top-color: #16a34a; }\n.leave-card[_ngcontent-%COMP%] { border-top-color: #eab308; }\n.project-card[_ngcontent-%COMP%] { border-top-color: #0891b2; }\n\n.department-card[_ngcontent-%COMP%] {\n  border-top-color: #7c3aed;\n}\n\n.state-card[_ngcontent-%COMP%], \n.empty-message[_ngcontent-%COMP%] {\n  padding: 2rem 1.5rem;\n  text-align: center;\n}\n\n.state-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], \n.empty-message[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0 0 1rem;\n  color: #64748b;\n}\n\n.error-state[_ngcontent-%COMP%] {\n  border-color: #fecaca;\n  background: #fef2f2;\n}\n\n.error-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: #b91c1c;\n}\n\n@media (max-width: 900px) {\n  .statistics-grid[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n}\n\n@media (max-width: 640px) {\n  .page-heading[_ngcontent-%COMP%] {\n    align-items: stretch;\n    flex-direction: column;\n  }\n\n  .primary-button[_ngcontent-%COMP%] {\n    text-align: center;\n  }\n\n  .statistics-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Dashboard, [{
        type: Component,
        args: [{ imports: [RouterLink], selector: 'app-dashboard', template: "<section class=\"dashboard-page\">\n  <div class=\"page-heading\">\n    <div>\n      <p class=\"eyebrow\">Organization overview</p>\n      <h1>Dashboard</h1>\n      <p>A live summary of employees, attendance, leave, and projects.</p>\n    </div>\n\n    <a class=\"primary-button\" routerLink=\"/employees\">View Employees</a>\n  </div>\n\n  @if (isLoading()) {\n    <div class=\"state-card\" role=\"status\">Loading dashboard...</div>\n  } @else if (errorMessage()) {\n    <div class=\"state-card error-state\" role=\"alert\">\n      <p>{{ errorMessage() }}</p>\n      <button type=\"button\" (click)=\"loadDashboard()\">Try Again</button>\n    </div>\n  } @else if (stats(); as dashboard) {\n    <div class=\"statistics-grid\">\n      <a class=\"stat-card total-card\" routerLink=\"/employees\">\n        <p>Total Employees</p>\n        <strong>{{ dashboard.totalEmployees }}</strong>\n        <span>Active and relieved employees</span>\n      </a>\n\n      <a class=\"stat-card active-card\" routerLink=\"/employees\" [queryParams]=\"{ isActive: true }\">\n        <p>Active Employees</p>\n        <strong>{{ dashboard.activeEmployees }}</strong>\n        <span>Currently active team members</span>\n      </a>\n\n      <a class=\"stat-card\" routerLink=\"/employees\" [queryParams]=\"{ isActive: false }\">\n        <p>Relieved Employees</p>\n        <strong>{{ dashboard.relievedEmployees }}</strong>\n        <span>Former employees with preserved history</span>\n      </a>\n\n      <a class=\"stat-card present-card\" routerLink=\"/attendance\" [queryParams]=\"{ tab: 'history', date: 'today', status: 'Present' }\">\n        <p>Present Today</p>\n        <strong>{{ dashboard.presentToday }}</strong>\n        <span>Employees marked present</span>\n      </a>\n\n      <a class=\"stat-card absent-card\" routerLink=\"/attendance\" [queryParams]=\"{ tab: 'history', date: 'today', status: 'Absent' }\">\n        <p>Absent Today</p>\n        <strong>{{ dashboard.absentToday }}</strong>\n        <span>Employees marked absent</span>\n      </a>\n\n      <a class=\"stat-card leave-card\" routerLink=\"/leaves\" [queryParams]=\"{ tab: 'calendar' }\">\n        <p>On Leave Today</p>\n        <strong>{{ dashboard.onLeaveToday }}</strong>\n        <span>Active employees with approved leave</span>\n      </a>\n\n      <a class=\"stat-card leave-card\" routerLink=\"/leaves\" [queryParams]=\"{ tab: 'pending' }\">\n        <p>Pending Leaves</p>\n        <strong>{{ dashboard.pendingLeaveRequests }}</strong>\n        <span>Requests awaiting a decision</span>\n      </a>\n\n      <a class=\"stat-card department-card\" routerLink=\"/departments\">\n        <p>Departments</p>\n        <strong>{{ dashboard.totalDepartments }}</strong>\n        <span>Organization departments</span>\n      </a>\n\n      <a class=\"stat-card project-card\" routerLink=\"/projects\" [queryParams]=\"{ tab: 'current', status: 'Active' }\">\n        <p>Active Projects</p>\n        <strong>{{ dashboard.activeProjects }}</strong>\n        <span>Projects currently active</span>\n      </a>\n    </div>\n\n    @if (dashboard.totalEmployees === 0) {\n      <div class=\"empty-message\">\n        <p>Your directory is empty. Add an employee to populate the dashboard.</p>\n        <a class=\"primary-button\" routerLink=\"/employees/add\">Add Employee</a>\n      </div>\n    }\n  }\n</section>\n", styles: [".dashboard-page {\n  display: grid;\n  gap: 1.5rem;\n}\n\n.page-heading {\n  display: flex;\n  align-items: flex-end;\n  justify-content: space-between;\n  gap: 1.5rem;\n}\n\n.eyebrow {\n  margin: 0 0 0.35rem;\n  color: #2563eb;\n  font-size: 0.75rem;\n  font-weight: 700;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n}\n\nh1 {\n  margin: 0;\n  color: #0f172a;\n  font-size: 2rem;\n}\n\n.page-heading div > p:last-child {\n  margin: 0.5rem 0 0;\n  color: #64748b;\n}\n\n.primary-button,\n.state-card button {\n  border: 0;\n  border-radius: 8px;\n  background: #2563eb;\n  padding: 0.7rem 1rem;\n  color: #ffffff;\n  font: inherit;\n  font-weight: 600;\n  text-decoration: none;\n  cursor: pointer;\n}\n\n.primary-button:hover,\n.state-card button:hover {\n  background: #1d4ed8;\n  box-shadow: 0 6px 14px rgb(37 99 235 / 20%);\n  transform: translateY(-1px);\n}\n\n.statistics-grid {\n  display: grid;\n  grid-template-columns: repeat(4, minmax(0, 1fr));\n  gap: 1rem;\n}\n\n.stat-card,\n.state-card,\n.empty-message {\n  border: 1px solid #e2e8f0;\n  border-radius: 12px;\n  background: #ffffff;\n  box-shadow: 0 4px 14px rgb(15 23 42 / 5%);\n}\n\n.stat-card {\n  border-top: 4px solid #2563eb;\n  padding: 1.25rem;\n  color: inherit;\n  text-decoration: none;\n  transition:\n    box-shadow 160ms ease,\n    transform 160ms ease;\n}\n\n.stat-card:focus-visible {\n  outline: 3px solid rgb(37 99 235 / 25%);\n  outline-offset: 3px;\n}\n\n.stat-card:hover {\n  box-shadow: 0 10px 24px rgb(15 23 42 / 9%);\n  transform: translateY(-2px);\n}\n\n.stat-card p {\n  margin: 0;\n  color: #475569;\n  font-weight: 600;\n}\n\n.stat-card strong {\n  display: block;\n  margin: 0.8rem 0 0.35rem;\n  color: #0f172a;\n  font-size: 2rem;\n}\n\n.stat-card span {\n  color: #64748b;\n  font-size: 0.85rem;\n}\n\n.active-card {\n  border-top-color: #16a34a;\n}\n\n.absent-card {\n  border-top-color: #f97316;\n}\n\n.present-card { border-top-color: #16a34a; }\n.leave-card { border-top-color: #eab308; }\n.project-card { border-top-color: #0891b2; }\n\n.department-card {\n  border-top-color: #7c3aed;\n}\n\n.state-card,\n.empty-message {\n  padding: 2rem 1.5rem;\n  text-align: center;\n}\n\n.state-card p,\n.empty-message p {\n  margin: 0 0 1rem;\n  color: #64748b;\n}\n\n.error-state {\n  border-color: #fecaca;\n  background: #fef2f2;\n}\n\n.error-state p {\n  color: #b91c1c;\n}\n\n@media (max-width: 900px) {\n  .statistics-grid {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n}\n\n@media (max-width: 640px) {\n  .page-heading {\n    align-items: stretch;\n    flex-direction: column;\n  }\n\n  .primary-button {\n    text-align: center;\n  }\n\n  .statistics-grid {\n    grid-template-columns: 1fr;\n  }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(Dashboard, { className: "Dashboard", filePath: "src/app/components/dashboard/dashboard.ts", lineNumber: 14 }); })();
