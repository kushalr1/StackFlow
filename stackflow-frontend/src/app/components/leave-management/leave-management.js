import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { EmployeeService } from '../../services/employee.service';
import { LeaveRequestService } from '../../services/leave-request.service';
import { DatePickerDirective } from '../../directives/date-picker.directive';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _c0 = () => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.value;
function LeaveManagement_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorMessage());
} }
function LeaveManagement_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.successMessage());
} }
function LeaveManagement_Conditional_33_For_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 17);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const employee_r3 = ctx.$implicit;
    i0.ɵɵproperty("ngValue", employee_r3.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(employee_r3.name);
} }
function LeaveManagement_Conditional_33_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small", 18);
    i0.ɵɵtext(1, "Employee is required.");
    i0.ɵɵelementEnd();
} }
function LeaveManagement_Conditional_33_For_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 21);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const type_r4 = ctx.$implicit;
    i0.ɵɵproperty("value", type_r4.value);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(type_r4.label);
} }
function LeaveManagement_Conditional_33_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small", 18);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Leave dates must be between today and ", ctx_r0.latestLeaveDate, ".");
} }
function LeaveManagement_Conditional_33_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small", 18);
    i0.ɵɵtext(1, "End date cannot be before start date.");
    i0.ɵɵelementEnd();
} }
function LeaveManagement_Conditional_33_Conditional_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small", 18);
    i0.ɵɵtext(1, "Enter a reason of at least 5 characters.");
    i0.ɵɵelementEnd();
} }
function LeaveManagement_Conditional_33_Conditional_41_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 32);
    i0.ɵɵlistener("click", function LeaveManagement_Conditional_33_Conditional_41_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.cancelEdit()); });
    i0.ɵɵtext(1, "Cancel");
    i0.ɵɵelementEnd();
} }
function LeaveManagement_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 10);
    i0.ɵɵlistener("ngSubmit", function LeaveManagement_Conditional_33_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.saveRequest()); });
    i0.ɵɵelementStart(1, "div", 11)(2, "div")(3, "p", 12);
    i0.ɵɵtext(4, "Employee request");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "h2");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8, "Use this after an employee asks for leave. New requests are saved as Pending.");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "div", 13)(10, "div", 14)(11, "label", 15);
    i0.ɵɵtext(12, "Employee");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "select", 16)(14, "option", 17);
    i0.ɵɵtext(15, "Select active employee");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(16, LeaveManagement_Conditional_33_For_17_Template, 2, 2, "option", 17, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(18, LeaveManagement_Conditional_33_Conditional_18_Template, 2, 0, "small", 18);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "div", 14)(20, "label", 19);
    i0.ɵɵtext(21, "Leave Type");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "select", 20);
    i0.ɵɵrepeaterCreate(23, LeaveManagement_Conditional_33_For_24_Template, 2, 2, "option", 21, _forTrack1);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "div", 14)(26, "label", 22);
    i0.ɵɵtext(27, "Start Date");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(28, "input", 23);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "div", 14)(30, "label", 24);
    i0.ɵɵtext(31, "End Date");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(32, "input", 25);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(33, LeaveManagement_Conditional_33_Conditional_33_Template, 2, 1, "small", 18);
    i0.ɵɵconditionalCreate(34, LeaveManagement_Conditional_33_Conditional_34_Template, 2, 0, "small", 18);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "div", 26)(36, "label", 27);
    i0.ɵɵtext(37, "Employee's Reason");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(38, "textarea", 28);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(39, LeaveManagement_Conditional_33_Conditional_39_Template, 2, 0, "small", 18);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(40, "div", 29);
    i0.ɵɵconditionalCreate(41, LeaveManagement_Conditional_33_Conditional_41_Template, 2, 0, "button", 30);
    i0.ɵɵelementStart(42, "button", 31);
    i0.ɵɵtext(43);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("formGroup", ctx_r0.leaveForm);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r0.editingId() === null ? "Record Leave on Behalf of Employee" : "Edit Pending Leave Request");
    i0.ɵɵadvance(7);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngValue", 0);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r0.activeEmployees());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.leaveForm.controls.employeeId.touched && ctx_r0.leaveForm.controls.employeeId.invalid ? 18 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.leaveTypes);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("min", ctx_r0.earliestLeaveDate)("max", ctx_r0.latestLeaveDate);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("min", ctx_r0.earliestLeaveDate)("max", ctx_r0.latestLeaveDate);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional((ctx_r0.leaveForm.controls.startDate.touched || ctx_r0.leaveForm.controls.endDate.touched) && ctx_r0.leaveForm.hasError("dateOutOfRange") ? 33 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((ctx_r0.leaveForm.controls.startDate.touched || ctx_r0.leaveForm.controls.endDate.touched) && ctx_r0.leaveForm.hasError("invalidDateRange") ? 34 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.leaveForm.controls.reason.touched && ctx_r0.leaveForm.controls.reason.invalid ? 39 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.editingId() !== null ? 41 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.isSaving());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.isSaving() ? "Saving..." : ctx_r0.editingId() === null ? "Record Request" : "Update Request");
} }
function LeaveManagement_Conditional_34_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 33);
    i0.ɵɵtext(1, "Loading pending requests...");
    i0.ɵɵelementEnd();
} }
function LeaveManagement_Conditional_34_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 34)(1, "h3");
    i0.ɵɵtext(2, "All caught up");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4, "There are no pending leave requests.");
    i0.ɵɵelementEnd()();
} }
function LeaveManagement_Conditional_34_Conditional_11_For_16_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small", 36);
    i0.ɵɵtext(1, "Invalid dates \u2014 edit required");
    i0.ɵɵelementEnd();
} }
function LeaveManagement_Conditional_34_Conditional_11_For_16_Conditional_15_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 43);
    i0.ɵɵlistener("click", function LeaveManagement_Conditional_34_Conditional_11_For_16_Conditional_15_Conditional_2_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r9); const request_r8 = i0.ɵɵnextContext(2).$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.changeStatus(request_r8, "Approved")); });
    i0.ɵɵtext(1, "Approve");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r8 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", ctx_r0.updatingStatusId() === request_r8.id);
} }
function LeaveManagement_Conditional_34_Conditional_11_For_16_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 41);
    i0.ɵɵlistener("click", function LeaveManagement_Conditional_34_Conditional_11_For_16_Conditional_15_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r7); const request_r8 = i0.ɵɵnextContext().$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.editRequest(request_r8)); });
    i0.ɵɵtext(1, "Edit");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(2, LeaveManagement_Conditional_34_Conditional_11_For_16_Conditional_15_Conditional_2_Template, 2, 1, "button", 42);
} if (rf & 2) {
    const request_r8 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.isValidLeaveDates(request_r8) ? 2 : -1);
} }
function LeaveManagement_Conditional_34_Conditional_11_For_16_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr")(1, "td")(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "td");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "td");
    i0.ɵɵtext(7);
    i0.ɵɵelementStart(8, "small");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(10, LeaveManagement_Conditional_34_Conditional_11_For_16_Conditional_10_Template, 2, 0, "small", 36);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "td", 37);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "td", 38)(14, "div", 39);
    i0.ɵɵconditionalCreate(15, LeaveManagement_Conditional_34_Conditional_11_For_16_Conditional_15_Template, 3, 1);
    i0.ɵɵelementStart(16, "button", 40);
    i0.ɵɵlistener("click", function LeaveManagement_Conditional_34_Conditional_11_For_16_Template_button_click_16_listener() { const request_r8 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.changeStatus(request_r8, "Rejected")); });
    i0.ɵɵtext(17, "Reject");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const request_r8 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(request_r8.employeeName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(request_r8.leaveType);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(request_r8.startDate);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("to ", request_r8.endDate);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r0.isValidLeaveDates(request_r8) ? 10 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(request_r8.reason);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.isEmployeeActive(request_r8.employeeId) ? 15 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.updatingStatusId() === request_r8.id);
} }
function LeaveManagement_Conditional_34_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 35)(1, "table")(2, "thead")(3, "tr")(4, "th");
    i0.ɵɵtext(5, "Employee");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "th");
    i0.ɵɵtext(7, "Leave Type");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "th");
    i0.ɵɵtext(9, "Requested Dates");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "th");
    i0.ɵɵtext(11, "Reason");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "th");
    i0.ɵɵtext(13, "Decision");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(14, "tbody");
    i0.ɵɵrepeaterCreate(15, LeaveManagement_Conditional_34_Conditional_11_For_16_Template, 18, 8, "tr", null, _forTrack0);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(15);
    i0.ɵɵrepeater(ctx_r0.pendingRequests());
} }
function LeaveManagement_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 8)(1, "div", 11)(2, "div")(3, "p", 12);
    i0.ɵɵtext(4, "Needs a decision");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "h2");
    i0.ɵɵtext(6, "Pending Approvals");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8, "Review the employee's reason and requested dates before deciding.");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(9, LeaveManagement_Conditional_34_Conditional_9_Template, 2, 0, "p", 33)(10, LeaveManagement_Conditional_34_Conditional_10_Template, 5, 0, "div", 34)(11, LeaveManagement_Conditional_34_Conditional_11_Template, 17, 0, "div", 35);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(9);
    i0.ɵɵconditional(ctx_r0.isLoading() ? 9 : ctx_r0.pendingRequests().length === 0 ? 10 : 11);
} }
function LeaveManagement_Conditional_35_For_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const dayName_r11 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(dayName_r11);
} }
function LeaveManagement_Conditional_35_For_23_Conditional_1_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 56)(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "small");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const leave_r12 = ctx.$implicit;
    i0.ɵɵproperty("title", leave_r12.employeeName + " \u00B7 " + leave_r12.leaveType);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(leave_r12.employeeName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(leave_r12.leaveType);
} }
function LeaveManagement_Conditional_35_For_23_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 55);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(2, LeaveManagement_Conditional_35_For_23_Conditional_1_For_3_Template, 5, 3, "div", 56, _forTrack0);
} if (rf & 2) {
    const day_r13 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(day_r13.dayNumber);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(day_r13.leaves);
} }
function LeaveManagement_Conditional_35_For_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 54);
    i0.ɵɵconditionalCreate(1, LeaveManagement_Conditional_35_For_23_Conditional_1_Template, 4, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const day_r13 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("blank", !day_r13.date)("today", ctx_r0.isToday(day_r13.date));
    i0.ɵɵadvance();
    i0.ɵɵconditional(day_r13.date ? 1 : -1);
} }
function LeaveManagement_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 9)(1, "div", 44)(2, "div")(3, "p", 12);
    i0.ɵɵtext(4, "Approved leave");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "h2");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8, "Pending and rejected requests are not shown.");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "div", 45)(10, "button", 46);
    i0.ɵɵlistener("click", function LeaveManagement_Conditional_35_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r10); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.moveCalendarMonth(-1)); });
    i0.ɵɵtext(11, "\u2190");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "input", 47);
    i0.ɵɵlistener("change", function LeaveManagement_Conditional_35_Template_input_change_12_listener($event) { i0.ɵɵrestoreView(_r10); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.changeCalendarMonth($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "button", 48);
    i0.ɵɵlistener("click", function LeaveManagement_Conditional_35_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r10); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.moveCalendarMonth(1)); });
    i0.ɵɵtext(14, "\u2192");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "button", 49);
    i0.ɵɵlistener("click", function LeaveManagement_Conditional_35_Template_button_click_15_listener() { i0.ɵɵrestoreView(_r10); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.showCurrentMonth()); });
    i0.ɵɵtext(16, "Current month");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(17, "div", 50)(18, "div", 51);
    i0.ɵɵrepeaterCreate(19, LeaveManagement_Conditional_35_For_20_Template, 2, 1, "div", null, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "div", 52);
    i0.ɵɵrepeaterCreate(22, LeaveManagement_Conditional_35_For_23_Template, 2, 5, "div", 53, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r0.calendarTitle());
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("value", ctx_r0.calendarMonth());
    i0.ɵɵadvance(7);
    i0.ɵɵrepeater(i0.ɵɵpureFunction0(2, _c0));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.calendarDays());
} }
function LeaveManagement_Conditional_36_For_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 17);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const employee_r15 = ctx.$implicit;
    i0.ɵɵproperty("ngValue", employee_r15.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", employee_r15.name, "", employee_r15.isActive ? "" : " (Relieved)");
} }
function LeaveManagement_Conditional_36_For_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 21);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const type_r16 = ctx.$implicit;
    i0.ɵɵproperty("value", type_r16.value);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(type_r16.label);
} }
function LeaveManagement_Conditional_36_For_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 21);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const status_r17 = ctx.$implicit;
    i0.ɵɵproperty("value", status_r17);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(status_r17);
} }
function LeaveManagement_Conditional_36_Conditional_51_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 33);
    i0.ɵɵtext(1, "Loading leave history...");
    i0.ɵɵelementEnd();
} }
function LeaveManagement_Conditional_36_Conditional_52_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 34)(1, "h3");
    i0.ɵɵtext(2, "No matching requests");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4, "Try clearing or changing the filters.");
    i0.ɵɵelementEnd()();
} }
function LeaveManagement_Conditional_36_Conditional_53_For_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td")(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "td")(5, "span", 73);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "td");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "td");
    i0.ɵɵtext(10);
    i0.ɵɵelementStart(11, "small");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "td")(14, "span", 74);
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "td", 37);
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const request_r18 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(request_r18.employeeName);
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("relieved", !ctx_r0.isEmployeeActive(request_r18.employeeId));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.isEmployeeActive(request_r18.employeeId) ? "Active" : "Relieved");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(request_r18.leaveType);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(request_r18.startDate);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("to ", request_r18.endDate);
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap("status " + request_r18.status.toLowerCase());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(request_r18.status);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(request_r18.reason);
} }
function LeaveManagement_Conditional_36_Conditional_53_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 35)(1, "table")(2, "thead")(3, "tr")(4, "th");
    i0.ɵɵtext(5, "Employee");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "th");
    i0.ɵɵtext(7, "Employment");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "th");
    i0.ɵɵtext(9, "Leave");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "th");
    i0.ɵɵtext(11, "Dates");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "th");
    i0.ɵɵtext(13, "Decision");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "th");
    i0.ɵɵtext(15, "Reason");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(16, "tbody");
    i0.ɵɵrepeaterCreate(17, LeaveManagement_Conditional_36_Conditional_53_For_18_Template, 18, 11, "tr", null, _forTrack0);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(17);
    i0.ɵɵrepeater(ctx_r0.displayedHistory());
} }
function LeaveManagement_Conditional_36_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 8)(1, "div", 11)(2, "div")(3, "p", 12);
    i0.ɵɵtext(4, "Complete record");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "h2");
    i0.ɵɵtext(6, "Leave History");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8, "Search pending, approved, and rejected requests across current, previous, or future months.");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "form", 57);
    i0.ɵɵlistener("ngSubmit", function LeaveManagement_Conditional_36_Template_form_ngSubmit_9_listener() { i0.ɵɵrestoreView(_r14); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.applyFilters()); });
    i0.ɵɵelementStart(10, "div", 14)(11, "label", 58);
    i0.ɵɵtext(12, "Employee");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "select", 59)(14, "option", 17);
    i0.ɵɵtext(15, "All employees");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(16, LeaveManagement_Conditional_36_For_17_Template, 2, 3, "option", 17, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "div", 14)(19, "label", 60);
    i0.ɵɵtext(20, "Leave type");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "select", 61)(22, "option", 62);
    i0.ɵɵtext(23, "All leave types");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(24, LeaveManagement_Conditional_36_For_25_Template, 2, 2, "option", 21, _forTrack1);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "div", 14)(27, "label", 63);
    i0.ɵɵtext(28, "Decision");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "select", 64)(30, "option", 62);
    i0.ɵɵtext(31, "All statuses");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(32, LeaveManagement_Conditional_36_For_33_Template, 2, 2, "option", 21, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "div", 14)(35, "label", 65);
    i0.ɵɵtext(36, "Month");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(37, "input", 66);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "div", 14)(39, "label", 67);
    i0.ɵɵtext(40, "Arrange by");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(41, "select", 68)(42, "option", 69);
    i0.ɵɵtext(43, "Newest first");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(44, "option", 70);
    i0.ɵɵtext(45, "Oldest first");
    i0.ɵɵelementEnd()();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(46, "div", 71)(47, "button", 72);
    i0.ɵɵtext(48, "Apply Filters");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(49, "button", 32);
    i0.ɵɵlistener("click", function LeaveManagement_Conditional_36_Template_button_click_49_listener() { i0.ɵɵrestoreView(_r14); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.clearFilters()); });
    i0.ɵɵtext(50, "Clear");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(51, LeaveManagement_Conditional_36_Conditional_51_Template, 2, 0, "p", 33)(52, LeaveManagement_Conditional_36_Conditional_52_Template, 5, 0, "div", 34)(53, LeaveManagement_Conditional_36_Conditional_53_Template, 19, 0, "div", 35);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(9);
    i0.ɵɵproperty("formGroup", ctx_r0.filterForm);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngValue", 0);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r0.allEmployees());
    i0.ɵɵadvance(5);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.leaveTypes);
    i0.ɵɵadvance(5);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.statuses);
    i0.ɵɵadvance(5);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(10);
    i0.ɵɵconditional(ctx_r0.isLoading() ? 51 : ctx_r0.displayedHistory().length === 0 ? 52 : 53);
} }
const dateRangeValidator = (control) => {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;
    const today = new Date();
    const latest = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    const latestDate = localDateString(latest);
    const earliestDate = localDateString(today);
    if ((startDate && (startDate < earliestDate || startDate > latestDate)) ||
        (endDate && (endDate < earliestDate || endDate > latestDate))) {
        return { dateOutOfRange: true };
    }
    return startDate && endDate && endDate < startDate ? { invalidDateRange: true } : null;
};
function localDateString(date) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
}
export class LeaveManagement {
    formBuilder = inject(FormBuilder);
    employeeService = inject(EmployeeService);
    leaveService = inject(LeaveRequestService);
    route = inject(ActivatedRoute);
    leaveTypes = [
        { value: 'CasualLeave', label: 'Casual Leave' },
        { value: 'SickLeave', label: 'Sick Leave' },
        { value: 'PaidLeave', label: 'Paid Leave' },
        { value: 'Other', label: 'Other' },
    ];
    statuses = ['Pending', 'Approved', 'Rejected'];
    earliestLeaveDate = localDateString(new Date());
    latestLeaveDate = localDateString(new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()));
    activeEmployees = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "activeEmployees" }] : /* istanbul ignore next */ []));
    allEmployees = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "allEmployees" }] : /* istanbul ignore next */ []));
    requests = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "requests" }] : /* istanbul ignore next */ []));
    activeTab = signal('record', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "activeTab" }] : /* istanbul ignore next */ []));
    historyFilters = signal({
        employeeId: 0,
        status: '',
        leaveType: '',
        month: '',
        sortOrder: 'newest',
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "historyFilters" }] : /* istanbul ignore next */ []));
    calendarMonth = signal(localDateString(new Date()).slice(0, 7), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "calendarMonth" }] : /* istanbul ignore next */ []));
    pendingRequests = computed(() => this.requests()
        .filter(request => request.status === 'Pending')
        .sort((first, second) => second.appliedOn.localeCompare(first.appliedOn)), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pendingRequests" }] : /* istanbul ignore next */ []));
    displayedHistory = computed(() => {
        const filters = this.historyFilters();
        const direction = filters.sortOrder === 'oldest' ? 1 : -1;
        const monthStart = filters.month ? `${filters.month}-01` : '';
        const monthEnd = filters.month
            ? localDateString(new Date(Number(filters.month.slice(0, 4)), Number(filters.month.slice(5, 7)), 0))
            : '';
        return this.requests()
            .filter(request => !filters.employeeId || request.employeeId === filters.employeeId)
            .filter(request => !filters.status || request.status === filters.status)
            .filter(request => !filters.leaveType || request.leaveType.replace(' ', '') === filters.leaveType)
            .filter(request => !filters.month || (request.startDate <= monthEnd && request.endDate >= monthStart))
            .sort((first, second) => {
            const dateComparison = first.startDate.localeCompare(second.startDate) * direction;
            return dateComparison || first.employeeName.localeCompare(second.employeeName);
        });
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "displayedHistory" }] : /* istanbul ignore next */ []));
    calendarTitle = computed(() => {
        const [year, month] = this.calendarMonth().split('-').map(Number);
        return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' })
            .format(new Date(year, month - 1, 1));
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "calendarTitle" }] : /* istanbul ignore next */ []));
    calendarDays = computed(() => {
        const [year, month] = this.calendarMonth().split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const leadingBlanks = (new Date(year, month - 1, 1).getDay() + 6) % 7;
        const approved = this.requests().filter(request => request.status === 'Approved');
        const days = Array.from({ length: leadingBlanks }, () => ({ date: '', dayNumber: 0, leaves: [] }));
        for (let day = 1; day <= daysInMonth; day += 1) {
            const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            days.push({
                date,
                dayNumber: day,
                leaves: approved.filter(request => request.startDate <= date && request.endDate >= date),
            });
        }
        return days;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "calendarDays" }] : /* istanbul ignore next */ []));
    editingId = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "editingId" }] : /* istanbul ignore next */ []));
    isLoading = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isLoading" }] : /* istanbul ignore next */ []));
    isSaving = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isSaving" }] : /* istanbul ignore next */ []));
    updatingStatusId = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "updatingStatusId" }] : /* istanbul ignore next */ []));
    errorMessage = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorMessage" }] : /* istanbul ignore next */ []));
    successMessage = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "successMessage" }] : /* istanbul ignore next */ []));
    leaveForm = this.formBuilder.nonNullable.group({
        employeeId: [0, Validators.min(1)],
        leaveType: ['CasualLeave', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        reason: ['', [Validators.required, Validators.pattern(/.*\S.*/), Validators.minLength(5), Validators.maxLength(500)]],
    }, { validators: dateRangeValidator });
    filterForm = this.formBuilder.nonNullable.group({
        employeeId: [0],
        status: [''],
        leaveType: [''],
        month: [''],
        sortOrder: ['newest'],
    });
    ngOnInit() {
        const requestedTab = this.route.snapshot.queryParamMap.get('tab');
        if (requestedTab === 'pending' || requestedTab === 'calendar' || requestedTab === 'history' || requestedTab === 'record') {
            this.activeTab.set(requestedTab);
        }
        forkJoin({ employees: this.employeeService.getEmployees(), requests: this.leaveService.getLeaveRequests() })
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
            next: ({ employees, requests }) => {
                this.allEmployees.set(employees);
                this.activeEmployees.set(employees.filter(employee => employee.isActive));
                this.requests.set(requests);
            },
            error: () => this.errorMessage.set('Leave request information could not be loaded.'),
        });
    }
    saveRequest() {
        this.clearMessages();
        if (this.leaveForm.invalid) {
            this.leaveForm.markAllAsTouched();
            return;
        }
        const raw = this.leaveForm.getRawValue();
        const request = { ...raw, reason: raw.reason.trim() };
        const editingId = this.editingId();
        const operation = editingId === null
            ? this.leaveService.createLeaveRequest(request)
            : this.leaveService.updateLeaveRequest(editingId, request);
        this.isSaving.set(true);
        operation.pipe(finalize(() => this.isSaving.set(false))).subscribe({
            next: () => {
                this.successMessage.set(editingId === null ? 'Leave request recorded successfully.' : 'Leave request updated successfully.');
                this.cancelEdit();
                this.loadRequests();
            },
            error: (error) => this.errorMessage.set(error.error?.message ?? 'Leave request could not be saved.'),
        });
    }
    editRequest(request) {
        this.activeTab.set('record');
        this.editingId.set(request.id);
        this.clearMessages();
        this.leaveForm.setValue({
            employeeId: request.employeeId,
            leaveType: request.leaveType.replace(' ', ''),
            startDate: request.startDate,
            endDate: request.endDate,
            reason: request.reason,
        });
    }
    cancelEdit() {
        this.editingId.set(null);
        this.leaveForm.reset({ employeeId: 0, leaveType: 'CasualLeave', startDate: '', endDate: '', reason: '' });
    }
    changeStatus(request, status) {
        this.clearMessages();
        this.updatingStatusId.set(request.id);
        this.leaveService.updateStatus(request.id, status)
            .pipe(finalize(() => this.updatingStatusId.set(null)))
            .subscribe({
            next: () => {
                this.successMessage.set(`Leave request ${status.toLowerCase()}.`);
                this.loadRequests();
            },
            error: (error) => {
                const message = error.status === 0
                    ? 'The API connection was interrupted. Confirm the backend is running on http://localhost:5090, then refresh this page and try again.'
                    : error.error?.message ?? 'Leave status could not be updated.';
                this.errorMessage.set(message);
            },
        });
    }
    applyFilters() {
        const filters = this.filterForm.getRawValue();
        this.historyFilters.set({
            employeeId: filters.employeeId,
            status: filters.status,
            leaveType: filters.leaveType,
            month: filters.month,
            sortOrder: filters.sortOrder,
        });
    }
    clearFilters() {
        this.filterForm.reset({ employeeId: 0, status: '', leaveType: '', month: '', sortOrder: 'newest' });
        this.historyFilters.set({ employeeId: 0, status: '', leaveType: '', month: '', sortOrder: 'newest' });
    }
    selectTab(tab) {
        if (tab !== 'record' && this.editingId() !== null)
            this.cancelEdit();
        this.activeTab.set(tab);
        this.clearMessages();
    }
    moveCalendarMonth(offset) {
        const [year, month] = this.calendarMonth().split('-').map(Number);
        const next = new Date(year, month - 1 + offset, 1);
        this.calendarMonth.set(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
    }
    showCurrentMonth() {
        this.calendarMonth.set(localDateString(new Date()).slice(0, 7));
    }
    changeCalendarMonth(event) {
        const month = event.target.value;
        if (month)
            this.calendarMonth.set(month);
    }
    isToday(date) {
        return date === localDateString(new Date());
    }
    isEmployeeActive(employeeId) {
        return this.allEmployees().find(employee => employee.id === employeeId)?.isActive ?? false;
    }
    isValidLeaveDates(request) {
        return request.startDate >= this.earliestLeaveDate &&
            request.endDate <= this.latestLeaveDate &&
            request.endDate >= request.startDate;
    }
    loadRequests() {
        this.isLoading.set(true);
        this.leaveService.getLeaveRequests()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
            next: requests => this.requests.set(requests),
            error: () => this.errorMessage.set('Leave requests could not be loaded.'),
        });
    }
    clearMessages() {
        this.errorMessage.set('');
        this.successMessage.set('');
    }
    static ɵfac = function LeaveManagement_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || LeaveManagement)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: LeaveManagement, selectors: [["app-leave-management"]], decls: 37, vars: 19, consts: [[1, "leave-page"], [1, "page-heading"], [1, "eyebrow"], ["role", "tablist", "aria-label", "Leave management sections", 1, "leave-tabs"], ["type", "button", "role", "tab", 3, "click"], ["role", "alert", 1, "feedback", "error"], ["role", "status", 1, "feedback", "success"], ["novalidate", "", "role", "tabpanel", 1, "request-form", "panel", 3, "formGroup"], ["role", "tabpanel", 1, "panel"], ["role", "tabpanel", 1, "panel", "calendar-panel"], ["novalidate", "", "role", "tabpanel", 1, "request-form", "panel", 3, "ngSubmit", "formGroup"], [1, "panel-heading"], [1, "section-label"], [1, "form-grid"], [1, "field"], ["for", "leave-employee"], ["id", "leave-employee", "formControlName", "employeeId"], [3, "ngValue"], [1, "validation-error"], ["for", "leave-type"], ["id", "leave-type", "formControlName", "leaveType"], [3, "value"], ["for", "start-date"], ["appDatePicker", "", "id", "start-date", "type", "date", "formControlName", "startDate", 3, "min", "max"], ["for", "end-date"], ["appDatePicker", "", "id", "end-date", "type", "date", "formControlName", "endDate", 3, "min", "max"], [1, "field", "reason-field"], ["for", "leave-reason"], ["id", "leave-reason", "rows", "4", "maxlength", "500", "formControlName", "reason"], [1, "form-actions"], ["type", "button", 1, "secondary"], ["type", "submit", 1, "primary", 3, "disabled"], ["type", "button", 1, "secondary", 3, "click"], [1, "state-message"], [1, "empty-state"], [1, "table-scroll"], [1, "invalid-date"], [1, "reason-cell"], [1, "actions-cell"], [1, "actions"], ["type", "button", 1, "reject", 3, "click", "disabled"], ["type", "button", 3, "click"], ["type", "button", 1, "approve", 3, "disabled"], ["type", "button", 1, "approve", 3, "click", "disabled"], [1, "calendar-toolbar"], [1, "month-navigation"], ["type", "button", "aria-label", "Previous month", "title", "Previous month", 1, "month-arrow", 3, "click"], ["appDatePicker", "", "type", "month", "aria-label", "Choose calendar month", 3, "change", "value"], ["type", "button", "aria-label", "Next month", "title", "Next month", 1, "month-arrow", 3, "click"], ["type", "button", 1, "current-month", 3, "click"], [1, "calendar-scroll"], [1, "calendar-grid", "weekday-row"], [1, "calendar-grid", "month-grid"], [1, "calendar-day", 3, "blank", "today"], [1, "calendar-day"], [1, "day-number"], [1, "leave-event", 3, "title"], [1, "filters", 3, "ngSubmit", "formGroup"], ["for", "history-employee"], ["id", "history-employee", "formControlName", "employeeId"], ["for", "history-type"], ["id", "history-type", "formControlName", "leaveType"], ["value", ""], ["for", "history-status"], ["id", "history-status", "formControlName", "status"], ["for", "history-month"], ["appDatePicker", "", "id", "history-month", "type", "month", "formControlName", "month"], ["for", "history-sort"], ["id", "history-sort", "formControlName", "sortOrder"], ["value", "newest"], ["value", "oldest"], [1, "filter-actions"], ["type", "submit", 1, "primary"], [1, "employment-status"], [1, "status"]], template: function LeaveManagement_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "p", 2);
            i0.ɵɵtext(3, "Time away");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "h1");
            i0.ɵɵtext(5, "Leave Management");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "p");
            i0.ɵɵtext(7, "Record employee requests, make decisions, and review approved leave across months.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(8, "nav", 3)(9, "button", 4);
            i0.ɵɵlistener("click", function LeaveManagement_Template_button_click_9_listener() { return ctx.selectTab("record"); });
            i0.ɵɵelementStart(10, "span");
            i0.ɵɵtext(11, "Record Request");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(12, "small");
            i0.ɵɵtext(13, "On behalf of employee");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(14, "button", 4);
            i0.ɵɵlistener("click", function LeaveManagement_Template_button_click_14_listener() { return ctx.selectTab("pending"); });
            i0.ɵɵelementStart(15, "span");
            i0.ɵɵtext(16, "Pending Approvals ");
            i0.ɵɵelementStart(17, "b");
            i0.ɵɵtext(18);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(19, "small");
            i0.ɵɵtext(20, "Approve or reject");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(21, "button", 4);
            i0.ɵɵlistener("click", function LeaveManagement_Template_button_click_21_listener() { return ctx.selectTab("calendar"); });
            i0.ɵɵelementStart(22, "span");
            i0.ɵɵtext(23, "Leave Calendar");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "small");
            i0.ɵɵtext(25, "Approved leave only");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(26, "button", 4);
            i0.ɵɵlistener("click", function LeaveManagement_Template_button_click_26_listener() { return ctx.selectTab("history"); });
            i0.ɵɵelementStart(27, "span");
            i0.ɵɵtext(28, "Leave History");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(29, "small");
            i0.ɵɵtext(30, "All decisions and months");
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(31, LeaveManagement_Conditional_31_Template, 2, 1, "div", 5);
            i0.ɵɵconditionalCreate(32, LeaveManagement_Conditional_32_Template, 2, 1, "div", 6);
            i0.ɵɵconditionalCreate(33, LeaveManagement_Conditional_33_Template, 44, 14, "form", 7);
            i0.ɵɵconditionalCreate(34, LeaveManagement_Conditional_34_Template, 12, 1, "section", 8);
            i0.ɵɵconditionalCreate(35, LeaveManagement_Conditional_35_Template, 24, 3, "section", 9);
            i0.ɵɵconditionalCreate(36, LeaveManagement_Conditional_36_Template, 54, 3, "section", 8);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(9);
            i0.ɵɵclassProp("active", ctx.activeTab() === "record");
            i0.ɵɵattribute("aria-selected", ctx.activeTab() === "record");
            i0.ɵɵadvance(5);
            i0.ɵɵclassProp("active", ctx.activeTab() === "pending");
            i0.ɵɵattribute("aria-selected", ctx.activeTab() === "pending");
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.pendingRequests().length);
            i0.ɵɵadvance(3);
            i0.ɵɵclassProp("active", ctx.activeTab() === "calendar");
            i0.ɵɵattribute("aria-selected", ctx.activeTab() === "calendar");
            i0.ɵɵadvance(5);
            i0.ɵɵclassProp("active", ctx.activeTab() === "history");
            i0.ɵɵattribute("aria-selected", ctx.activeTab() === "history");
            i0.ɵɵadvance(5);
            i0.ɵɵconditional(ctx.errorMessage() ? 31 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.successMessage() ? 32 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.activeTab() === "record" ? 33 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.activeTab() === "pending" ? 34 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.activeTab() === "calendar" ? 35 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.activeTab() === "history" ? 36 : -1);
        } }, dependencies: [ReactiveFormsModule, i1.ɵNgNoValidate, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.SelectControlValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.MaxLengthValidator, i1.FormGroupDirective, i1.FormControlName, DatePickerDirective], styles: [".leave-page[_ngcontent-%COMP%] { display: grid; gap: 1.5rem; }\n.page-heading[_ngcontent-%COMP%] { max-width: 780px; }\n.eyebrow[_ngcontent-%COMP%], .section-label[_ngcontent-%COMP%] { margin: 0 0 .35rem; color: #2563eb; font-size: .75rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }\nh1[_ngcontent-%COMP%], h2[_ngcontent-%COMP%], h3[_ngcontent-%COMP%] { margin: 0; color: #0f172a; }\n.page-heading[_ngcontent-%COMP%]    > p[_ngcontent-%COMP%]:last-child, .panel-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]:last-child, .calendar-toolbar[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]:last-child { margin: .5rem 0 0; color: #64748b; }\n\n.leave-tabs[_ngcontent-%COMP%] { display: grid; padding: .35rem; border: 1px solid #dbe3ef; border-radius: 12px; background: #eef2f7; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .35rem; }\n.leave-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { display: grid; border: 0; border-radius: 9px; background: transparent; padding: .8rem .9rem; color: #64748b; text-align: left; cursor: pointer; gap: .18rem; }\n.leave-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { font-weight: 700; }\n.leave-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { font-size: .7rem; }\n.leave-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   b[_ngcontent-%COMP%] { display: inline-grid; min-width: 1.35rem; height: 1.35rem; margin-left: .25rem; border-radius: 999px; background: #fef3c7; color: #92400e; font-size: .72rem; place-items: center; }\n.leave-tabs[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] { background: #fff; color: #1d4ed8; box-shadow: 0 2px 8px rgb(15 23 42 / 10%); }\n\n.panel[_ngcontent-%COMP%] { border: 1px solid #e2e8f0; border-radius: 14px; background: #fff; padding: 1.5rem; box-shadow: 0 8px 24px rgb(15 23 42 / 6%); }\n.panel-heading[_ngcontent-%COMP%] { margin-bottom: 1.25rem; }\n.form-grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; align-items: start; }\n.field[_ngcontent-%COMP%] { min-width: 0; }\n.reason-field[_ngcontent-%COMP%] { grid-column: 1 / -1; }\nlabel[_ngcontent-%COMP%] { display: block; margin: 0 0 .4rem; color: #334155; font-size: .85rem; font-weight: 700; }\ninput[_ngcontent-%COMP%], select[_ngcontent-%COMP%], textarea[_ngcontent-%COMP%] { box-sizing: border-box; width: 100%; min-height: 44px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; padding: .7rem .8rem; color: #0f172a; font: inherit; }\ninput[type='date'][_ngcontent-%COMP%], input[type='month'][_ngcontent-%COMP%] { cursor: pointer; }\ntextarea[_ngcontent-%COMP%] { resize: vertical; }\ninput[_ngcontent-%COMP%]:focus, select[_ngcontent-%COMP%]:focus, textarea[_ngcontent-%COMP%]:focus { border-color: #2563eb; outline: 3px solid #dbeafe; }\n\n.filters[_ngcontent-%COMP%] { display: grid; padding: 1rem; border-radius: 10px; background: #f8fafc; grid-template-columns: repeat(5, minmax(130px, 1fr)) auto; gap: .75rem; align-items: end; }\n.filter-actions[_ngcontent-%COMP%], .form-actions[_ngcontent-%COMP%] { display: flex; gap: .55rem; }\n.form-actions[_ngcontent-%COMP%] { margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid #e2e8f0; justify-content: flex-end; }\nbutton[_ngcontent-%COMP%] { border-radius: 8px; padding: .65rem .85rem; font: inherit; font-weight: 600; cursor: pointer; }\n.primary[_ngcontent-%COMP%] { border: 1px solid #2563eb; background: #2563eb; color: #fff; }\n.primary[_ngcontent-%COMP%]:hover:not(:disabled) { background: #1d4ed8; }\n.secondary[_ngcontent-%COMP%] { border: 1px solid #cbd5e1; background: #fff; color: #334155; }\n.secondary[_ngcontent-%COMP%]:hover:not(:disabled) { background: #f8fafc; }\n\n.feedback[_ngcontent-%COMP%] { border-radius: 8px; padding: .8rem 1rem; }\n.feedback.error[_ngcontent-%COMP%], .validation-error[_ngcontent-%COMP%] { color: #b91c1c; }\n.feedback.error[_ngcontent-%COMP%] { background: #fef2f2; }\n.feedback.success[_ngcontent-%COMP%] { background: #dcfce7; color: #166534; }\n.state-message[_ngcontent-%COMP%] { margin: 1.5rem 0; color: #64748b; text-align: center; }\n.empty-state[_ngcontent-%COMP%] { padding: 3rem 1rem; color: #64748b; text-align: center; }\n.empty-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: .5rem 0 0; }\n\n.table-scroll[_ngcontent-%COMP%] { overflow-x: auto; }\ntable[_ngcontent-%COMP%] { width: 100%; border-collapse: collapse; text-align: left; }\nth[_ngcontent-%COMP%], td[_ngcontent-%COMP%] { padding: .9rem; border-bottom: 1px solid #e2e8f0; vertical-align: top; }\nth[_ngcontent-%COMP%] { background: #f8fafc; color: #475569; font-size: .73rem; letter-spacing: .03em; text-transform: uppercase; white-space: nowrap; }\ntbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover { background: #f8fafc; }\ntd[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { display: block; margin-top: .25rem; color: #64748b; }\ntd[_ngcontent-%COMP%]   small.invalid-date[_ngcontent-%COMP%] { color: #b91c1c; font-weight: 700; }\n.reason-cell[_ngcontent-%COMP%] { min-width: 180px; max-width: 300px; color: #475569; }\n.status[_ngcontent-%COMP%], .employment-status[_ngcontent-%COMP%] { display: inline-block; border-radius: 999px; padding: .25rem .55rem; font-size: .78rem; font-weight: 700; white-space: nowrap; }\n.employment-status[_ngcontent-%COMP%] { background: #dcfce7; color: #166534; }\n.employment-status.relieved[_ngcontent-%COMP%] { background: #f1f5f9; color: #475569; }\n.status.pending[_ngcontent-%COMP%] { background: #fef3c7; color: #92400e; }\n.status.approved[_ngcontent-%COMP%] { background: #dcfce7; color: #166534; }\n.status.rejected[_ngcontent-%COMP%] { background: #fee2e2; color: #991b1b; }\n.actions[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: .6rem; white-space: nowrap; }\n.actions-cell[_ngcontent-%COMP%] { vertical-align: middle; }\n.actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { border: 0; background: transparent; padding: 0; color: #2563eb; }\n.actions[_ngcontent-%COMP%]   .approve[_ngcontent-%COMP%] { color: #15803d; }\n.actions[_ngcontent-%COMP%]   .reject[_ngcontent-%COMP%] { color: #dc2626; }\n\n.calendar-toolbar[_ngcontent-%COMP%] { display: flex; margin-bottom: 1.25rem; align-items: flex-start; justify-content: space-between; gap: 1rem; }\n.month-navigation[_ngcontent-%COMP%] { display: flex; align-items: center; gap: .45rem; }\n.month-navigation[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { width: 165px; min-height: 42px; }\n.month-arrow[_ngcontent-%COMP%] { display: grid; width: 42px; height: 42px; border: 1px solid #cbd5e1; background: #fff; padding: 0; color: #334155; font-size: 1.15rem; place-items: center; }\n.month-arrow[_ngcontent-%COMP%]:hover { border-color: #2563eb; color: #2563eb; }\n.current-month[_ngcontent-%COMP%] { border: 0; background: transparent; color: #2563eb; font-size: .82rem; }\n.current-month[_ngcontent-%COMP%]:hover { text-decoration: underline; }\n.calendar-scroll[_ngcontent-%COMP%] { overflow-x: auto; }\n.calendar-grid[_ngcontent-%COMP%] { display: grid; min-width: 840px; grid-template-columns: repeat(7, minmax(120px, 1fr)); }\n.weekday-row[_ngcontent-%COMP%] { border: 1px solid #e2e8f0; border-bottom: 0; border-radius: 10px 10px 0 0; background: #f8fafc; }\n.weekday-row[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] { padding: .65rem; color: #64748b; font-size: .72rem; font-weight: 700; text-align: center; text-transform: uppercase; }\n.month-grid[_ngcontent-%COMP%] { border-top: 1px solid #e2e8f0; border-left: 1px solid #e2e8f0; }\n.calendar-day[_ngcontent-%COMP%] { min-height: 125px; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: .55rem; background: #fff; }\n.calendar-day.blank[_ngcontent-%COMP%] { background: #f8fafc; }\n.calendar-day.today[_ngcontent-%COMP%] { background: #eff6ff; box-shadow: inset 0 0 0 2px #3b82f6; }\n.day-number[_ngcontent-%COMP%] { display: inline-grid; width: 1.7rem; height: 1.7rem; margin-bottom: .35rem; border-radius: 999px; color: #334155; font-size: .8rem; font-weight: 700; place-items: center; }\n.calendar-day.today[_ngcontent-%COMP%]   .day-number[_ngcontent-%COMP%] { background: #2563eb; color: #fff; }\n.leave-event[_ngcontent-%COMP%] { display: grid; margin-top: .3rem; border-left: 3px solid #2563eb; border-radius: 5px; background: #dbeafe; padding: .35rem .45rem; color: #1e3a8a; font-size: .72rem; gap: .1rem; overflow: hidden; }\n.leave-event[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], .leave-event[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.leave-event[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { color: #475569; }\nbutton[_ngcontent-%COMP%]:disabled { opacity: .6; cursor: not-allowed; }\n\n@media (max-width: 1100px) { .leave-tabs[_ngcontent-%COMP%] { grid-template-columns: 1fr 1fr; } .form-grid[_ngcontent-%COMP%] { grid-template-columns: 1fr 1fr; } .filters[_ngcontent-%COMP%] { grid-template-columns: 1fr 1fr 1fr; } }\n@media (max-width: 650px) { .leave-tabs[_ngcontent-%COMP%], .form-grid[_ngcontent-%COMP%], .filters[_ngcontent-%COMP%] { grid-template-columns: 1fr; } .leave-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { text-align: center; } .calendar-toolbar[_ngcontent-%COMP%] { flex-direction: column; } .month-navigation[_ngcontent-%COMP%], .filter-actions[_ngcontent-%COMP%] { width: 100%; } .month-navigation[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { flex: 1; } .filter-actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { flex: 1; } .current-month[_ngcontent-%COMP%] { display: none; } }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(LeaveManagement, [{
        type: Component,
        args: [{ selector: 'app-leave-management', imports: [ReactiveFormsModule, DatePickerDirective], template: "<section class=\"leave-page\">\n  <div class=\"page-heading\">\n    <p class=\"eyebrow\">Time away</p>\n    <h1>Leave Management</h1>\n    <p>Record employee requests, make decisions, and review approved leave across months.</p>\n  </div>\n\n  <nav class=\"leave-tabs\" role=\"tablist\" aria-label=\"Leave management sections\">\n    <button type=\"button\" role=\"tab\" [class.active]=\"activeTab() === 'record'\" [attr.aria-selected]=\"activeTab() === 'record'\" (click)=\"selectTab('record')\"><span>Record Request</span><small>On behalf of employee</small></button>\n    <button type=\"button\" role=\"tab\" [class.active]=\"activeTab() === 'pending'\" [attr.aria-selected]=\"activeTab() === 'pending'\" (click)=\"selectTab('pending')\"><span>Pending Approvals <b>{{ pendingRequests().length }}</b></span><small>Approve or reject</small></button>\n    <button type=\"button\" role=\"tab\" [class.active]=\"activeTab() === 'calendar'\" [attr.aria-selected]=\"activeTab() === 'calendar'\" (click)=\"selectTab('calendar')\"><span>Leave Calendar</span><small>Approved leave only</small></button>\n    <button type=\"button\" role=\"tab\" [class.active]=\"activeTab() === 'history'\" [attr.aria-selected]=\"activeTab() === 'history'\" (click)=\"selectTab('history')\"><span>Leave History</span><small>All decisions and months</small></button>\n  </nav>\n\n  @if (errorMessage()) { <div class=\"feedback error\" role=\"alert\">{{ errorMessage() }}</div> }\n  @if (successMessage()) { <div class=\"feedback success\" role=\"status\">{{ successMessage() }}</div> }\n\n  @if (activeTab() === 'record') {\n    <form class=\"request-form panel\" [formGroup]=\"leaveForm\" (ngSubmit)=\"saveRequest()\" novalidate role=\"tabpanel\">\n      <div class=\"panel-heading\">\n        <div><p class=\"section-label\">Employee request</p><h2>{{ editingId() === null ? 'Record Leave on Behalf of Employee' : 'Edit Pending Leave Request' }}</h2><p>Use this after an employee asks for leave. New requests are saved as Pending.</p></div>\n      </div>\n      <div class=\"form-grid\">\n        <div class=\"field\">\n          <label for=\"leave-employee\">Employee</label>\n          <select id=\"leave-employee\" formControlName=\"employeeId\">\n            <option [ngValue]=\"0\">Select active employee</option>\n            @for (employee of activeEmployees(); track employee.id) { <option [ngValue]=\"employee.id\">{{ employee.name }}</option> }\n          </select>\n          @if (leaveForm.controls.employeeId.touched && leaveForm.controls.employeeId.invalid) { <small class=\"validation-error\">Employee is required.</small> }\n        </div>\n        <div class=\"field\"><label for=\"leave-type\">Leave Type</label><select id=\"leave-type\" formControlName=\"leaveType\">@for (type of leaveTypes; track type.value) { <option [value]=\"type.value\">{{ type.label }}</option> }</select></div>\n        <div class=\"field\"><label for=\"start-date\">Start Date</label><input appDatePicker id=\"start-date\" type=\"date\" [min]=\"earliestLeaveDate\" [max]=\"latestLeaveDate\" formControlName=\"startDate\" /></div>\n        <div class=\"field\">\n          <label for=\"end-date\">End Date</label><input appDatePicker id=\"end-date\" type=\"date\" [min]=\"earliestLeaveDate\" [max]=\"latestLeaveDate\" formControlName=\"endDate\" />\n          @if ((leaveForm.controls.startDate.touched || leaveForm.controls.endDate.touched) && leaveForm.hasError('dateOutOfRange')) { <small class=\"validation-error\">Leave dates must be between today and {{ latestLeaveDate }}.</small> }\n          @if ((leaveForm.controls.startDate.touched || leaveForm.controls.endDate.touched) && leaveForm.hasError('invalidDateRange')) { <small class=\"validation-error\">End date cannot be before start date.</small> }\n        </div>\n        <div class=\"field reason-field\"><label for=\"leave-reason\">Employee's Reason</label><textarea id=\"leave-reason\" rows=\"4\" maxlength=\"500\" formControlName=\"reason\"></textarea>@if (leaveForm.controls.reason.touched && leaveForm.controls.reason.invalid) { <small class=\"validation-error\">Enter a reason of at least 5 characters.</small> }</div>\n      </div>\n      <div class=\"form-actions\">@if (editingId() !== null) { <button class=\"secondary\" type=\"button\" (click)=\"cancelEdit()\">Cancel</button> }<button class=\"primary\" type=\"submit\" [disabled]=\"isSaving()\">{{ isSaving() ? 'Saving...' : editingId() === null ? 'Record Request' : 'Update Request' }}</button></div>\n    </form>\n  }\n\n  @if (activeTab() === 'pending') {\n    <section class=\"panel\" role=\"tabpanel\">\n      <div class=\"panel-heading\"><div><p class=\"section-label\">Needs a decision</p><h2>Pending Approvals</h2><p>Review the employee's reason and requested dates before deciding.</p></div></div>\n      @if (isLoading()) { <p class=\"state-message\">Loading pending requests...</p> }\n      @else if (pendingRequests().length === 0) { <div class=\"empty-state\"><h3>All caught up</h3><p>There are no pending leave requests.</p></div> }\n      @else {\n        <div class=\"table-scroll\"><table><thead><tr><th>Employee</th><th>Leave Type</th><th>Requested Dates</th><th>Reason</th><th>Decision</th></tr></thead><tbody>\n          @for (request of pendingRequests(); track request.id) {\n            <tr><td><strong>{{ request.employeeName }}</strong></td><td>{{ request.leaveType }}</td><td>{{ request.startDate }}<small>to {{ request.endDate }}</small>@if (!isValidLeaveDates(request)) { <small class=\"invalid-date\">Invalid dates \u2014 edit required</small> }</td><td class=\"reason-cell\">{{ request.reason }}</td><td class=\"actions-cell\"><div class=\"actions\">\n              @if (isEmployeeActive(request.employeeId)) { <button type=\"button\" (click)=\"editRequest(request)\">Edit</button>@if (isValidLeaveDates(request)) { <button class=\"approve\" type=\"button\" [disabled]=\"updatingStatusId() === request.id\" (click)=\"changeStatus(request, 'Approved')\">Approve</button> } }\n              <button class=\"reject\" type=\"button\" [disabled]=\"updatingStatusId() === request.id\" (click)=\"changeStatus(request, 'Rejected')\">Reject</button>\n            </div></td></tr>\n          }\n        </tbody></table></div>\n      }\n    </section>\n  }\n\n  @if (activeTab() === 'calendar') {\n    <section class=\"panel calendar-panel\" role=\"tabpanel\">\n      <div class=\"calendar-toolbar\">\n        <div><p class=\"section-label\">Approved leave</p><h2>{{ calendarTitle() }}</h2><p>Pending and rejected requests are not shown.</p></div>\n        <div class=\"month-navigation\">\n          <button class=\"month-arrow\" type=\"button\" aria-label=\"Previous month\" title=\"Previous month\" (click)=\"moveCalendarMonth(-1)\">\u2190</button>\n          <input appDatePicker type=\"month\" aria-label=\"Choose calendar month\" [value]=\"calendarMonth()\" (change)=\"changeCalendarMonth($event)\" />\n          <button class=\"month-arrow\" type=\"button\" aria-label=\"Next month\" title=\"Next month\" (click)=\"moveCalendarMonth(1)\">\u2192</button>\n          <button class=\"current-month\" type=\"button\" (click)=\"showCurrentMonth()\">Current month</button>\n        </div>\n      </div>\n      <div class=\"calendar-scroll\">\n        <div class=\"calendar-grid weekday-row\">@for (dayName of ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']; track dayName) { <div>{{ dayName }}</div> }</div>\n        <div class=\"calendar-grid month-grid\">\n          @for (day of calendarDays(); track $index) {\n            <div class=\"calendar-day\" [class.blank]=\"!day.date\" [class.today]=\"isToday(day.date)\">\n              @if (day.date) { <span class=\"day-number\">{{ day.dayNumber }}</span>@for (leave of day.leaves; track leave.id) { <div class=\"leave-event\" [title]=\"leave.employeeName + ' \u00B7 ' + leave.leaveType\"><strong>{{ leave.employeeName }}</strong><small>{{ leave.leaveType }}</small></div> } }\n            </div>\n          }\n        </div>\n      </div>\n    </section>\n  }\n\n  @if (activeTab() === 'history') {\n    <section class=\"panel\" role=\"tabpanel\">\n      <div class=\"panel-heading\"><div><p class=\"section-label\">Complete record</p><h2>Leave History</h2><p>Search pending, approved, and rejected requests across current, previous, or future months.</p></div></div>\n      <form class=\"filters\" [formGroup]=\"filterForm\" (ngSubmit)=\"applyFilters()\">\n        <div class=\"field\"><label for=\"history-employee\">Employee</label><select id=\"history-employee\" formControlName=\"employeeId\"><option [ngValue]=\"0\">All employees</option>@for (employee of allEmployees(); track employee.id) { <option [ngValue]=\"employee.id\">{{ employee.name }}{{ employee.isActive ? '' : ' (Relieved)' }}</option> }</select></div>\n        <div class=\"field\"><label for=\"history-type\">Leave type</label><select id=\"history-type\" formControlName=\"leaveType\"><option value=\"\">All leave types</option>@for (type of leaveTypes; track type.value) { <option [value]=\"type.value\">{{ type.label }}</option> }</select></div>\n        <div class=\"field\"><label for=\"history-status\">Decision</label><select id=\"history-status\" formControlName=\"status\"><option value=\"\">All statuses</option>@for (status of statuses; track status) { <option [value]=\"status\">{{ status }}</option> }</select></div>\n        <div class=\"field\"><label for=\"history-month\">Month</label><input appDatePicker id=\"history-month\" type=\"month\" formControlName=\"month\" /></div>\n        <div class=\"field\"><label for=\"history-sort\">Arrange by</label><select id=\"history-sort\" formControlName=\"sortOrder\"><option value=\"newest\">Newest first</option><option value=\"oldest\">Oldest first</option></select></div>\n        <div class=\"filter-actions\"><button class=\"primary\" type=\"submit\">Apply Filters</button><button class=\"secondary\" type=\"button\" (click)=\"clearFilters()\">Clear</button></div>\n      </form>\n      @if (isLoading()) { <p class=\"state-message\">Loading leave history...</p> }\n      @else if (displayedHistory().length === 0) { <div class=\"empty-state\"><h3>No matching requests</h3><p>Try clearing or changing the filters.</p></div> }\n      @else {\n        <div class=\"table-scroll\"><table><thead><tr><th>Employee</th><th>Employment</th><th>Leave</th><th>Dates</th><th>Decision</th><th>Reason</th></tr></thead><tbody>\n          @for (request of displayedHistory(); track request.id) { <tr><td><strong>{{ request.employeeName }}</strong></td><td><span class=\"employment-status\" [class.relieved]=\"!isEmployeeActive(request.employeeId)\">{{ isEmployeeActive(request.employeeId) ? 'Active' : 'Relieved' }}</span></td><td>{{ request.leaveType }}</td><td>{{ request.startDate }}<small>to {{ request.endDate }}</small></td><td><span class=\"status\" [class]=\"'status ' + request.status.toLowerCase()\">{{ request.status }}</span></td><td class=\"reason-cell\">{{ request.reason }}</td></tr> }\n        </tbody></table></div>\n      }\n    </section>\n  }\n</section>\n", styles: [".leave-page { display: grid; gap: 1.5rem; }\n.page-heading { max-width: 780px; }\n.eyebrow, .section-label { margin: 0 0 .35rem; color: #2563eb; font-size: .75rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }\nh1, h2, h3 { margin: 0; color: #0f172a; }\n.page-heading > p:last-child, .panel-heading p:last-child, .calendar-toolbar p:last-child { margin: .5rem 0 0; color: #64748b; }\n\n.leave-tabs { display: grid; padding: .35rem; border: 1px solid #dbe3ef; border-radius: 12px; background: #eef2f7; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .35rem; }\n.leave-tabs button { display: grid; border: 0; border-radius: 9px; background: transparent; padding: .8rem .9rem; color: #64748b; text-align: left; cursor: pointer; gap: .18rem; }\n.leave-tabs button span { font-weight: 700; }\n.leave-tabs button small { font-size: .7rem; }\n.leave-tabs button b { display: inline-grid; min-width: 1.35rem; height: 1.35rem; margin-left: .25rem; border-radius: 999px; background: #fef3c7; color: #92400e; font-size: .72rem; place-items: center; }\n.leave-tabs button.active { background: #fff; color: #1d4ed8; box-shadow: 0 2px 8px rgb(15 23 42 / 10%); }\n\n.panel { border: 1px solid #e2e8f0; border-radius: 14px; background: #fff; padding: 1.5rem; box-shadow: 0 8px 24px rgb(15 23 42 / 6%); }\n.panel-heading { margin-bottom: 1.25rem; }\n.form-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; align-items: start; }\n.field { min-width: 0; }\n.reason-field { grid-column: 1 / -1; }\nlabel { display: block; margin: 0 0 .4rem; color: #334155; font-size: .85rem; font-weight: 700; }\ninput, select, textarea { box-sizing: border-box; width: 100%; min-height: 44px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; padding: .7rem .8rem; color: #0f172a; font: inherit; }\ninput[type='date'], input[type='month'] { cursor: pointer; }\ntextarea { resize: vertical; }\ninput:focus, select:focus, textarea:focus { border-color: #2563eb; outline: 3px solid #dbeafe; }\n\n.filters { display: grid; padding: 1rem; border-radius: 10px; background: #f8fafc; grid-template-columns: repeat(5, minmax(130px, 1fr)) auto; gap: .75rem; align-items: end; }\n.filter-actions, .form-actions { display: flex; gap: .55rem; }\n.form-actions { margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid #e2e8f0; justify-content: flex-end; }\nbutton { border-radius: 8px; padding: .65rem .85rem; font: inherit; font-weight: 600; cursor: pointer; }\n.primary { border: 1px solid #2563eb; background: #2563eb; color: #fff; }\n.primary:hover:not(:disabled) { background: #1d4ed8; }\n.secondary { border: 1px solid #cbd5e1; background: #fff; color: #334155; }\n.secondary:hover:not(:disabled) { background: #f8fafc; }\n\n.feedback { border-radius: 8px; padding: .8rem 1rem; }\n.feedback.error, .validation-error { color: #b91c1c; }\n.feedback.error { background: #fef2f2; }\n.feedback.success { background: #dcfce7; color: #166534; }\n.state-message { margin: 1.5rem 0; color: #64748b; text-align: center; }\n.empty-state { padding: 3rem 1rem; color: #64748b; text-align: center; }\n.empty-state p { margin: .5rem 0 0; }\n\n.table-scroll { overflow-x: auto; }\ntable { width: 100%; border-collapse: collapse; text-align: left; }\nth, td { padding: .9rem; border-bottom: 1px solid #e2e8f0; vertical-align: top; }\nth { background: #f8fafc; color: #475569; font-size: .73rem; letter-spacing: .03em; text-transform: uppercase; white-space: nowrap; }\ntbody tr:hover { background: #f8fafc; }\ntd small { display: block; margin-top: .25rem; color: #64748b; }\ntd small.invalid-date { color: #b91c1c; font-weight: 700; }\n.reason-cell { min-width: 180px; max-width: 300px; color: #475569; }\n.status, .employment-status { display: inline-block; border-radius: 999px; padding: .25rem .55rem; font-size: .78rem; font-weight: 700; white-space: nowrap; }\n.employment-status { background: #dcfce7; color: #166534; }\n.employment-status.relieved { background: #f1f5f9; color: #475569; }\n.status.pending { background: #fef3c7; color: #92400e; }\n.status.approved { background: #dcfce7; color: #166534; }\n.status.rejected { background: #fee2e2; color: #991b1b; }\n.actions { display: flex; flex-wrap: wrap; gap: .6rem; white-space: nowrap; }\n.actions-cell { vertical-align: middle; }\n.actions button { border: 0; background: transparent; padding: 0; color: #2563eb; }\n.actions .approve { color: #15803d; }\n.actions .reject { color: #dc2626; }\n\n.calendar-toolbar { display: flex; margin-bottom: 1.25rem; align-items: flex-start; justify-content: space-between; gap: 1rem; }\n.month-navigation { display: flex; align-items: center; gap: .45rem; }\n.month-navigation input { width: 165px; min-height: 42px; }\n.month-arrow { display: grid; width: 42px; height: 42px; border: 1px solid #cbd5e1; background: #fff; padding: 0; color: #334155; font-size: 1.15rem; place-items: center; }\n.month-arrow:hover { border-color: #2563eb; color: #2563eb; }\n.current-month { border: 0; background: transparent; color: #2563eb; font-size: .82rem; }\n.current-month:hover { text-decoration: underline; }\n.calendar-scroll { overflow-x: auto; }\n.calendar-grid { display: grid; min-width: 840px; grid-template-columns: repeat(7, minmax(120px, 1fr)); }\n.weekday-row { border: 1px solid #e2e8f0; border-bottom: 0; border-radius: 10px 10px 0 0; background: #f8fafc; }\n.weekday-row div { padding: .65rem; color: #64748b; font-size: .72rem; font-weight: 700; text-align: center; text-transform: uppercase; }\n.month-grid { border-top: 1px solid #e2e8f0; border-left: 1px solid #e2e8f0; }\n.calendar-day { min-height: 125px; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: .55rem; background: #fff; }\n.calendar-day.blank { background: #f8fafc; }\n.calendar-day.today { background: #eff6ff; box-shadow: inset 0 0 0 2px #3b82f6; }\n.day-number { display: inline-grid; width: 1.7rem; height: 1.7rem; margin-bottom: .35rem; border-radius: 999px; color: #334155; font-size: .8rem; font-weight: 700; place-items: center; }\n.calendar-day.today .day-number { background: #2563eb; color: #fff; }\n.leave-event { display: grid; margin-top: .3rem; border-left: 3px solid #2563eb; border-radius: 5px; background: #dbeafe; padding: .35rem .45rem; color: #1e3a8a; font-size: .72rem; gap: .1rem; overflow: hidden; }\n.leave-event strong, .leave-event small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.leave-event small { color: #475569; }\nbutton:disabled { opacity: .6; cursor: not-allowed; }\n\n@media (max-width: 1100px) { .leave-tabs { grid-template-columns: 1fr 1fr; } .form-grid { grid-template-columns: 1fr 1fr; } .filters { grid-template-columns: 1fr 1fr 1fr; } }\n@media (max-width: 650px) { .leave-tabs, .form-grid, .filters { grid-template-columns: 1fr; } .leave-tabs button { text-align: center; } .calendar-toolbar { flex-direction: column; } .month-navigation, .filter-actions { width: 100%; } .month-navigation input { flex: 1; } .filter-actions button { flex: 1; } .current-month { display: none; } }\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(LeaveManagement, { className: "LeaveManagement", filePath: "src/app/components/leave-management/leave-management.ts", lineNumber: 55 }); })();
