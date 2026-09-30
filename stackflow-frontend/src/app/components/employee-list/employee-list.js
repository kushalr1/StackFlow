import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { DepartmentService } from '../../services/department.service';
import { EmployeeService } from '../../services/employee.service';
import * as i0 from "@angular/core";
const _c0 = a0 => ["/employees", a0];
const _c1 = a0 => ["/employees", a0, "edit"];
const _forTrack0 = ($index, $item) => $item.id;
function EmployeeList_For_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 12);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const department_r1 = ctx.$implicit;
    i0.ɵɵproperty("value", department_r1.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(department_r1.name);
} }
function EmployeeList_Conditional_38_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 19);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" Showing ", ctx_r1.employmentStatus() === "active" ? "active" : "relieved", " employees", ctx_r1.selectedDepartment() ? " in the selected department" : "", ". ");
} }
function EmployeeList_Conditional_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 20);
    i0.ɵɵtext(1, "Loading employees...");
    i0.ɵɵelementEnd();
} }
function EmployeeList_Conditional_40_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 21)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 23);
    i0.ɵɵlistener("click", function EmployeeList_Conditional_40_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.loadEmployees()); });
    i0.ɵɵtext(4, "Try Again");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.errorMessage());
} }
function EmployeeList_Conditional_41_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "h2");
    i0.ɵɵtext(1, "No matching employees");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3, "Try another search or clear the filters to see every employee.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 23);
    i0.ɵɵlistener("click", function EmployeeList_Conditional_41_Conditional_1_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.clearFilters()); });
    i0.ɵɵtext(5, "Clear Filters");
    i0.ɵɵelementEnd();
} }
function EmployeeList_Conditional_41_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h2");
    i0.ɵɵtext(1, "No employees yet");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3, "Add your first employee to start building the StackFlow directory.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "a", 3);
    i0.ɵɵtext(5, "Add First Employee");
    i0.ɵɵelementEnd();
} }
function EmployeeList_Conditional_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 22);
    i0.ɵɵconditionalCreate(1, EmployeeList_Conditional_41_Conditional_1_Template, 6, 0)(2, EmployeeList_Conditional_41_Conditional_2_Template, 6, 0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.searchTerm() || ctx_r1.selectedDepartment() || ctx_r1.employmentStatus() ? 1 : 2);
} }
function EmployeeList_Conditional_42_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 24);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.deleteErrorMessage());
} }
function EmployeeList_Conditional_42_For_23_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr")(1, "td", 28);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "td");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "td");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "td");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "td");
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "number");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "td")(13, "span", 29);
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "td")(16, "div", 30)(17, "a", 31);
    i0.ɵɵtext(18, "View");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "a", 31);
    i0.ɵɵtext(20, "Edit");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "button", 32);
    i0.ɵɵlistener("click", function EmployeeList_Conditional_42_For_23_Template_button_click_21_listener() { const employee_r6 = i0.ɵɵrestoreView(_r5).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.deleteEmployee(employee_r6)); });
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const employee_r6 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(employee_r6.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(employee_r6.email);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(employee_r6.department);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(employee_r6.jobTitle);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(11, 12, employee_r6.salary, "1.2-2"));
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("inactive", !employee_r6.isActive);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", employee_r6.isActive ? "Active" : "Relieved", " ");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(15, _c0, employee_r6.id));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(17, _c1, employee_r6.id));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.deletingEmployeeId() === employee_r6.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.deletingEmployeeId() === employee_r6.id ? "Deleting..." : "Delete", " ");
} }
function EmployeeList_Conditional_42_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, EmployeeList_Conditional_42_Conditional_0_Template, 2, 1, "div", 24);
    i0.ɵɵelementStart(1, "div", 25)(2, "div", 26)(3, "table")(4, "thead")(5, "tr")(6, "th");
    i0.ɵɵtext(7, "Name");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "th");
    i0.ɵɵtext(9, "Email");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "th");
    i0.ɵɵtext(11, "Department");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "th");
    i0.ɵɵtext(13, "Job Title");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "th");
    i0.ɵɵtext(15, "Salary");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "th");
    i0.ɵɵtext(17, "Status");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "th")(19, "span", 27);
    i0.ɵɵtext(20, "Actions");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(21, "tbody");
    i0.ɵɵrepeaterCreate(22, EmployeeList_Conditional_42_For_23_Template, 23, 19, "tr", null, _forTrack0);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r1.deleteErrorMessage() ? 0 : -1);
    i0.ɵɵadvance(22);
    i0.ɵɵrepeater(ctx_r1.employees());
} }
export class EmployeeList {
    employeeService = inject(EmployeeService);
    departmentService = inject(DepartmentService);
    route = inject(ActivatedRoute);
    employees = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "employees" }] : /* istanbul ignore next */ []));
    departments = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "departments" }] : /* istanbul ignore next */ []));
    searchTerm = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "searchTerm" }] : /* istanbul ignore next */ []));
    selectedDepartment = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedDepartment" }] : /* istanbul ignore next */ []));
    employmentStatus = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "employmentStatus" }] : /* istanbul ignore next */ []));
    isLoading = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isLoading" }] : /* istanbul ignore next */ []));
    errorMessage = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorMessage" }] : /* istanbul ignore next */ []));
    deletingEmployeeId = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "deletingEmployeeId" }] : /* istanbul ignore next */ []));
    deleteErrorMessage = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "deleteErrorMessage" }] : /* istanbul ignore next */ []));
    ngOnInit() {
        const departmentId = this.route.snapshot.queryParamMap.get('departmentId');
        const isActive = this.route.snapshot.queryParamMap.get('isActive');
        if (departmentId && Number(departmentId) > 0) {
            this.selectedDepartment.set(departmentId);
        }
        this.employmentStatus.set(isActive === 'true' ? 'active' : isActive === 'false' ? 'relieved' : '');
        this.departmentService.getDepartments().subscribe({
            next: (departments) => this.departments.set(departments),
        });
        this.loadEmployees();
    }
    loadEmployees() {
        this.isLoading.set(true);
        this.errorMessage.set('');
        this.employeeService
            .getEmployees(this.searchTerm(), this.selectedDepartment() ? Number(this.selectedDepartment()) : undefined, this.employmentStatus() === 'active' ? true : this.employmentStatus() === 'relieved' ? false : undefined)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
            next: (employees) => this.employees.set(employees),
            error: (error) => {
                const message = error.status === 0
                    ? 'The API is unavailable. Confirm that the .NET backend is running.'
                    : 'Employees could not be loaded. Please try again.';
                this.errorMessage.set(message);
            },
        });
    }
    updateSearchTerm(event) {
        const input = event.target;
        this.searchTerm.set(input.value);
    }
    updateDepartment(event) {
        const select = event.target;
        this.selectedDepartment.set(select.value);
    }
    updateEmploymentStatus(event) {
        this.employmentStatus.set(event.target.value);
    }
    applyFilters() {
        this.loadEmployees();
    }
    clearFilters() {
        this.searchTerm.set('');
        this.selectedDepartment.set('');
        this.employmentStatus.set('');
        this.loadEmployees();
    }
    deleteEmployee(employee) {
        const confirmed = window.confirm(`Permanently delete ${employee.name}? Use this only for a mistaken employee record. This action cannot be undone.`);
        if (!confirmed) {
            return;
        }
        this.deleteErrorMessage.set('');
        this.deletingEmployeeId.set(employee.id);
        this.employeeService
            .deleteEmployee(employee.id)
            .pipe(finalize(() => this.deletingEmployeeId.set(null)))
            .subscribe({
            next: () => this.loadEmployees(),
            error: (error) => {
                const message = error.status === 0
                    ? 'The API is unavailable. Confirm that the .NET backend is running.'
                    : error.error?.message ?? `${employee.name} could not be deleted. Please try again.`;
                this.deleteErrorMessage.set(message);
            },
        });
    }
    static ɵfac = function EmployeeList_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || EmployeeList)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: EmployeeList, selectors: [["app-employee-list"]], decls: 43, vars: 5, consts: [[1, "employee-page"], [1, "page-heading"], [1, "eyebrow"], ["routerLink", "/employees/add", 1, "primary-button"], [1, "filters", 3, "submit"], [1, "filter-field", "search-field"], ["for", "employee-search"], ["id", "employee-search", "type", "search", "placeholder", "Name, email, or job title", 3, "input", "value"], [1, "filter-field"], ["for", "department-filter"], ["id", "department-filter", 3, "change", "value"], ["value", ""], [3, "value"], ["for", "employment-filter"], ["id", "employment-filter", 3, "change", "value"], ["value", "active"], ["value", "relieved"], ["type", "submit", 1, "filter-button"], ["type", "button", 1, "clear-button", 3, "click"], ["role", "status", 1, "applied-filter"], ["role", "status", 1, "state-card"], ["role", "alert", 1, "state-card", "error-state"], [1, "state-card", "empty-state"], ["type", "button", 3, "click"], ["role", "alert", 1, "delete-error"], [1, "table-card"], [1, "table-scroll"], [1, "visually-hidden"], [1, "employee-name"], [1, "status-badge"], [1, "row-actions"], [3, "routerLink"], ["type", "button", 1, "delete-button", 3, "click", "disabled"]], template: function EmployeeList_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "div")(3, "p", 2);
            i0.ɵɵtext(4, "Team directory");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "h1");
            i0.ɵɵtext(6, "Employees");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "p");
            i0.ɵɵtext(8, "View and manage everyone in your organization.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "a", 3);
            i0.ɵɵtext(10, "Add Employee");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(11, "form", 4);
            i0.ɵɵlistener("submit", function EmployeeList_Template_form_submit_11_listener($event) { $event.preventDefault(); return ctx.applyFilters(); });
            i0.ɵɵelementStart(12, "div", 5)(13, "label", 6);
            i0.ɵɵtext(14, "Search employees");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "input", 7);
            i0.ɵɵlistener("input", function EmployeeList_Template_input_input_15_listener($event) { return ctx.updateSearchTerm($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(16, "div", 8)(17, "label", 9);
            i0.ɵɵtext(18, "Department");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(19, "select", 10);
            i0.ɵɵlistener("change", function EmployeeList_Template_select_change_19_listener($event) { return ctx.updateDepartment($event); });
            i0.ɵɵelementStart(20, "option", 11);
            i0.ɵɵtext(21, "All departments");
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(22, EmployeeList_For_23_Template, 2, 2, "option", 12, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(24, "div", 8)(25, "label", 13);
            i0.ɵɵtext(26, "Employment status");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(27, "select", 14);
            i0.ɵɵlistener("change", function EmployeeList_Template_select_change_27_listener($event) { return ctx.updateEmploymentStatus($event); });
            i0.ɵɵelementStart(28, "option", 11);
            i0.ɵɵtext(29, "All employees");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(30, "option", 15);
            i0.ɵɵtext(31, "Active employees");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(32, "option", 16);
            i0.ɵɵtext(33, "Relieved employees");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(34, "button", 17);
            i0.ɵɵtext(35, "Search");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(36, "button", 18);
            i0.ɵɵlistener("click", function EmployeeList_Template_button_click_36_listener() { return ctx.clearFilters(); });
            i0.ɵɵtext(37, " Clear ");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(38, EmployeeList_Conditional_38_Template, 2, 2, "div", 19);
            i0.ɵɵconditionalCreate(39, EmployeeList_Conditional_39_Template, 2, 0, "div", 20)(40, EmployeeList_Conditional_40_Template, 5, 1, "div", 21)(41, EmployeeList_Conditional_41_Template, 3, 1, "div", 22)(42, EmployeeList_Conditional_42_Template, 24, 1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(15);
            i0.ɵɵproperty("value", ctx.searchTerm());
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("value", ctx.selectedDepartment());
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.departments());
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("value", ctx.employmentStatus());
            i0.ɵɵadvance(11);
            i0.ɵɵconditional(ctx.employmentStatus() ? 38 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.isLoading() ? 39 : ctx.errorMessage() ? 40 : ctx.employees().length === 0 ? 41 : 42);
        } }, dependencies: [RouterLink, DecimalPipe], styles: [".employee-page[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 1.5rem;\n}\n\n.page-heading[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-end;\n  justify-content: space-between;\n  gap: 1.5rem;\n}\n\n.eyebrow[_ngcontent-%COMP%] {\n  margin: 0 0 0.35rem;\n  color: #2563eb;\n  font-size: 0.75rem;\n  font-weight: 700;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n}\n\nh1[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #0f172a;\n  font-size: 2rem;\n}\n\n.page-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]:last-child {\n  margin: 0.5rem 0 0;\n  color: #64748b;\n}\n\n.primary-button[_ngcontent-%COMP%], \n.state-card[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  border: 0;\n  border-radius: 8px;\n  background: #2563eb;\n  padding: 0.7rem 1rem;\n  color: #ffffff;\n  font: inherit;\n  font-weight: 600;\n  text-decoration: none;\n  cursor: pointer;\n}\n\n.primary-button[_ngcontent-%COMP%]:hover, \n.state-card[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  background: #1d4ed8;\n}\n\n.filters[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-end;\n  gap: 1rem;\n  border: 1px solid #e2e8f0;\n  border-radius: 12px;\n  background: #ffffff;\n  padding: 1rem;\n  box-shadow: 0 4px 14px rgb(15 23 42 / 4%);\n}\n\n.filter-field[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.4rem;\n}\n\n.search-field[_ngcontent-%COMP%] {\n  flex: 1;\n}\n\n.filter-field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  color: #475569;\n  font-size: 0.8rem;\n  font-weight: 700;\n}\n\n.filter-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.filter-field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  min-height: 42px;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n  background: #ffffff;\n  padding: 0.6rem 0.75rem;\n  color: #0f172a;\n  font: inherit;\n}\n\n.filter-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, \n.filter-field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus {\n  border-color: #2563eb;\n  outline: 3px solid rgb(37 99 235 / 15%);\n}\n\n.filter-button[_ngcontent-%COMP%], \n.clear-button[_ngcontent-%COMP%] {\n  min-height: 42px;\n  border-radius: 8px;\n  padding: 0.6rem 1rem;\n  font: inherit;\n  font-weight: 600;\n  cursor: pointer;\n}\n\n.filter-button[_ngcontent-%COMP%] {\n  border: 1px solid #2563eb;\n  background: #2563eb;\n  color: #ffffff;\n}\n\n.filter-button[_ngcontent-%COMP%]:hover {\n  background: #1d4ed8;\n  box-shadow: 0 4px 10px rgb(37 99 235 / 18%);\n}\n\n.clear-button[_ngcontent-%COMP%] {\n  border: 1px solid #cbd5e1;\n  background: #ffffff;\n  color: #334155;\n}\n\n.clear-button[_ngcontent-%COMP%]:hover {\n  border-color: #94a3b8;\n  background: #f8fafc;\n}\n\n.state-card[_ngcontent-%COMP%], \n.table-card[_ngcontent-%COMP%] {\n  border: 1px solid #e2e8f0;\n  border-radius: 12px;\n  background: #ffffff;\n  box-shadow: 0 4px 14px rgb(15 23 42 / 5%);\n}\n\n.state-card[_ngcontent-%COMP%] {\n  padding: 3rem 1.5rem;\n  text-align: center;\n}\n\n.state-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin-top: 0;\n}\n\n.state-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0 0 1.25rem;\n  color: #64748b;\n}\n\n.error-state[_ngcontent-%COMP%] {\n  border-color: #fecaca;\n  background: #fef2f2;\n}\n\n.error-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: #b91c1c;\n}\n\n.delete-error[_ngcontent-%COMP%] {\n  border: 1px solid #fecaca;\n  border-radius: 8px;\n  background: #fef2f2;\n  padding: 0.75rem 1rem;\n  color: #b91c1c;\n}\n\n.applied-filter[_ngcontent-%COMP%] {\n  border-radius: 8px;\n  background: #eff6ff;\n  padding: 0.75rem 1rem;\n  color: #1d4ed8;\n  font-weight: 600;\n}\n\n.table-scroll[_ngcontent-%COMP%] {\n  overflow-x: auto;\n}\n\n.table-card[_ngcontent-%COMP%] {\n  overflow: hidden;\n}\n\ntable[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  text-align: left;\n}\n\nth[_ngcontent-%COMP%], \ntd[_ngcontent-%COMP%] {\n  padding: 1rem;\n  border-bottom: 1px solid #e2e8f0;\n  white-space: nowrap;\n}\n\nth[_ngcontent-%COMP%] {\n  background: #f8fafc;\n  color: #475569;\n  font-size: 0.75rem;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n}\n\ntbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:last-child   td[_ngcontent-%COMP%] {\n  border-bottom: 0;\n}\n\ntbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%] {\n  transition: background-color 140ms ease;\n}\n\ntbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover {\n  background: #f8fafc;\n}\n\n.employee-name[_ngcontent-%COMP%] {\n  color: #0f172a;\n  font-weight: 700;\n}\n\n.status-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  border-radius: 999px;\n  background: #dcfce7;\n  padding: 0.3rem 0.65rem;\n  color: #166534;\n  font-size: 0.75rem;\n  font-weight: 700;\n}\n\n.status-badge.inactive[_ngcontent-%COMP%] {\n  background: #f1f5f9;\n  color: #475569;\n}\n\n.row-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n}\n\n.row-actions[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\n  color: #2563eb;\n  font-weight: 600;\n  text-decoration: none;\n}\n\n.row-actions[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover {\n  text-decoration: underline;\n}\n\n.delete-button[_ngcontent-%COMP%] {\n  border: 0;\n  background: transparent;\n  padding: 0;\n  color: #dc2626;\n  font: inherit;\n  font-weight: 600;\n  cursor: pointer;\n}\n\n.delete-button[_ngcontent-%COMP%]:hover:not(:disabled) {\n  text-decoration: underline;\n}\n\n.delete-button[_ngcontent-%COMP%]:disabled {\n  color: #94a3b8;\n  cursor: not-allowed;\n}\n\n.visually-hidden[_ngcontent-%COMP%] {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border: 0;\n}\n\n@media (max-width: 640px) {\n  .page-heading[_ngcontent-%COMP%] {\n    align-items: stretch;\n    flex-direction: column;\n  }\n\n  .primary-button[_ngcontent-%COMP%] {\n    text-align: center;\n  }\n\n  .filters[_ngcontent-%COMP%] {\n    align-items: stretch;\n    flex-direction: column;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(EmployeeList, [{
        type: Component,
        args: [{ imports: [DecimalPipe, RouterLink], selector: 'app-employee-list', template: "<section class=\"employee-page\">\n  <div class=\"page-heading\">\n    <div>\n      <p class=\"eyebrow\">Team directory</p>\n      <h1>Employees</h1>\n      <p>View and manage everyone in your organization.</p>\n    </div>\n\n    <a class=\"primary-button\" routerLink=\"/employees/add\">Add Employee</a>\n  </div>\n\n  <form class=\"filters\" (submit)=\"$event.preventDefault(); applyFilters()\">\n    <div class=\"filter-field search-field\">\n      <label for=\"employee-search\">Search employees</label>\n      <input\n        id=\"employee-search\"\n        type=\"search\"\n        placeholder=\"Name, email, or job title\"\n        [value]=\"searchTerm()\"\n        (input)=\"updateSearchTerm($event)\"\n      />\n    </div>\n\n    <div class=\"filter-field\">\n      <label for=\"department-filter\">Department</label>\n      <select\n        id=\"department-filter\"\n        [value]=\"selectedDepartment()\"\n        (change)=\"updateDepartment($event)\"\n      >\n        <option value=\"\">All departments</option>\n        @for (department of departments(); track department.id) {\n          <option [value]=\"department.id\">{{ department.name }}</option>\n        }\n      </select>\n    </div>\n\n    <div class=\"filter-field\">\n      <label for=\"employment-filter\">Employment status</label>\n      <select id=\"employment-filter\" [value]=\"employmentStatus()\" (change)=\"updateEmploymentStatus($event)\">\n        <option value=\"\">All employees</option>\n        <option value=\"active\">Active employees</option>\n        <option value=\"relieved\">Relieved employees</option>\n      </select>\n    </div>\n\n    <button class=\"filter-button\" type=\"submit\">Search</button>\n    <button class=\"clear-button\" type=\"button\" (click)=\"clearFilters()\">\n      Clear\n    </button>\n  </form>\n\n  @if (employmentStatus()) {\n    <div class=\"applied-filter\" role=\"status\">\n      Showing {{ employmentStatus() === 'active' ? 'active' : 'relieved' }} employees{{ selectedDepartment() ? ' in the selected department' : '' }}.\n    </div>\n  }\n\n  @if (isLoading()) {\n    <div class=\"state-card\" role=\"status\">Loading employees...</div>\n  } @else if (errorMessage()) {\n    <div class=\"state-card error-state\" role=\"alert\">\n      <p>{{ errorMessage() }}</p>\n      <button type=\"button\" (click)=\"loadEmployees()\">Try Again</button>\n    </div>\n  } @else if (employees().length === 0) {\n    <div class=\"state-card empty-state\">\n      @if (searchTerm() || selectedDepartment() || employmentStatus()) {\n        <h2>No matching employees</h2>\n        <p>Try another search or clear the filters to see every employee.</p>\n        <button type=\"button\" (click)=\"clearFilters()\">Clear Filters</button>\n      } @else {\n        <h2>No employees yet</h2>\n        <p>Add your first employee to start building the StackFlow directory.</p>\n        <a class=\"primary-button\" routerLink=\"/employees/add\">Add First Employee</a>\n      }\n    </div>\n  } @else {\n    @if (deleteErrorMessage()) {\n      <div class=\"delete-error\" role=\"alert\">{{ deleteErrorMessage() }}</div>\n    }\n\n    <div class=\"table-card\">\n      <div class=\"table-scroll\">\n        <table>\n          <thead>\n            <tr>\n              <th>Name</th>\n              <th>Email</th>\n              <th>Department</th>\n              <th>Job Title</th>\n              <th>Salary</th>\n              <th>Status</th>\n              <th><span class=\"visually-hidden\">Actions</span></th>\n            </tr>\n          </thead>\n          <tbody>\n            @for (employee of employees(); track employee.id) {\n              <tr>\n                <td class=\"employee-name\">{{ employee.name }}</td>\n                <td>{{ employee.email }}</td>\n                <td>{{ employee.department }}</td>\n                <td>{{ employee.jobTitle }}</td>\n                <td>{{ employee.salary | number: '1.2-2' }}</td>\n                <td>\n                  <span\n                    class=\"status-badge\"\n                    [class.inactive]=\"!employee.isActive\"\n                  >\n                    {{ employee.isActive ? 'Active' : 'Relieved' }}\n                  </span>\n                </td>\n                <td>\n                  <div class=\"row-actions\">\n                    <a [routerLink]=\"['/employees', employee.id]\">View</a>\n                    <a [routerLink]=\"['/employees', employee.id, 'edit']\">Edit</a>\n                    <button\n                      class=\"delete-button\"\n                      type=\"button\"\n                      [disabled]=\"deletingEmployeeId() === employee.id\"\n                      (click)=\"deleteEmployee(employee)\"\n                    >\n                      {{\n                        deletingEmployeeId() === employee.id\n                          ? 'Deleting...'\n                          : 'Delete'\n                      }}\n                    </button>\n                  </div>\n                </td>\n              </tr>\n            }\n          </tbody>\n        </table>\n      </div>\n    </div>\n  }\n</section>\n", styles: [".employee-page {\n  display: grid;\n  gap: 1.5rem;\n}\n\n.page-heading {\n  display: flex;\n  align-items: flex-end;\n  justify-content: space-between;\n  gap: 1.5rem;\n}\n\n.eyebrow {\n  margin: 0 0 0.35rem;\n  color: #2563eb;\n  font-size: 0.75rem;\n  font-weight: 700;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n}\n\nh1 {\n  margin: 0;\n  color: #0f172a;\n  font-size: 2rem;\n}\n\n.page-heading p:last-child {\n  margin: 0.5rem 0 0;\n  color: #64748b;\n}\n\n.primary-button,\n.state-card button {\n  border: 0;\n  border-radius: 8px;\n  background: #2563eb;\n  padding: 0.7rem 1rem;\n  color: #ffffff;\n  font: inherit;\n  font-weight: 600;\n  text-decoration: none;\n  cursor: pointer;\n}\n\n.primary-button:hover,\n.state-card button:hover {\n  background: #1d4ed8;\n}\n\n.filters {\n  display: flex;\n  align-items: flex-end;\n  gap: 1rem;\n  border: 1px solid #e2e8f0;\n  border-radius: 12px;\n  background: #ffffff;\n  padding: 1rem;\n  box-shadow: 0 4px 14px rgb(15 23 42 / 4%);\n}\n\n.filter-field {\n  display: grid;\n  gap: 0.4rem;\n}\n\n.search-field {\n  flex: 1;\n}\n\n.filter-field label {\n  color: #475569;\n  font-size: 0.8rem;\n  font-weight: 700;\n}\n\n.filter-field input,\n.filter-field select {\n  min-height: 42px;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n  background: #ffffff;\n  padding: 0.6rem 0.75rem;\n  color: #0f172a;\n  font: inherit;\n}\n\n.filter-field input:focus,\n.filter-field select:focus {\n  border-color: #2563eb;\n  outline: 3px solid rgb(37 99 235 / 15%);\n}\n\n.filter-button,\n.clear-button {\n  min-height: 42px;\n  border-radius: 8px;\n  padding: 0.6rem 1rem;\n  font: inherit;\n  font-weight: 600;\n  cursor: pointer;\n}\n\n.filter-button {\n  border: 1px solid #2563eb;\n  background: #2563eb;\n  color: #ffffff;\n}\n\n.filter-button:hover {\n  background: #1d4ed8;\n  box-shadow: 0 4px 10px rgb(37 99 235 / 18%);\n}\n\n.clear-button {\n  border: 1px solid #cbd5e1;\n  background: #ffffff;\n  color: #334155;\n}\n\n.clear-button:hover {\n  border-color: #94a3b8;\n  background: #f8fafc;\n}\n\n.state-card,\n.table-card {\n  border: 1px solid #e2e8f0;\n  border-radius: 12px;\n  background: #ffffff;\n  box-shadow: 0 4px 14px rgb(15 23 42 / 5%);\n}\n\n.state-card {\n  padding: 3rem 1.5rem;\n  text-align: center;\n}\n\n.state-card h2 {\n  margin-top: 0;\n}\n\n.state-card p {\n  margin: 0 0 1.25rem;\n  color: #64748b;\n}\n\n.error-state {\n  border-color: #fecaca;\n  background: #fef2f2;\n}\n\n.error-state p {\n  color: #b91c1c;\n}\n\n.delete-error {\n  border: 1px solid #fecaca;\n  border-radius: 8px;\n  background: #fef2f2;\n  padding: 0.75rem 1rem;\n  color: #b91c1c;\n}\n\n.applied-filter {\n  border-radius: 8px;\n  background: #eff6ff;\n  padding: 0.75rem 1rem;\n  color: #1d4ed8;\n  font-weight: 600;\n}\n\n.table-scroll {\n  overflow-x: auto;\n}\n\n.table-card {\n  overflow: hidden;\n}\n\ntable {\n  width: 100%;\n  border-collapse: collapse;\n  text-align: left;\n}\n\nth,\ntd {\n  padding: 1rem;\n  border-bottom: 1px solid #e2e8f0;\n  white-space: nowrap;\n}\n\nth {\n  background: #f8fafc;\n  color: #475569;\n  font-size: 0.75rem;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n}\n\ntbody tr:last-child td {\n  border-bottom: 0;\n}\n\ntbody tr {\n  transition: background-color 140ms ease;\n}\n\ntbody tr:hover {\n  background: #f8fafc;\n}\n\n.employee-name {\n  color: #0f172a;\n  font-weight: 700;\n}\n\n.status-badge {\n  display: inline-flex;\n  border-radius: 999px;\n  background: #dcfce7;\n  padding: 0.3rem 0.65rem;\n  color: #166534;\n  font-size: 0.75rem;\n  font-weight: 700;\n}\n\n.status-badge.inactive {\n  background: #f1f5f9;\n  color: #475569;\n}\n\n.row-actions {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n}\n\n.row-actions a {\n  color: #2563eb;\n  font-weight: 600;\n  text-decoration: none;\n}\n\n.row-actions a:hover {\n  text-decoration: underline;\n}\n\n.delete-button {\n  border: 0;\n  background: transparent;\n  padding: 0;\n  color: #dc2626;\n  font: inherit;\n  font-weight: 600;\n  cursor: pointer;\n}\n\n.delete-button:hover:not(:disabled) {\n  text-decoration: underline;\n}\n\n.delete-button:disabled {\n  color: #94a3b8;\n  cursor: not-allowed;\n}\n\n.visually-hidden {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border: 0;\n}\n\n@media (max-width: 640px) {\n  .page-heading {\n    align-items: stretch;\n    flex-direction: column;\n  }\n\n  .primary-button {\n    text-align: center;\n  }\n\n  .filters {\n    align-items: stretch;\n    flex-direction: column;\n  }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(EmployeeList, { className: "EmployeeList", filePath: "src/app/components/employee-list/employee-list.ts", lineNumber: 17 }); })();
