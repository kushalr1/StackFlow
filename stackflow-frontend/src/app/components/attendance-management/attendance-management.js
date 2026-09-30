import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { AttendanceService } from '../../services/attendance.service';
import { EmployeeService } from '../../services/employee.service';
import { DatePickerDirective } from '../../directives/date-picker.directive';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.value;
function AttendanceManagement_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorMessage());
} }
function AttendanceManagement_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.successMessage());
} }
function AttendanceManagement_Conditional_21_For_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const employee_r3 = ctx.$implicit;
    i0.ɵɵproperty("ngValue", employee_r3.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(employee_r3.name);
} }
function AttendanceManagement_Conditional_21_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small", 17);
    i0.ɵɵtext(1, "Employee is required.");
    i0.ɵɵelementEnd();
} }
function AttendanceManagement_Conditional_21_For_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 22);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const status_r4 = ctx.$implicit;
    i0.ɵɵproperty("value", status_r4.value);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(status_r4.label);
} }
function AttendanceManagement_Conditional_21_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 26);
    i0.ɵɵlistener("click", function AttendanceManagement_Conditional_21_Conditional_31_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.cancelEdit()); });
    i0.ɵɵtext(1, "Cancel");
    i0.ɵɵelementEnd();
} }
function AttendanceManagement_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 7)(1, "form", 9);
    i0.ɵɵlistener("ngSubmit", function AttendanceManagement_Conditional_21_Template_form_ngSubmit_1_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.saveAttendance()); });
    i0.ɵɵelementStart(2, "div", 10)(3, "div")(4, "p", 11);
    i0.ɵɵtext(5, "Daily entry");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "h2");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p");
    i0.ɵɵtext(9, "Relieved employees are automatically excluded.");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(10, "div", 12)(11, "div", 13)(12, "label", 14);
    i0.ɵɵtext(13, "Employee");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "select", 15)(15, "option", 16);
    i0.ɵɵtext(16, "Select active employee");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(17, AttendanceManagement_Conditional_21_For_18_Template, 2, 2, "option", 16, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(19, AttendanceManagement_Conditional_21_Conditional_19_Template, 2, 0, "small", 17);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "div", 13)(21, "label", 18);
    i0.ɵɵtext(22, "Date");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(23, "input", 19);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "div", 13)(25, "label", 20);
    i0.ɵɵtext(26, "Status");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "select", 21);
    i0.ɵɵrepeaterCreate(28, AttendanceManagement_Conditional_21_For_29_Template, 2, 2, "option", 22, _forTrack1);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(30, "div", 23);
    i0.ɵɵconditionalCreate(31, AttendanceManagement_Conditional_21_Conditional_31_Template, 2, 0, "button", 24);
    i0.ɵɵelementStart(32, "button", 25);
    i0.ɵɵtext(33);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("formGroup", ctx_r0.attendanceForm);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r0.editingId() === null ? "Mark Attendance" : "Edit Attendance");
    i0.ɵɵadvance(7);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngValue", 0);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r0.activeEmployees());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.attendanceForm.controls.employeeId.touched && ctx_r0.attendanceForm.controls.employeeId.invalid ? 19 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.statuses);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.editingId() !== null ? 31 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.isSaving());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.isSaving() ? "Saving..." : ctx_r0.editingId() === null ? "Save Attendance" : "Update Attendance");
} }
function AttendanceManagement_Conditional_22_For_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const employee_r7 = ctx.$implicit;
    i0.ɵɵproperty("ngValue", employee_r7.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", employee_r7.name, "", employee_r7.isActive ? "" : " (Relieved)");
} }
function AttendanceManagement_Conditional_22_For_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 22);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const status_r8 = ctx.$implicit;
    i0.ɵɵproperty("value", status_r8.value);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(status_r8.label);
} }
function AttendanceManagement_Conditional_22_Conditional_43_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 41);
    i0.ɵɵtext(1, "Loading attendance history...");
    i0.ɵɵelementEnd();
} }
function AttendanceManagement_Conditional_22_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 41);
    i0.ɵɵtext(1, "No attendance records found for these filters.");
    i0.ɵɵelementEnd();
} }
function AttendanceManagement_Conditional_22_Conditional_45_For_16_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 47);
    i0.ɵɵlistener("click", function AttendanceManagement_Conditional_22_Conditional_45_For_16_Conditional_13_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r9); const record_r10 = i0.ɵɵnextContext().$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.editAttendance(record_r10)); });
    i0.ɵɵtext(1, "Edit Status");
    i0.ɵɵelementEnd();
} }
function AttendanceManagement_Conditional_22_Conditional_45_For_16_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 46);
    i0.ɵɵtext(1, "History only");
    i0.ɵɵelementEnd();
} }
function AttendanceManagement_Conditional_22_Conditional_45_For_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "td")(4, "strong");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "td")(7, "span", 43);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "td")(10, "span", 44);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "td");
    i0.ɵɵconditionalCreate(13, AttendanceManagement_Conditional_22_Conditional_45_For_16_Conditional_13_Template, 2, 0, "button", 45)(14, AttendanceManagement_Conditional_22_Conditional_45_For_16_Conditional_14_Template, 2, 0, "span", 46);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const record_r10 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(record_r10.date);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(record_r10.employeeName);
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("relieved", !ctx_r0.isEmployeeActive(record_r10.employeeId));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.isEmployeeActive(record_r10.employeeId) ? "Active" : "Relieved");
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap("status " + ctx_r0.statusClass(record_r10.status));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(record_r10.status);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.isEmployeeActive(record_r10.employeeId) && ctx_r0.isToday(record_r10.date) ? 13 : 14);
} }
function AttendanceManagement_Conditional_22_Conditional_45_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 42)(1, "table")(2, "thead")(3, "tr")(4, "th");
    i0.ɵɵtext(5, "Date");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "th");
    i0.ɵɵtext(7, "Employee");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "th");
    i0.ɵɵtext(9, "Employment");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "th");
    i0.ɵɵtext(11, "Attendance");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "th");
    i0.ɵɵtext(13, "Action");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(14, "tbody");
    i0.ɵɵrepeaterCreate(15, AttendanceManagement_Conditional_22_Conditional_45_For_16_Template, 15, 9, "tr", null, _forTrack0);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(15);
    i0.ɵɵrepeater(ctx_r0.displayedRecords());
} }
function AttendanceManagement_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 8)(1, "div", 10)(2, "div")(3, "p", 11);
    i0.ɵɵtext(4, "Historical records");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "h2");
    i0.ɵɵtext(6, "Attendance History");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8, "Search records without losing access to relieved employees.");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "form", 27);
    i0.ɵɵlistener("ngSubmit", function AttendanceManagement_Conditional_22_Template_form_ngSubmit_9_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.applyFilters()); });
    i0.ɵɵelementStart(10, "div", 13)(11, "label", 28);
    i0.ɵɵtext(12, "Date");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(13, "input", 29);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "div", 13)(15, "label", 30);
    i0.ɵɵtext(16, "Employee");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "select", 31)(18, "option", 16);
    i0.ɵɵtext(19, "All employees");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(20, AttendanceManagement_Conditional_22_For_21_Template, 2, 3, "option", 16, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "div", 13)(23, "label", 32);
    i0.ɵɵtext(24, "Attendance status");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "select", 33)(26, "option", 34);
    i0.ɵɵtext(27, "All statuses");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(28, AttendanceManagement_Conditional_22_For_29_Template, 2, 2, "option", 22, _forTrack1);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "div", 13)(31, "label", 35);
    i0.ɵɵtext(32, "Arrange by");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "select", 36)(34, "option", 37);
    i0.ɵɵtext(35, "Newest date first");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "option", 38);
    i0.ɵɵtext(37, "Oldest date first");
    i0.ɵɵelementEnd()();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "div", 39)(39, "button", 40);
    i0.ɵɵtext(40, "Apply Filters");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(41, "button", 26);
    i0.ɵɵlistener("click", function AttendanceManagement_Conditional_22_Template_button_click_41_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.clearFilters()); });
    i0.ɵɵtext(42, "Clear");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(43, AttendanceManagement_Conditional_22_Conditional_43_Template, 2, 0, "p", 41)(44, AttendanceManagement_Conditional_22_Conditional_44_Template, 2, 0, "p", 41)(45, AttendanceManagement_Conditional_22_Conditional_45_Template, 17, 0, "div", 42);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(9);
    i0.ɵɵproperty("formGroup", ctx_r0.filterForm);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngValue", 0);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r0.allEmployees());
    i0.ɵɵadvance(5);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.statuses);
    i0.ɵɵadvance(5);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(10);
    i0.ɵɵconditional(ctx_r0.isLoading() ? 43 : ctx_r0.displayedRecords().length === 0 ? 44 : 45);
} }
export class AttendanceManagement {
    formBuilder = inject(FormBuilder);
    attendanceService = inject(AttendanceService);
    employeeService = inject(EmployeeService);
    route = inject(ActivatedRoute);
    statuses = [
        { value: 'Present', label: 'Present' },
        { value: 'Absent', label: 'Absent' },
        { value: 'Late', label: 'Late' },
        { value: 'HalfDay', label: 'Half Day' },
    ];
    activeEmployees = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "activeEmployees" }] : /* istanbul ignore next */ []));
    allEmployees = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "allEmployees" }] : /* istanbul ignore next */ []));
    records = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "records" }] : /* istanbul ignore next */ []));
    sortOrder = signal('newest', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sortOrder" }] : /* istanbul ignore next */ []));
    displayedRecords = computed(() => {
        const direction = this.sortOrder() === 'oldest' ? 1 : -1;
        return [...this.records()].sort((first, second) => {
            const dateComparison = first.date.localeCompare(second.date) * direction;
            return dateComparison || first.employeeName.localeCompare(second.employeeName);
        });
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "displayedRecords" }] : /* istanbul ignore next */ []));
    activeTab = signal('mark', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "activeTab" }] : /* istanbul ignore next */ []));
    editingId = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "editingId" }] : /* istanbul ignore next */ []));
    isLoading = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isLoading" }] : /* istanbul ignore next */ []));
    isSaving = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isSaving" }] : /* istanbul ignore next */ []));
    errorMessage = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorMessage" }] : /* istanbul ignore next */ []));
    successMessage = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "successMessage" }] : /* istanbul ignore next */ []));
    attendanceForm = this.formBuilder.nonNullable.group({
        employeeId: [0, Validators.min(1)],
        date: [this.today(), Validators.required],
        status: ['Present', Validators.required],
    });
    filterForm = this.formBuilder.nonNullable.group({
        date: [''],
        employeeId: [0],
        status: [''],
        sortOrder: ['newest'],
    });
    ngOnInit() {
        const query = this.route.snapshot.queryParamMap;
        const date = query.get('date') === 'today' ? this.today() : query.get('date') ?? '';
        const status = query.get('status') ?? '';
        if (query.get('tab') === 'history')
            this.activeTab.set('history');
        this.filterForm.patchValue({ date, status });
        forkJoin({ employees: this.employeeService.getEmployees(), records: this.attendanceService.getAttendance(date, undefined, status) })
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
            next: ({ employees, records }) => {
                this.allEmployees.set(employees);
                this.activeEmployees.set(employees.filter(employee => employee.isActive));
                this.records.set(records);
            },
            error: () => this.errorMessage.set('Attendance information could not be loaded.'),
        });
    }
    applyFilters() {
        const filters = this.filterForm.getRawValue();
        this.sortOrder.set(filters.sortOrder);
        this.loadRecords(filters.date, filters.employeeId || undefined, filters.status);
    }
    selectTab(tab) {
        if (tab === 'history' && this.editingId() !== null)
            this.cancelEdit();
        this.activeTab.set(tab);
        this.errorMessage.set('');
        this.successMessage.set('');
    }
    clearFilters() {
        this.filterForm.reset({ date: '', employeeId: 0, status: '', sortOrder: 'newest' });
        this.sortOrder.set('newest');
        this.loadRecords();
    }
    saveAttendance() {
        this.errorMessage.set('');
        this.successMessage.set('');
        if (this.attendanceForm.invalid) {
            this.attendanceForm.markAllAsTouched();
            return;
        }
        const request = this.attendanceForm.getRawValue();
        const editingId = this.editingId();
        const operation = editingId === null
            ? this.attendanceService.createAttendance(request)
            : this.attendanceService.updateAttendance(editingId, request);
        this.isSaving.set(true);
        operation.pipe(finalize(() => this.isSaving.set(false))).subscribe({
            next: () => {
                this.successMessage.set(editingId === null ? 'Attendance saved successfully.' : 'Attendance updated successfully.');
                this.cancelEdit();
                this.applyFilters();
            },
            error: (error) => this.errorMessage.set(error.error?.message ?? 'Attendance could not be saved.'),
        });
    }
    editAttendance(record) {
        if (!this.isEmployeeActive(record.employeeId))
            return;
        const status = record.status.replace(' ', '');
        this.activeTab.set('mark');
        this.editingId.set(record.id);
        this.attendanceForm.setValue({ employeeId: record.employeeId, date: record.date, status });
        this.attendanceForm.controls.employeeId.disable();
        this.attendanceForm.controls.date.disable();
        this.successMessage.set('');
        this.errorMessage.set('');
    }
    cancelEdit() {
        this.editingId.set(null);
        this.attendanceForm.controls.employeeId.enable();
        this.attendanceForm.controls.date.enable();
        this.attendanceForm.reset({ employeeId: 0, date: this.today(), status: 'Present' });
    }
    statusClass(status) {
        return status.toLowerCase().replace(' ', '-');
    }
    isEmployeeActive(employeeId) {
        return this.allEmployees().find(employee => employee.id === employeeId)?.isActive ?? false;
    }
    isToday(date) {
        return date === this.today();
    }
    loadRecords(date, employeeId, status) {
        this.isLoading.set(true);
        this.attendanceService.getAttendance(date, employeeId, status)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
            next: records => this.records.set(records),
            error: () => this.errorMessage.set('Attendance records could not be loaded.'),
        });
    }
    today() {
        const now = new Date();
        const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        return local.toISOString().slice(0, 10);
    }
    static ɵfac = function AttendanceManagement_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AttendanceManagement)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AttendanceManagement, selectors: [["app-attendance-management"]], decls: 23, vars: 9, consts: [[1, "attendance-page"], [1, "page-heading"], [1, "eyebrow"], ["role", "tablist", "aria-label", "Attendance sections", 1, "attendance-tabs"], ["type", "button", "role", "tab", 3, "click"], ["role", "alert", 1, "feedback", "error"], ["role", "status", 1, "feedback", "success"], ["role", "tabpanel", 1, "tab-panel"], ["role", "tabpanel", 1, "records-card", "tab-panel"], ["novalidate", "", 1, "record-form", 3, "ngSubmit", "formGroup"], [1, "card-heading"], [1, "section-label"], [1, "entry-grid"], [1, "field"], ["for", "employee"], ["id", "employee", "formControlName", "employeeId"], [3, "ngValue"], [1, "validation-error"], ["for", "attendance-date"], ["appDatePicker", "", "id", "attendance-date", "type", "date", "formControlName", "date"], ["for", "attendance-status"], ["id", "attendance-status", "formControlName", "status"], [3, "value"], [1, "form-actions"], ["type", "button", 1, "secondary"], ["type", "submit", 1, "primary", 3, "disabled"], ["type", "button", 1, "secondary", 3, "click"], [1, "filters", 3, "ngSubmit", "formGroup"], ["for", "history-date"], ["appDatePicker", "", "id", "history-date", "type", "date", "formControlName", "date"], ["for", "history-employee"], ["id", "history-employee", "formControlName", "employeeId"], ["for", "history-status"], ["id", "history-status", "formControlName", "status"], ["value", ""], ["for", "history-sort"], ["id", "history-sort", "formControlName", "sortOrder"], ["value", "newest"], ["value", "oldest"], [1, "filter-actions"], ["type", "submit", 1, "primary"], [1, "state-message"], [1, "table-scroll"], [1, "employment-status"], [1, "status"], ["type", "button", 1, "edit-button"], [1, "history-only"], ["type", "button", 1, "edit-button", 3, "click"]], template: function AttendanceManagement_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "p", 2);
            i0.ɵɵtext(3, "Daily workforce");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "h1");
            i0.ɵɵtext(5, "Attendance");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "p");
            i0.ɵɵtext(7, "Record daily attendance and review the complete history of active and relieved employees.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(8, "div", 3)(9, "button", 4);
            i0.ɵɵlistener("click", function AttendanceManagement_Template_button_click_9_listener() { return ctx.selectTab("mark"); });
            i0.ɵɵelementStart(10, "span");
            i0.ɵɵtext(11, "Mark Attendance");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(12, "small");
            i0.ɵɵtext(13, "Active employees only");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(14, "button", 4);
            i0.ɵɵlistener("click", function AttendanceManagement_Template_button_click_14_listener() { return ctx.selectTab("history"); });
            i0.ɵɵelementStart(15, "span");
            i0.ɵɵtext(16, "Attendance History");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "small");
            i0.ɵɵtext(18, "Active and relieved employees");
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(19, AttendanceManagement_Conditional_19_Template, 2, 1, "div", 5);
            i0.ɵɵconditionalCreate(20, AttendanceManagement_Conditional_20_Template, 2, 1, "div", 6);
            i0.ɵɵconditionalCreate(21, AttendanceManagement_Conditional_21_Template, 34, 7, "div", 7)(22, AttendanceManagement_Conditional_22_Template, 46, 3, "div", 8);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(9);
            i0.ɵɵclassProp("active", ctx.activeTab() === "mark");
            i0.ɵɵattribute("aria-selected", ctx.activeTab() === "mark");
            i0.ɵɵadvance(5);
            i0.ɵɵclassProp("active", ctx.activeTab() === "history");
            i0.ɵɵattribute("aria-selected", ctx.activeTab() === "history");
            i0.ɵɵadvance(5);
            i0.ɵɵconditional(ctx.errorMessage() ? 19 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.successMessage() ? 20 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.activeTab() === "mark" ? 21 : 22);
        } }, dependencies: [ReactiveFormsModule, i1.ɵNgNoValidate, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.SelectControlValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.FormGroupDirective, i1.FormControlName, DatePickerDirective], styles: [".attendance-page[_ngcontent-%COMP%] { display: grid; gap: 1.5rem; }\n.page-heading[_ngcontent-%COMP%] { max-width: 760px; }\n.eyebrow[_ngcontent-%COMP%], .section-label[_ngcontent-%COMP%] { margin: 0 0 .35rem; color: #2563eb; font-size: .75rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }\nh1[_ngcontent-%COMP%], h2[_ngcontent-%COMP%] { margin: 0; color: #0f172a; }\n.page-heading[_ngcontent-%COMP%]    > p[_ngcontent-%COMP%]:last-child, .card-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]:last-child { margin: .5rem 0 0; color: #64748b; }\n\n.attendance-tabs[_ngcontent-%COMP%] { display: grid; max-width: 720px; padding: .35rem; border: 1px solid #dbe3ef; border-radius: 12px; background: #eef2f7; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .35rem; }\n.attendance-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { display: grid; border: 0; border-radius: 9px; background: transparent; padding: .8rem 1rem; color: #64748b; text-align: left; cursor: pointer; gap: .18rem; }\n.attendance-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { font-weight: 700; }\n.attendance-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { font-size: .72rem; }\n.attendance-tabs[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] { background: #fff; color: #1d4ed8; box-shadow: 0 2px 8px rgb(15 23 42 / 10%); }\n\n.record-form[_ngcontent-%COMP%], .records-card[_ngcontent-%COMP%] { border: 1px solid #e2e8f0; border-radius: 14px; background: #fff; padding: 1.5rem; box-shadow: 0 8px 24px rgb(15 23 42 / 6%); }\n.record-form[_ngcontent-%COMP%] { max-width: 960px; }\n.card-heading[_ngcontent-%COMP%] { display: flex; margin-bottom: 1.25rem; justify-content: space-between; align-items: flex-start; gap: 1rem; }\n.entry-grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 1rem; }\n.field[_ngcontent-%COMP%] { min-width: 0; }\nlabel[_ngcontent-%COMP%] { display: block; margin: 0 0 .4rem; color: #334155; font-size: .85rem; font-weight: 700; }\ninput[_ngcontent-%COMP%], select[_ngcontent-%COMP%] { box-sizing: border-box; width: 100%; min-height: 44px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; padding: .7rem .8rem; color: #0f172a; font: inherit; }\ninput[_ngcontent-%COMP%]:focus, select[_ngcontent-%COMP%]:focus { border-color: #2563eb; outline: 3px solid #dbeafe; }\n\n.filters[_ngcontent-%COMP%] { display: grid; padding: 1rem; border-radius: 10px; background: #f8fafc; grid-template-columns: repeat(4, minmax(140px, 1fr)) auto; gap: .8rem; align-items: end; }\n.filter-actions[_ngcontent-%COMP%] { display: flex; gap: .55rem; }\nbutton[_ngcontent-%COMP%] { border-radius: 8px; padding: .65rem .85rem; font: inherit; font-weight: 600; cursor: pointer; }\n.primary[_ngcontent-%COMP%] { border: 1px solid #2563eb; background: #2563eb; color: #fff; }\n.primary[_ngcontent-%COMP%]:hover:not(:disabled) { background: #1d4ed8; }\n.secondary[_ngcontent-%COMP%] { border: 1px solid #cbd5e1; background: #fff; color: #334155; }\n.secondary[_ngcontent-%COMP%]:hover:not(:disabled) { background: #f8fafc; }\n.form-actions[_ngcontent-%COMP%] { display: flex; margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid #e2e8f0; justify-content: flex-end; gap: .75rem; }\n\n.feedback[_ngcontent-%COMP%] { border-radius: 8px; padding: .8rem 1rem; }\n.feedback.error[_ngcontent-%COMP%], .validation-error[_ngcontent-%COMP%] { color: #b91c1c; }\n.feedback.error[_ngcontent-%COMP%] { background: #fef2f2; }\n.feedback.success[_ngcontent-%COMP%] { background: #dcfce7; color: #166534; }\n.table-scroll[_ngcontent-%COMP%] { margin-top: 1.25rem; overflow-x: auto; }\ntable[_ngcontent-%COMP%] { width: 100%; border-collapse: collapse; text-align: left; }\nth[_ngcontent-%COMP%], td[_ngcontent-%COMP%] { padding: .9rem; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }\nth[_ngcontent-%COMP%] { background: #f8fafc; color: #475569; font-size: .75rem; letter-spacing: .03em; text-transform: uppercase; }\ntbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover { background: #f8fafc; }\n.status[_ngcontent-%COMP%], .employment-status[_ngcontent-%COMP%] { display: inline-block; border-radius: 999px; padding: .25rem .55rem; font-size: .78rem; font-weight: 700; }\n.employment-status[_ngcontent-%COMP%] { background: #dcfce7; color: #166534; }\n.employment-status.relieved[_ngcontent-%COMP%] { background: #f1f5f9; color: #475569; }\n.status[_ngcontent-%COMP%] { background: #e2e8f0; }\n.status.present[_ngcontent-%COMP%] { background: #dcfce7; color: #166534; }\n.status.absent[_ngcontent-%COMP%] { background: #fee2e2; color: #991b1b; }\n.status.late[_ngcontent-%COMP%], .status.half-day[_ngcontent-%COMP%] { background: #fef3c7; color: #92400e; }\n.status.on-leave[_ngcontent-%COMP%] { background: #dbeafe; color: #1e40af; }\n.edit-button[_ngcontent-%COMP%] { border: 0; background: transparent; padding: 0; color: #2563eb; }\n.history-only[_ngcontent-%COMP%] { color: #94a3b8; font-size: .82rem; font-weight: 600; }\n.state-message[_ngcontent-%COMP%] { margin: 1.5rem 0 .25rem; color: #64748b; text-align: center; }\nbutton[_ngcontent-%COMP%]:disabled { opacity: .6; cursor: not-allowed; }\n\n@media (max-width: 950px) { .entry-grid[_ngcontent-%COMP%], .filters[_ngcontent-%COMP%] { grid-template-columns: 1fr 1fr; } .filter-actions[_ngcontent-%COMP%] { align-self: end; } }\n@media (max-width: 600px) { .attendance-tabs[_ngcontent-%COMP%], .entry-grid[_ngcontent-%COMP%], .filters[_ngcontent-%COMP%] { grid-template-columns: 1fr; } .filter-actions[_ngcontent-%COMP%] { display: grid; grid-template-columns: 1fr 1fr; } .attendance-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { text-align: center; } }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AttendanceManagement, [{
        type: Component,
        args: [{ selector: 'app-attendance-management', imports: [ReactiveFormsModule, DatePickerDirective], template: "<section class=\"attendance-page\">\n  <div class=\"page-heading\">\n    <p class=\"eyebrow\">Daily workforce</p>\n    <h1>Attendance</h1>\n    <p>Record daily attendance and review the complete history of active and relieved employees.</p>\n  </div>\n\n  <div class=\"attendance-tabs\" role=\"tablist\" aria-label=\"Attendance sections\">\n    <button type=\"button\" role=\"tab\" [class.active]=\"activeTab() === 'mark'\" [attr.aria-selected]=\"activeTab() === 'mark'\" (click)=\"selectTab('mark')\">\n      <span>Mark Attendance</span><small>Active employees only</small>\n    </button>\n    <button type=\"button\" role=\"tab\" [class.active]=\"activeTab() === 'history'\" [attr.aria-selected]=\"activeTab() === 'history'\" (click)=\"selectTab('history')\">\n      <span>Attendance History</span><small>Active and relieved employees</small>\n    </button>\n  </div>\n\n  @if (errorMessage()) { <div class=\"feedback error\" role=\"alert\">{{ errorMessage() }}</div> }\n  @if (successMessage()) { <div class=\"feedback success\" role=\"status\">{{ successMessage() }}</div> }\n\n  @if (activeTab() === 'mark') {\n    <div class=\"tab-panel\" role=\"tabpanel\">\n      <form class=\"record-form\" [formGroup]=\"attendanceForm\" (ngSubmit)=\"saveAttendance()\" novalidate>\n        <div class=\"card-heading\">\n          <div><p class=\"section-label\">Daily entry</p><h2>{{ editingId() === null ? 'Mark Attendance' : 'Edit Attendance' }}</h2><p>Relieved employees are automatically excluded.</p></div>\n        </div>\n        <div class=\"entry-grid\">\n          <div class=\"field\">\n            <label for=\"employee\">Employee</label>\n            <select id=\"employee\" formControlName=\"employeeId\">\n              <option [ngValue]=\"0\">Select active employee</option>\n              @for (employee of activeEmployees(); track employee.id) { <option [ngValue]=\"employee.id\">{{ employee.name }}</option> }\n            </select>\n            @if (attendanceForm.controls.employeeId.touched && attendanceForm.controls.employeeId.invalid) { <small class=\"validation-error\">Employee is required.</small> }\n          </div>\n          <div class=\"field\"><label for=\"attendance-date\">Date</label><input appDatePicker id=\"attendance-date\" type=\"date\" formControlName=\"date\" /></div>\n          <div class=\"field\">\n            <label for=\"attendance-status\">Status</label>\n            <select id=\"attendance-status\" formControlName=\"status\">\n              @for (status of statuses; track status.value) { <option [value]=\"status.value\">{{ status.label }}</option> }\n            </select>\n          </div>\n        </div>\n        <div class=\"form-actions\">\n          @if (editingId() !== null) { <button class=\"secondary\" type=\"button\" (click)=\"cancelEdit()\">Cancel</button> }\n          <button class=\"primary\" type=\"submit\" [disabled]=\"isSaving()\">{{ isSaving() ? 'Saving...' : editingId() === null ? 'Save Attendance' : 'Update Attendance' }}</button>\n        </div>\n      </form>\n    </div>\n  } @else {\n    <div class=\"records-card tab-panel\" role=\"tabpanel\">\n      <div class=\"card-heading\"><div><p class=\"section-label\">Historical records</p><h2>Attendance History</h2><p>Search records without losing access to relieved employees.</p></div></div>\n      <form class=\"filters\" [formGroup]=\"filterForm\" (ngSubmit)=\"applyFilters()\">\n        <div class=\"field\"><label for=\"history-date\">Date</label><input appDatePicker id=\"history-date\" type=\"date\" formControlName=\"date\" /></div>\n        <div class=\"field\">\n          <label for=\"history-employee\">Employee</label>\n          <select id=\"history-employee\" formControlName=\"employeeId\">\n            <option [ngValue]=\"0\">All employees</option>\n            @for (employee of allEmployees(); track employee.id) { <option [ngValue]=\"employee.id\">{{ employee.name }}{{ employee.isActive ? '' : ' (Relieved)' }}</option> }\n          </select>\n        </div>\n        <div class=\"field\">\n          <label for=\"history-status\">Attendance status</label>\n          <select id=\"history-status\" formControlName=\"status\">\n            <option value=\"\">All statuses</option>\n            @for (status of statuses; track status.value) { <option [value]=\"status.value\">{{ status.label }}</option> }\n          </select>\n        </div>\n        <div class=\"field\">\n          <label for=\"history-sort\">Arrange by</label>\n          <select id=\"history-sort\" formControlName=\"sortOrder\">\n            <option value=\"newest\">Newest date first</option>\n            <option value=\"oldest\">Oldest date first</option>\n          </select>\n        </div>\n        <div class=\"filter-actions\"><button class=\"primary\" type=\"submit\">Apply Filters</button><button class=\"secondary\" type=\"button\" (click)=\"clearFilters()\">Clear</button></div>\n      </form>\n\n      @if (isLoading()) {\n        <p class=\"state-message\">Loading attendance history...</p>\n      } @else if (displayedRecords().length === 0) {\n        <p class=\"state-message\">No attendance records found for these filters.</p>\n      } @else {\n        <div class=\"table-scroll\">\n          <table>\n            <thead><tr><th>Date</th><th>Employee</th><th>Employment</th><th>Attendance</th><th>Action</th></tr></thead>\n            <tbody>\n              @for (record of displayedRecords(); track record.id) {\n                <tr>\n                  <td>{{ record.date }}</td><td><strong>{{ record.employeeName }}</strong></td>\n                  <td><span class=\"employment-status\" [class.relieved]=\"!isEmployeeActive(record.employeeId)\">{{ isEmployeeActive(record.employeeId) ? 'Active' : 'Relieved' }}</span></td>\n                  <td><span class=\"status\" [class]=\"'status ' + statusClass(record.status)\">{{ record.status }}</span></td>\n                  <td>\n                    @if (isEmployeeActive(record.employeeId) && isToday(record.date)) { <button class=\"edit-button\" type=\"button\" (click)=\"editAttendance(record)\">Edit Status</button> }\n                    @else { <span class=\"history-only\">History only</span> }\n                  </td>\n                </tr>\n              }\n            </tbody>\n          </table>\n        </div>\n      }\n    </div>\n  }\n</section>\n", styles: [".attendance-page { display: grid; gap: 1.5rem; }\n.page-heading { max-width: 760px; }\n.eyebrow, .section-label { margin: 0 0 .35rem; color: #2563eb; font-size: .75rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }\nh1, h2 { margin: 0; color: #0f172a; }\n.page-heading > p:last-child, .card-heading p:last-child { margin: .5rem 0 0; color: #64748b; }\n\n.attendance-tabs { display: grid; max-width: 720px; padding: .35rem; border: 1px solid #dbe3ef; border-radius: 12px; background: #eef2f7; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .35rem; }\n.attendance-tabs button { display: grid; border: 0; border-radius: 9px; background: transparent; padding: .8rem 1rem; color: #64748b; text-align: left; cursor: pointer; gap: .18rem; }\n.attendance-tabs button span { font-weight: 700; }\n.attendance-tabs button small { font-size: .72rem; }\n.attendance-tabs button.active { background: #fff; color: #1d4ed8; box-shadow: 0 2px 8px rgb(15 23 42 / 10%); }\n\n.record-form, .records-card { border: 1px solid #e2e8f0; border-radius: 14px; background: #fff; padding: 1.5rem; box-shadow: 0 8px 24px rgb(15 23 42 / 6%); }\n.record-form { max-width: 960px; }\n.card-heading { display: flex; margin-bottom: 1.25rem; justify-content: space-between; align-items: flex-start; gap: 1rem; }\n.entry-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 1rem; }\n.field { min-width: 0; }\nlabel { display: block; margin: 0 0 .4rem; color: #334155; font-size: .85rem; font-weight: 700; }\ninput, select { box-sizing: border-box; width: 100%; min-height: 44px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; padding: .7rem .8rem; color: #0f172a; font: inherit; }\ninput:focus, select:focus { border-color: #2563eb; outline: 3px solid #dbeafe; }\n\n.filters { display: grid; padding: 1rem; border-radius: 10px; background: #f8fafc; grid-template-columns: repeat(4, minmax(140px, 1fr)) auto; gap: .8rem; align-items: end; }\n.filter-actions { display: flex; gap: .55rem; }\nbutton { border-radius: 8px; padding: .65rem .85rem; font: inherit; font-weight: 600; cursor: pointer; }\n.primary { border: 1px solid #2563eb; background: #2563eb; color: #fff; }\n.primary:hover:not(:disabled) { background: #1d4ed8; }\n.secondary { border: 1px solid #cbd5e1; background: #fff; color: #334155; }\n.secondary:hover:not(:disabled) { background: #f8fafc; }\n.form-actions { display: flex; margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid #e2e8f0; justify-content: flex-end; gap: .75rem; }\n\n.feedback { border-radius: 8px; padding: .8rem 1rem; }\n.feedback.error, .validation-error { color: #b91c1c; }\n.feedback.error { background: #fef2f2; }\n.feedback.success { background: #dcfce7; color: #166534; }\n.table-scroll { margin-top: 1.25rem; overflow-x: auto; }\ntable { width: 100%; border-collapse: collapse; text-align: left; }\nth, td { padding: .9rem; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }\nth { background: #f8fafc; color: #475569; font-size: .75rem; letter-spacing: .03em; text-transform: uppercase; }\ntbody tr:hover { background: #f8fafc; }\n.status, .employment-status { display: inline-block; border-radius: 999px; padding: .25rem .55rem; font-size: .78rem; font-weight: 700; }\n.employment-status { background: #dcfce7; color: #166534; }\n.employment-status.relieved { background: #f1f5f9; color: #475569; }\n.status { background: #e2e8f0; }\n.status.present { background: #dcfce7; color: #166534; }\n.status.absent { background: #fee2e2; color: #991b1b; }\n.status.late, .status.half-day { background: #fef3c7; color: #92400e; }\n.status.on-leave { background: #dbeafe; color: #1e40af; }\n.edit-button { border: 0; background: transparent; padding: 0; color: #2563eb; }\n.history-only { color: #94a3b8; font-size: .82rem; font-weight: 600; }\n.state-message { margin: 1.5rem 0 .25rem; color: #64748b; text-align: center; }\nbutton:disabled { opacity: .6; cursor: not-allowed; }\n\n@media (max-width: 950px) { .entry-grid, .filters { grid-template-columns: 1fr 1fr; } .filter-actions { align-self: end; } }\n@media (max-width: 600px) { .attendance-tabs, .entry-grid, .filters { grid-template-columns: 1fr; } .filter-actions { display: grid; grid-template-columns: 1fr 1fr; } .attendance-tabs button { text-align: center; } }\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AttendanceManagement, { className: "AttendanceManagement", filePath: "src/app/components/attendance-management/attendance-management.ts", lineNumber: 18 }); })();
