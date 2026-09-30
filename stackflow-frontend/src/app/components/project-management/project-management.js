import { Component, computed, HostListener, inject, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { EmployeeService } from '../../services/employee.service';
import { ProjectService } from '../../services/project.service';
import { DatePickerDirective } from '../../directives/date-picker.directive';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _c0 = ["projectFormElement"];
const _c1 = ["projectNameInput"];
const _forTrack0 = ($index, $item) => $item.value;
const _forTrack1 = ($index, $item) => $item.id;
function ProjectManagement_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 8);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorMessage());
} }
function ProjectManagement_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.successMessage());
} }
function ProjectManagement_Conditional_24_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1, "Enter at least 2 characters.");
    i0.ɵɵelementEnd();
} }
function ProjectManagement_Conditional_24_For_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 17);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const status_r3 = ctx.$implicit;
    i0.ɵɵproperty("value", status_r3.value);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(status_r3.label);
} }
function ProjectManagement_Conditional_24_For_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 17);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const priority_r4 = ctx.$implicit;
    i0.ɵɵproperty("value", priority_r4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(priority_r4);
} }
function ProjectManagement_Conditional_24_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1, "Due date cannot be before start date.");
    i0.ɵɵelementEnd();
} }
function ProjectManagement_Conditional_24_Conditional_38_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1, "An active or on-hold project cannot start in the future.");
    i0.ɵɵelementEnd();
} }
function ProjectManagement_Conditional_24_Conditional_39_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1, "Enter the actual completion date.");
    i0.ɵɵelementEnd();
} }
function ProjectManagement_Conditional_24_Conditional_39_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1, "The actual completion date cannot be in the future.");
    i0.ɵɵelementEnd();
} }
function ProjectManagement_Conditional_24_Conditional_39_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1, "Completion cannot be before the start date.");
    i0.ɵɵelementEnd();
} }
function ProjectManagement_Conditional_24_Conditional_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "label");
    i0.ɵɵtext(2, "Completed On (actual date)");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(3, "input", 25);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(4, ProjectManagement_Conditional_24_Conditional_39_Conditional_4_Template, 2, 0, "small");
    i0.ɵɵconditionalCreate(5, ProjectManagement_Conditional_24_Conditional_39_Conditional_5_Template, 2, 0, "small");
    i0.ɵɵconditionalCreate(6, ProjectManagement_Conditional_24_Conditional_39_Conditional_6_Template, 2, 0, "small");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.projectForm.hasError("completedWithoutDate") ? 4 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.projectForm.hasError("futureCompletedProject") ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.projectForm.hasError("completionBeforeStart") ? 6 : -1);
} }
function ProjectManagement_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 11, 0);
    i0.ɵɵlistener("ngSubmit", function ProjectManagement_Conditional_24_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.saveProject()); });
    i0.ɵɵelementStart(2, "div", 12)(3, "div")(4, "p", 4);
    i0.ɵɵtext(5, "Project details");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "h2");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "button", 13);
    i0.ɵɵlistener("click", function ProjectManagement_Conditional_24_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.cancelEdit()); });
    i0.ɵɵtext(9, "Back to Projects");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(10, "div", 14)(11, "div")(12, "label");
    i0.ɵɵtext(13, "Name");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(14, "input", 15, 1);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(16, ProjectManagement_Conditional_24_Conditional_16_Template, 2, 0, "small");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "div")(18, "label");
    i0.ɵɵtext(19, "Status");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "select", 16);
    i0.ɵɵrepeaterCreate(21, ProjectManagement_Conditional_24_For_22_Template, 2, 2, "option", 17, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "div")(24, "label");
    i0.ɵɵtext(25, "Priority");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "select", 18);
    i0.ɵɵrepeaterCreate(27, ProjectManagement_Conditional_24_For_28_Template, 2, 2, "option", 17, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "div")(30, "label");
    i0.ɵɵtext(31, "Start Date");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(32, "input", 19);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "div")(34, "label");
    i0.ɵɵtext(35, "Due Date (planned deadline)");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(36, "input", 20);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(37, ProjectManagement_Conditional_24_Conditional_37_Template, 2, 0, "small");
    i0.ɵɵconditionalCreate(38, ProjectManagement_Conditional_24_Conditional_38_Template, 2, 0, "small");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(39, ProjectManagement_Conditional_24_Conditional_39_Template, 7, 3, "div");
    i0.ɵɵelementStart(40, "div", 21)(41, "label");
    i0.ɵɵtext(42, "Description");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(43, "textarea", 22);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(44, "div", 23)(45, "button", 13);
    i0.ɵɵlistener("click", function ProjectManagement_Conditional_24_Template_button_click_45_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.cancelEdit()); });
    i0.ɵɵtext(46, "Cancel");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(47, "button", 24);
    i0.ɵɵtext(48);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("formGroup", ctx_r0.projectForm);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(ctx_r0.editingId() === null ? "Create Project" : "Edit Project");
    i0.ɵɵadvance(7);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.projectForm.controls.name.touched && ctx_r0.projectForm.controls.name.invalid ? 16 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.statuses);
    i0.ɵɵadvance(5);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.priorities);
    i0.ɵɵadvance(5);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.projectForm.hasError("invalidDateRange") ? 37 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.projectForm.hasError("futureActiveProject") ? 38 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.projectForm.controls.status.value === "Completed" ? 39 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.editingId() === null ? "Create Project" : "Save Changes");
} }
function ProjectManagement_Conditional_25_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 13);
    i0.ɵɵlistener("click", function ProjectManagement_Conditional_25_Conditional_6_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.clearStatusFilter()); });
    i0.ɵɵtext(1, "Show All Current Projects");
    i0.ɵɵelementEnd();
} }
function ProjectManagement_Conditional_25_Conditional_7_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 38);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const project_r7 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", project_r7.status === "Completed" ? "Finished" : "Delayed", " ", project_r7.delayDays, "d late");
} }
function ProjectManagement_Conditional_25_Conditional_7_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 48);
    i0.ɵɵlistener("click", function ProjectManagement_Conditional_25_Conditional_7_Conditional_15_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r8); const project_r7 = i0.ɵɵnextContext(); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.edit(project_r7)); });
    i0.ɵɵtext(1, "Edit project");
    i0.ɵɵelementEnd();
} }
function ProjectManagement_Conditional_25_Conditional_7_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span")(1, "strong");
    i0.ɵɵtext(2, "Completed");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const project_r7 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(project_r7.completedOn);
} }
function ProjectManagement_Conditional_25_Conditional_7_For_39_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 49);
    i0.ɵɵlistener("click", function ProjectManagement_Conditional_25_Conditional_7_For_39_Conditional_5_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r9); const employee_r10 = i0.ɵɵnextContext().$implicit; const project_r7 = i0.ɵɵnextContext(); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.unassign(project_r7.id, employee_r10.id)); });
    i0.ɵɵtext(1, "\u00D7");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const employee_r10 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵattribute("aria-label", "Remove " + employee_r10.name);
} }
function ProjectManagement_Conditional_25_Conditional_7_For_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span")(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "small");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, ProjectManagement_Conditional_25_Conditional_7_For_39_Conditional_5_Template, 2, 1, "button");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const employee_r10 = ctx.$implicit;
    const project_r7 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(employee_r10.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(employee_r10.role);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.canManageTeam(project_r7) ? 5 : -1);
} }
function ProjectManagement_Conditional_25_Conditional_7_ForEmpty_40_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1, "No employees assigned.");
    i0.ɵɵelementEnd();
} }
function ProjectManagement_Conditional_25_Conditional_7_Conditional_41_For_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 17);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const employee_r12 = ctx.$implicit;
    i0.ɵɵproperty("value", employee_r12.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(employee_r12.name);
} }
function ProjectManagement_Conditional_25_Conditional_7_Conditional_41_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 46)(1, "h3");
    i0.ɵɵtext(2, "Assign Employee");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 50)(4, "select", 51);
    i0.ɵɵlistener("change", function ProjectManagement_Conditional_25_Conditional_7_Conditional_41_Template_select_change_4_listener($event) { i0.ɵɵrestoreView(_r11); const project_r7 = i0.ɵɵnextContext(); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.changeAssignment(project_r7.id, $event)); });
    i0.ɵɵelementStart(5, "option", 52);
    i0.ɵɵtext(6, "Select employee");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(7, ProjectManagement_Conditional_25_Conditional_7_Conditional_41_For_8_Template, 2, 2, "option", 17, _forTrack1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "input", 53);
    i0.ɵɵlistener("input", function ProjectManagement_Conditional_25_Conditional_7_Conditional_41_Template_input_input_9_listener($event) { i0.ɵɵrestoreView(_r11); const project_r7 = i0.ɵɵnextContext(); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.changeAssignmentRole(project_r7.id, $event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "button", 54);
    i0.ɵɵlistener("click", function ProjectManagement_Conditional_25_Conditional_7_Conditional_41_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r11); const project_r7 = i0.ɵɵnextContext(); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.assign(project_r7)); });
    i0.ɵɵtext(11, "Assign");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const project_r7 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(7);
    i0.ɵɵrepeater(ctx_r0.availableEmployees(project_r7));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", ctx_r0.busyId() === project_r7.id);
} }
function ProjectManagement_Conditional_25_Conditional_7_Conditional_42_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 55);
    i0.ɵɵlistener("click", function ProjectManagement_Conditional_25_Conditional_7_Conditional_42_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r13); const project_r7 = i0.ɵɵnextContext(); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.removeProject(project_r7)); });
    i0.ɵɵtext(1, "Delete mistaken project");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const project_r7 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r0.busyId() === project_r7.id);
} }
function ProjectManagement_Conditional_25_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 31);
    i0.ɵɵlistener("click", function ProjectManagement_Conditional_25_Conditional_7_Template_div_click_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.closeDetails()); });
    i0.ɵɵelementStart(1, "article", 32);
    i0.ɵɵlistener("click", function ProjectManagement_Conditional_25_Conditional_7_Template_article_click_1_listener($event) { return $event.stopPropagation(); });
    i0.ɵɵelementStart(2, "div", 33)(3, "div", 34)(4, "p", 4);
    i0.ɵɵtext(5, "Project details");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "h2");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 35)(9, "span", 36);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "span", 37);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, ProjectManagement_Conditional_25_Conditional_7_Conditional_13_Template, 2, 2, "span", 38);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div", 39);
    i0.ɵɵconditionalCreate(15, ProjectManagement_Conditional_25_Conditional_7_Conditional_15_Template, 2, 0, "button", 40);
    i0.ɵɵelementStart(16, "button", 41);
    i0.ɵɵlistener("click", function ProjectManagement_Conditional_25_Conditional_7_Template_button_click_16_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.closeDetails()); });
    i0.ɵɵtext(17, "\u00D7");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(18, "p", 42);
    i0.ɵɵtext(19);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "div", 43)(21, "div")(22, "h3");
    i0.ɵɵtext(23, "Timeline");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "div", 44)(25, "span")(26, "strong");
    i0.ɵɵtext(27, "Started");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(28);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "span")(30, "strong");
    i0.ɵɵtext(31, "Due");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(32);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(33, ProjectManagement_Conditional_25_Conditional_7_Conditional_33_Template, 4, 1, "span");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(34, "div")(35, "h3");
    i0.ɵɵtext(36);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(37, "div", 45);
    i0.ɵɵrepeaterCreate(38, ProjectManagement_Conditional_25_Conditional_7_For_39_Template, 6, 3, "span", null, _forTrack1, false, ProjectManagement_Conditional_25_Conditional_7_ForEmpty_40_Template, 2, 0, "small");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(41, ProjectManagement_Conditional_25_Conditional_7_Conditional_41_Template, 12, 1, "div", 46);
    i0.ɵɵconditionalCreate(42, ProjectManagement_Conditional_25_Conditional_7_Conditional_42_Template, 2, 1, "button", 47);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const project_r7 = ctx;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", project_r7.name + " project details");
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(project_r7.name);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(project_r7.status);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("high", project_r7.priority === "High")("low", project_r7.priority === "Low");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("", project_r7.priority, " priority");
    i0.ɵɵadvance();
    i0.ɵɵconditional(project_r7.isDelayed ? 13 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.activeTab() === "current" ? 15 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(project_r7.description || "No description provided.");
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate(project_r7.startDate);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(project_r7.dueDate || "No deadline");
    i0.ɵɵadvance();
    i0.ɵɵconditional(project_r7.completedOn ? 33 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("Assigned Team (", project_r7.employees.length, ")");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(project_r7.employees);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.canManageTeam(project_r7) ? 41 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.activeTab() === "current" ? 42 : -1);
} }
function ProjectManagement_Conditional_25_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 29);
    i0.ɵɵtext(1, "Loading projects...");
    i0.ɵɵelementEnd();
} }
function ProjectManagement_Conditional_25_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 29);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.activeTab() === "current" ? "No current projects." : "No completed project history yet.");
} }
function ProjectManagement_Conditional_25_Conditional_10_For_21_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 48);
    i0.ɵɵlistener("click", function ProjectManagement_Conditional_25_Conditional_10_For_21_Conditional_18_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r16); const project_r15 = i0.ɵɵnextContext().$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.edit(project_r15)); });
    i0.ɵɵtext(1, "Edit");
    i0.ɵɵelementEnd();
} }
function ProjectManagement_Conditional_25_Conditional_10_For_21_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr")(1, "td")(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "td");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "td");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "td");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "td");
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "td");
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "td")(15, "div", 58)(16, "button", 59);
    i0.ɵɵlistener("click", function ProjectManagement_Conditional_25_Conditional_10_For_21_Template_button_click_16_listener() { const project_r15 = i0.ɵɵrestoreView(_r14).$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.toggleDetails(project_r15.id)); });
    i0.ɵɵtext(17, "View details");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(18, ProjectManagement_Conditional_25_Conditional_10_For_21_Conditional_18_Template, 2, 0, "button", 40);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const project_r15 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("delayed-row", project_r15.isDelayed && project_r15.status !== "Completed");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(project_r15.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(project_r15.status);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(project_r15.priority);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(project_r15.dueDate || "No deadline");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(project_r15.employees.length);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(project_r15.isDelayed ? (project_r15.status === "Completed" ? "Finished " : "Delayed ") + project_r15.delayDays + "d late" : "On schedule");
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(ctx_r0.activeTab() === "current" ? 18 : -1);
} }
function ProjectManagement_Conditional_25_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 30)(1, "div", 56)(2, "table")(3, "thead")(4, "tr")(5, "th");
    i0.ɵɵtext(6, "Project");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "th");
    i0.ɵɵtext(8, "Status");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "th");
    i0.ɵɵtext(10, "Priority");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "th");
    i0.ɵɵtext(12, "Due");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "th");
    i0.ɵɵtext(14, "Team");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "th");
    i0.ɵɵtext(16, "Timing");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "th");
    i0.ɵɵtext(18, "Action");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(19, "tbody");
    i0.ɵɵrepeaterCreate(20, ProjectManagement_Conditional_25_Conditional_10_For_21_Template, 19, 9, "tr", 57, _forTrack1);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(20);
    i0.ɵɵrepeater(ctx_r0.visibleProjects());
} }
function ProjectManagement_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 26)(1, "div")(2, "h2");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(6, ProjectManagement_Conditional_25_Conditional_6_Template, 2, 0, "button", 27);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, ProjectManagement_Conditional_25_Conditional_7_Template, 43, 18, "div", 28);
    i0.ɵɵconditionalCreate(8, ProjectManagement_Conditional_25_Conditional_8_Template, 2, 0, "p", 29)(9, ProjectManagement_Conditional_25_Conditional_9_Template, 2, 1, "p", 29)(10, ProjectManagement_Conditional_25_Conditional_10_Template, 22, 0, "div", 30);
} if (rf & 2) {
    let tmp_4_0;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.statusFilter() === "Active" ? "Active Projects" : ctx_r0.activeTab() === "current" ? "Current Projects" : "Completed Project History");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.activeTab() === "current" ? "Planned, active, delayed, and on-hold projects." : "Finished projects and their preserved team history.");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.statusFilter() ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_4_0 = ctx_r0.selectedProject()) ? 7 : -1, tmp_4_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.isLoading() ? 8 : ctx_r0.visibleProjects().length === 0 ? 9 : 10);
} }
const projectDates = (control) => {
    const start = control.get('startDate')?.value;
    const due = control.get('dueDate')?.value;
    const completed = control.get('completedOn')?.value;
    const status = control.get('status')?.value;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (start && due && due < start)
        return { invalidDateRange: true };
    if ((status === 'Active' || status === 'OnHold') && start && start > today)
        return { futureActiveProject: true };
    if (status === 'Completed' && !completed)
        return { completedWithoutDate: true };
    if (completed && completed > today)
        return { futureCompletedProject: true };
    if (start && completed && completed < start)
        return { completionBeforeStart: true };
    if (status !== 'Completed' && completed)
        return { completionForOpenProject: true };
    return null;
};
export class ProjectManagement {
    projectFormElement;
    projectNameInput;
    fb = inject(FormBuilder);
    projectService = inject(ProjectService);
    employeeService = inject(EmployeeService);
    route = inject(ActivatedRoute);
    statuses = [
        { value: 'Planned', label: 'Planned' }, { value: 'Active', label: 'Active' },
        { value: 'Completed', label: 'Completed' }, { value: 'OnHold', label: 'On Hold' },
    ];
    priorities = ['High', 'Medium', 'Low'];
    projects = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "projects" }] : /* istanbul ignore next */ []));
    currentProjects = computed(() => this.projects().filter(project => project.status !== 'Completed'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "currentProjects" }] : /* istanbul ignore next */ []));
    completedProjects = computed(() => this.projects().filter(project => project.status === 'Completed'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "completedProjects" }] : /* istanbul ignore next */ []));
    activeTab = signal('current', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "activeTab" }] : /* istanbul ignore next */ []));
    statusFilter = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "statusFilter" }] : /* istanbul ignore next */ []));
    visibleProjects = computed(() => {
        const projects = this.activeTab() === 'history' ? this.completedProjects() : this.currentProjects();
        return this.statusFilter() ? projects.filter(project => project.status === this.statusFilter()) : projects;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "visibleProjects" }] : /* istanbul ignore next */ []));
    expandedProjectId = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "expandedProjectId" }] : /* istanbul ignore next */ []));
    selectedProject = computed(() => {
        const selectedId = this.expandedProjectId();
        return this.visibleProjects().find(project => project.id === selectedId) ?? null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedProject" }] : /* istanbul ignore next */ []));
    employees = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "employees" }] : /* istanbul ignore next */ []));
    editingId = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "editingId" }] : /* istanbul ignore next */ []));
    isLoading = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isLoading" }] : /* istanbul ignore next */ []));
    busyId = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busyId" }] : /* istanbul ignore next */ []));
    errorMessage = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorMessage" }] : /* istanbul ignore next */ []));
    successMessage = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "successMessage" }] : /* istanbul ignore next */ []));
    projectForm = this.fb.nonNullable.group({
        name: ['', [Validators.required, Validators.pattern(/.*\S.*/), Validators.minLength(2), Validators.maxLength(100)]],
        description: ['', Validators.maxLength(500)], startDate: ['', Validators.required], dueDate: [''], completedOn: [''],
        status: ['Planned', Validators.required],
        priority: ['Medium', Validators.required],
    }, { validators: projectDates });
    assignments = new Map();
    assignmentRoles = new Map();
    ngOnInit() {
        const query = this.route.snapshot.queryParamMap;
        const status = query.get('status');
        if (status === 'Planned' || status === 'Active' || status === 'OnHold')
            this.statusFilter.set(status);
        if (query.get('tab') === 'history')
            this.activeTab.set('history');
        forkJoin({ projects: this.projectService.getProjects(), employees: this.employeeService.getEmployees() })
            .pipe(finalize(() => this.isLoading.set(false))).subscribe({
            next: value => { this.projects.set(value.projects); this.employees.set(value.employees.filter(e => e.isActive)); },
            error: () => this.errorMessage.set('Project information could not be loaded.'),
        });
    }
    saveProject() {
        this.clearMessages();
        if (this.projectForm.invalid) {
            this.projectForm.markAllAsTouched();
            return;
        }
        const raw = this.projectForm.getRawValue();
        const request = {
            ...raw,
            name: raw.name.trim(),
            description: raw.description.trim(),
            dueDate: raw.dueDate || null,
            completedOn: raw.status === 'Completed' ? raw.completedOn || null : null,
        };
        const id = this.editingId();
        const operation = id === null
            ? this.projectService.createProject(request) : this.projectService.updateProject(id, request);
        operation.subscribe({ next: () => {
                this.successMessage.set(id === null ? 'Project created.' : 'Project updated.');
                this.editingId.set(null);
                this.projectForm.reset({ name: '', description: '', startDate: '', dueDate: '', completedOn: '', status: 'Planned', priority: 'Medium' });
                this.activeTab.set(raw.status === 'Completed' ? 'history' : 'current');
                this.load();
            },
            error: (error) => this.showError(error, 'Project could not be saved.') });
    }
    edit(project) {
        this.editingId.set(project.id);
        this.clearMessages();
        this.activeTab.set('form');
        this.projectForm.setValue({
            name: project.name,
            description: project.description,
            startDate: project.startDate,
            dueDate: project.dueDate ?? '',
            completedOn: project.completedOn ?? '',
            status: project.status.replace(' ', ''),
            priority: project.priority,
        });
        requestAnimationFrame(() => requestAnimationFrame(() => {
            this.projectFormElement?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.projectNameInput?.nativeElement.focus({ preventScroll: true });
        }));
    }
    openCreate() {
        this.editingId.set(null);
        this.projectForm.reset({ name: '', description: '', startDate: '', dueDate: '', completedOn: '', status: 'Planned', priority: 'Medium' });
        this.activeTab.set('form');
        requestAnimationFrame(() => requestAnimationFrame(() => {
            this.projectNameInput?.nativeElement.focus();
        }));
    }
    cancelEdit() {
        this.editingId.set(null);
        this.projectForm.reset({ name: '', description: '', startDate: '', dueDate: '', completedOn: '', status: 'Planned', priority: 'Medium' });
        this.activeTab.set('current');
    }
    removeProject(project) {
        if (!window.confirm(`Delete ${project.name}?`))
            return;
        this.busyId.set(project.id);
        this.projectService.deleteProject(project.id).pipe(finalize(() => this.busyId.set(null))).subscribe({
            next: () => { this.successMessage.set('Project deleted.'); this.load(); },
            error: error => this.showError(error, 'Project could not be deleted.'),
        });
    }
    assign(project) {
        const employeeId = this.assignments.get(project.id) ?? 0;
        if (!employeeId) {
            this.errorMessage.set('Select an employee to assign.');
            return;
        }
        const role = (this.assignmentRoles.get(project.id) ?? 'Member').trim();
        if (!role) {
            this.errorMessage.set('Enter the employee project role.');
            return;
        }
        this.busyId.set(project.id);
        this.projectService.assignEmployee(project.id, {
            employeeId,
            role,
        }).pipe(finalize(() => this.busyId.set(null))).subscribe({
            next: () => {
                this.successMessage.set('Employee assigned.');
                this.assignments.delete(project.id);
                this.assignmentRoles.delete(project.id);
                this.load();
            },
            error: error => this.showError(error, 'Employee could not be assigned.'),
        });
    }
    unassign(projectId, employeeId) {
        this.busyId.set(projectId);
        this.projectService.removeEmployee(projectId, employeeId).pipe(finalize(() => this.busyId.set(null))).subscribe({
            next: () => { this.successMessage.set('Employee removed from project.'); this.load(); },
            error: error => this.showError(error, 'Employee could not be removed.'),
        });
    }
    changeAssignment(projectId, event) {
        this.assignments.set(projectId, Number(event.target.value));
    }
    changeAssignmentRole(projectId, event) {
        this.assignmentRoles.set(projectId, event.target.value);
    }
    availableEmployees(project) {
        const assignedIds = new Set(project.employees.map(employee => employee.id));
        return this.employees().filter(employee => !assignedIds.has(employee.id));
    }
    canManageTeam(project) {
        return project.status === 'Planned' || project.status === 'Active';
    }
    showTab(tab) {
        this.expandedProjectId.set(null);
        this.statusFilter.set('');
        this.activeTab.set(tab);
    }
    clearStatusFilter() {
        this.statusFilter.set('');
    }
    toggleDetails(projectId) {
        this.expandedProjectId.update(current => current === projectId ? null : projectId);
    }
    closeDetails() {
        this.expandedProjectId.set(null);
    }
    closeDetailsWithEscape() {
        this.closeDetails();
    }
    load() {
        this.isLoading.set(true);
        this.projectService.getProjects().pipe(finalize(() => this.isLoading.set(false))).subscribe({
            next: projects => this.projects.set(projects), error: () => this.errorMessage.set('Projects could not be loaded.'),
        });
    }
    clearMessages() { this.errorMessage.set(''); this.successMessage.set(''); }
    showError(error, fallback) { this.errorMessage.set(error.error?.message ?? fallback); }
    static ɵfac = function ProjectManagement_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ProjectManagement)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ProjectManagement, selectors: [["app-project-management"]], viewQuery: function ProjectManagement_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(_c0, 5)(_c1, 5);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.projectFormElement = _t.first);
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.projectNameInput = _t.first);
        } }, hostBindings: function ProjectManagement_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("keydown.escape", function ProjectManagement_keydown_escape_HostBindingHandler() { return ctx.closeDetailsWithEscape(); }, i0.ɵɵresolveDocument);
        } }, decls: 26, vars: 12, consts: [["projectFormElement", ""], ["projectNameInput", ""], [1, "project-page"], [1, "page-heading"], [1, "eyebrow"], ["type", "button", 1, "primary", 3, "click"], ["aria-label", "Project sections", 1, "project-tabs"], ["type", "button", 3, "click"], ["role", "alert", 1, "feedback", "error"], ["role", "status", 1, "feedback", "success"], [1, "project-form", 3, "formGroup"], [1, "project-form", 3, "ngSubmit", "formGroup"], [1, "section-heading"], ["type", "button", 1, "secondary", 3, "click"], [1, "form-grid"], ["type", "text", "formControlName", "name", "maxlength", "100"], ["formControlName", "status"], [3, "value"], ["formControlName", "priority"], ["appDatePicker", "", "type", "date", "formControlName", "startDate"], ["appDatePicker", "", "type", "date", "formControlName", "dueDate"], [1, "description"], ["rows", "3", "maxlength", "500", "formControlName", "description"], [1, "form-actions"], ["type", "submit", 1, "primary"], ["appDatePicker", "", "type", "date", "formControlName", "completedOn"], [1, "list-toolbar"], ["type", "button", 1, "secondary"], ["role", "presentation", 1, "modal-backdrop"], [1, "empty-state"], [1, "table-card"], ["role", "presentation", 1, "modal-backdrop", 3, "click"], ["role", "dialog", "aria-modal", "true", 1, "project-detail-panel", 3, "click"], [1, "detail-header"], [1, "project-title"], [1, "badges"], [1, "status"], [1, "priority"], [1, "delay"], [1, "detail-actions"], ["type", "button", 1, "edit-link"], ["type", "button", "aria-label", "Close project details", 1, "modal-close", 3, "click"], [1, "project-description"], [1, "detail-layout"], [1, "project-dates"], [1, "team"], [1, "assignment-panel"], ["type", "button", 1, "delete-link", 3, "disabled"], ["type", "button", 1, "edit-link", 3, "click"], [3, "click"], [1, "assign"], [3, "change"], ["value", "0"], ["type", "text", "maxlength", "50", "placeholder", "Role, e.g. Developer", 3, "input"], [1, "primary", 3, "click", "disabled"], ["type", "button", 1, "delete-link", 3, "click", "disabled"], [1, "table-scroll"], [3, "delayed-row"], [1, "row-actions"], ["type", "button", 1, "view-link", 3, "click"]], template: function ProjectManagement_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 2)(1, "div", 3)(2, "div")(3, "p", 4);
            i0.ɵɵtext(4, "Team delivery");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "h1");
            i0.ɵɵtext(6, "Projects");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "p");
            i0.ɵɵtext(8, "Track current work, completed project history, and employee assignments.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "button", 5);
            i0.ɵɵlistener("click", function ProjectManagement_Template_button_click_9_listener() { return ctx.openCreate(); });
            i0.ɵɵtext(10, "Add Project");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(11, "nav", 6)(12, "button", 7);
            i0.ɵɵlistener("click", function ProjectManagement_Template_button_click_12_listener() { return ctx.showTab("current"); });
            i0.ɵɵtext(13, " Current Projects ");
            i0.ɵɵelementStart(14, "span");
            i0.ɵɵtext(15);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(16, "button", 7);
            i0.ɵɵlistener("click", function ProjectManagement_Template_button_click_16_listener() { return ctx.showTab("history"); });
            i0.ɵɵtext(17, " Projects History ");
            i0.ɵɵelementStart(18, "span");
            i0.ɵɵtext(19);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(20, "button", 7);
            i0.ɵɵlistener("click", function ProjectManagement_Template_button_click_20_listener() { return ctx.editingId() === null ? ctx.openCreate() : ctx.showTab("form"); });
            i0.ɵɵtext(21);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(22, ProjectManagement_Conditional_22_Template, 2, 1, "div", 8);
            i0.ɵɵconditionalCreate(23, ProjectManagement_Conditional_23_Template, 2, 1, "div", 9);
            i0.ɵɵconditionalCreate(24, ProjectManagement_Conditional_24_Template, 49, 7, "form", 10)(25, ProjectManagement_Conditional_25_Template, 11, 5);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(12);
            i0.ɵɵclassProp("active", ctx.activeTab() === "current");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.currentProjects().length);
            i0.ɵɵadvance();
            i0.ɵɵclassProp("active", ctx.activeTab() === "history");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.completedProjects().length);
            i0.ɵɵadvance();
            i0.ɵɵclassProp("active", ctx.activeTab() === "form");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.editingId() === null ? "Create Project" : "Edit Project", " ");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.errorMessage() ? 22 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.successMessage() ? 23 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.activeTab() === "form" ? 24 : 25);
        } }, dependencies: [ReactiveFormsModule, i1.ɵNgNoValidate, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.SelectControlValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.MaxLengthValidator, i1.FormGroupDirective, i1.FormControlName, DatePickerDirective], styles: [".project-page[_ngcontent-%COMP%] { display: grid; gap: 1.25rem; }\n.page-heading[_ngcontent-%COMP%], .section-heading[_ngcontent-%COMP%], .list-toolbar[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }\n.page-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], .list-toolbar[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0.35rem 0 0; color: #64748b; }\n.eyebrow[_ngcontent-%COMP%] { margin: 0 !important; color: #2563eb !important; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }\nh1[_ngcontent-%COMP%], h2[_ngcontent-%COMP%], h3[_ngcontent-%COMP%], h4[_ngcontent-%COMP%] { margin: 0; color: #0f172a; }\nbutton[_ngcontent-%COMP%] { border-radius: 8px; padding: 0.6rem 0.8rem; font: inherit; font-weight: 600; cursor: pointer; }\n.primary[_ngcontent-%COMP%] { border: 0; background: #2563eb; color: #fff; }\n.secondary[_ngcontent-%COMP%] { border: 1px solid #cbd5e1; background: #fff; color: #334155; }\n.project-tabs[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid #dbe3ef; border-radius: 12px; background: #edf2f7; padding: 0.45rem; gap: 0.4rem; }\n.project-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { border: 0; background: transparent; color: #64748b; text-align: left; }\n.project-tabs[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] { background: #fff; color: #1d4ed8; box-shadow: 0 3px 10px rgb(15 23 42 / 9%); }\n.project-tabs[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { display: inline-grid; min-width: 1.5rem; height: 1.5rem; margin-left: 0.35rem; border-radius: 999px; background: #dbeafe; place-items: center; }\n.project-form[_ngcontent-%COMP%], .list-toolbar[_ngcontent-%COMP%], .table-card[_ngcontent-%COMP%] { border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; padding: 1.25rem; box-shadow: 0 6px 18px rgb(15 23 42 / 5%); }\n.form-grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin-top: 1rem; }\n.description[_ngcontent-%COMP%] { grid-column: span 3; }\nlabel[_ngcontent-%COMP%] { display: block; margin-bottom: 0.35rem; color: #334155; font-weight: 700; }\ninput[_ngcontent-%COMP%], select[_ngcontent-%COMP%], textarea[_ngcontent-%COMP%] { box-sizing: border-box; width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0.7rem; font: inherit; }\ntextarea[_ngcontent-%COMP%] { resize: vertical; }\n.form-grid[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { color: #b91c1c; }\n.form-actions[_ngcontent-%COMP%] { display: flex; justify-content: flex-end; gap: 0.7rem; margin-top: 1rem; }\n.feedback[_ngcontent-%COMP%] { border-radius: 8px; padding: 0.75rem; }\n.error[_ngcontent-%COMP%] { background: #fef2f2; color: #b91c1c; }\n.success[_ngcontent-%COMP%] { background: #dcfce7; color: #166534; }\n.project-title[_ngcontent-%COMP%] { min-width: 0; }\n.badges[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.45rem; }\n.status[_ngcontent-%COMP%], .priority[_ngcontent-%COMP%], .delay[_ngcontent-%COMP%] { border-radius: 999px; padding: 0.2rem 0.45rem; font-size: 0.72rem; font-weight: 700; }\n.status[_ngcontent-%COMP%] { background: #dbeafe; color: #1e40af; }\n.priority[_ngcontent-%COMP%] { background: #fef3c7; color: #92400e; }\n.priority.high[_ngcontent-%COMP%] { background: #fee2e2; color: #b91c1c; }\n.priority.low[_ngcontent-%COMP%] { background: #f1f5f9; color: #475569; }\n.delay[_ngcontent-%COMP%] { background: #dc2626; color: #fff; }\n.edit-link[_ngcontent-%COMP%], .view-link[_ngcontent-%COMP%], .delete-link[_ngcontent-%COMP%] { border: 0; background: transparent; padding: 0; color: #2563eb; white-space: nowrap; }\n.delete-link[_ngcontent-%COMP%] { margin-top: 0.7rem; color: #dc2626; }\n.modal-backdrop[_ngcontent-%COMP%] { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; overflow-y: auto; padding: 2rem; background: rgb(15 23 42 / 42%); backdrop-filter: blur(7px); -webkit-backdrop-filter: blur(7px); }\n.project-detail-panel[_ngcontent-%COMP%] { box-sizing: border-box; width: min(920px, 100%); max-height: calc(100vh - 4rem); overflow-y: auto; border: 1px solid #dbeafe; border-radius: 16px; background: #fff; padding: 1.5rem; box-shadow: 0 24px 70px rgb(15 23 42 / 28%); }\n.detail-header[_ngcontent-%COMP%] { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }\n.detail-actions[_ngcontent-%COMP%], .row-actions[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 0.75rem; }\n.modal-close[_ngcontent-%COMP%] { display: grid; width: 2.25rem; height: 2.25rem; border: 1px solid #cbd5e1; border-radius: 999px; background: #fff; padding: 0; color: #475569; font-size: 1.35rem; line-height: 1; place-items: center; }\n.modal-close[_ngcontent-%COMP%]:hover { background: #f1f5f9; color: #0f172a; }\n.project-description[_ngcontent-%COMP%] { margin: 1rem 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 0.8rem 0; color: #475569; overflow-wrap: anywhere; }\n.detail-layout[_ngcontent-%COMP%] { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: 1.5rem; }\n.detail-layout[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%], .assignment-panel[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin-bottom: 0.6rem; font-size: 0.95rem; }\n.project-dates[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; }\n.project-dates[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { display: grid; border-radius: 6px; background: #f8fafc; padding: 0.4rem; color: #475569; font-size: 0.78rem; }\n.project-dates[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { color: #0f172a; font-size: 0.65rem; text-transform: uppercase; }\n.team[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.5rem 0; }\n.team[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { position: relative; display: grid; max-width: 100%; border-radius: 7px; background: #f1f5f9; padding: 0.35rem 1.7rem 0.35rem 0.5rem; font-size: 0.8rem; }\n.team[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]    > small[_ngcontent-%COMP%] { color: #64748b; }\n.team[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { position: absolute; top: 0.15rem; right: 0.25rem; border: 0; background: none; padding: 0; color: #dc2626; }\n.assign[_ngcontent-%COMP%] { display: grid; grid-template-columns: 1fr 1fr auto; gap: 0.4rem; margin-top: 0.6rem; }\n.assign[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], .assign[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] { padding: 0.5rem; font-size: 0.85rem; }\n.assignment-panel[_ngcontent-%COMP%] { margin-top: 1rem; border-top: 1px solid #e2e8f0; padding-top: 0.9rem; }\n.empty-state[_ngcontent-%COMP%] { border: 1px dashed #cbd5e1; border-radius: 10px; padding: 2rem; color: #64748b; text-align: center; }\n.table-card[_ngcontent-%COMP%] { padding: 0; overflow: hidden; }\n.table-scroll[_ngcontent-%COMP%] { overflow-x: auto; }\ntable[_ngcontent-%COMP%] { width: 100%; border-collapse: collapse; text-align: left; }\nth[_ngcontent-%COMP%], td[_ngcontent-%COMP%] { border-bottom: 1px solid #e2e8f0; padding: 0.8rem; white-space: nowrap; }\nth[_ngcontent-%COMP%] { background: #f8fafc; color: #64748b; font-size: 0.72rem; text-transform: uppercase; }\n.delayed-row[_ngcontent-%COMP%] { background: #fff7f7; }\n@media (max-width: 800px) {\n  .form-grid[_ngcontent-%COMP%] { grid-template-columns: 1fr 1fr; }\n  .description[_ngcontent-%COMP%] { grid-column: span 2; }\n  .project-tabs[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\n  .detail-layout[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\n}\n@media (max-width: 600px) {\n  .page-heading[_ngcontent-%COMP%], .section-heading[_ngcontent-%COMP%], .list-toolbar[_ngcontent-%COMP%] { align-items: stretch; flex-direction: column; }\n  .form-grid[_ngcontent-%COMP%], .assign[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\n  .description[_ngcontent-%COMP%] { grid-column: auto; }\n  .project-dates[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\n  .detail-header[_ngcontent-%COMP%] { flex-direction: column; }\n  .modal-backdrop[_ngcontent-%COMP%] { align-items: start; padding: 1rem; }\n  .project-detail-panel[_ngcontent-%COMP%] { max-height: calc(100vh - 2rem); padding: 1rem; }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ProjectManagement, [{
        type: Component,
        args: [{ selector: 'app-project-management', imports: [ReactiveFormsModule, DatePickerDirective], template: "<section class=\"project-page\">\n  <div class=\"page-heading\">\n    <div>\n      <p class=\"eyebrow\">Team delivery</p>\n      <h1>Projects</h1>\n      <p>Track current work, completed project history, and employee assignments.</p>\n    </div>\n    <button class=\"primary\" type=\"button\" (click)=\"openCreate()\">Add Project</button>\n  </div>\n\n  <nav class=\"project-tabs\" aria-label=\"Project sections\">\n    <button type=\"button\" [class.active]=\"activeTab() === 'current'\" (click)=\"showTab('current')\">\n      Current Projects <span>{{ currentProjects().length }}</span>\n    </button>\n    <button type=\"button\" [class.active]=\"activeTab() === 'history'\" (click)=\"showTab('history')\">\n      Projects History <span>{{ completedProjects().length }}</span>\n    </button>\n    <button type=\"button\" [class.active]=\"activeTab() === 'form'\" (click)=\"editingId() === null ? openCreate() : showTab('form')\">\n      {{ editingId() === null ? 'Create Project' : 'Edit Project' }}\n    </button>\n  </nav>\n\n  @if (errorMessage()) { <div class=\"feedback error\" role=\"alert\">{{ errorMessage() }}</div> }\n  @if (successMessage()) { <div class=\"feedback success\" role=\"status\">{{ successMessage() }}</div> }\n\n  @if (activeTab() === 'form') {\n    <form #projectFormElement class=\"project-form\" [formGroup]=\"projectForm\" (ngSubmit)=\"saveProject()\">\n      <div class=\"section-heading\">\n        <div><p class=\"eyebrow\">Project details</p><h2>{{ editingId() === null ? 'Create Project' : 'Edit Project' }}</h2></div>\n        <button type=\"button\" class=\"secondary\" (click)=\"cancelEdit()\">Back to Projects</button>\n      </div>\n      <div class=\"form-grid\">\n        <div><label>Name</label><input #projectNameInput type=\"text\" formControlName=\"name\" maxlength=\"100\" />\n          @if (projectForm.controls.name.touched && projectForm.controls.name.invalid) { <small>Enter at least 2 characters.</small> }</div>\n        <div><label>Status</label><select formControlName=\"status\">@for (status of statuses; track status.value) { <option [value]=\"status.value\">{{ status.label }}</option> }</select></div>\n        <div><label>Priority</label><select formControlName=\"priority\">@for (priority of priorities; track priority) { <option [value]=\"priority\">{{ priority }}</option> }</select></div>\n        <div><label>Start Date</label><input appDatePicker type=\"date\" formControlName=\"startDate\" /></div>\n        <div><label>Due Date (planned deadline)</label><input appDatePicker type=\"date\" formControlName=\"dueDate\" />\n          @if (projectForm.hasError('invalidDateRange')) { <small>Due date cannot be before start date.</small> }\n          @if (projectForm.hasError('futureActiveProject')) { <small>An active or on-hold project cannot start in the future.</small> }\n        </div>\n        @if (projectForm.controls.status.value === 'Completed') {\n          <div><label>Completed On (actual date)</label><input appDatePicker type=\"date\" formControlName=\"completedOn\" />\n            @if (projectForm.hasError('completedWithoutDate')) { <small>Enter the actual completion date.</small> }\n            @if (projectForm.hasError('futureCompletedProject')) { <small>The actual completion date cannot be in the future.</small> }\n            @if (projectForm.hasError('completionBeforeStart')) { <small>Completion cannot be before the start date.</small> }\n          </div>\n        }\n        <div class=\"description\"><label>Description</label><textarea rows=\"3\" maxlength=\"500\" formControlName=\"description\"></textarea></div>\n      </div>\n      <div class=\"form-actions\">\n        <button type=\"button\" class=\"secondary\" (click)=\"cancelEdit()\">Cancel</button>\n        <button class=\"primary\" type=\"submit\">{{ editingId() === null ? 'Create Project' : 'Save Changes' }}</button>\n      </div>\n    </form>\n  } @else {\n    <div class=\"list-toolbar\">\n      <div>\n        <h2>{{ statusFilter() === 'Active' ? 'Active Projects' : activeTab() === 'current' ? 'Current Projects' : 'Completed Project History' }}</h2>\n        <p>{{ activeTab() === 'current' ? 'Planned, active, delayed, and on-hold projects.' : 'Finished projects and their preserved team history.' }}</p>\n      </div>\n      @if (statusFilter()) { <button class=\"secondary\" type=\"button\" (click)=\"clearStatusFilter()\">Show All Current Projects</button> }\n    </div>\n\n    @if (selectedProject(); as project) {\n      <div class=\"modal-backdrop\" role=\"presentation\" (click)=\"closeDetails()\">\n      <article class=\"project-detail-panel\" role=\"dialog\" aria-modal=\"true\" [attr.aria-label]=\"project.name + ' project details'\" (click)=\"$event.stopPropagation()\">\n        <div class=\"detail-header\">\n          <div class=\"project-title\">\n            <p class=\"eyebrow\">Project details</p>\n            <h2>{{ project.name }}</h2>\n            <div class=\"badges\"><span class=\"status\">{{ project.status }}</span><span class=\"priority\" [class.high]=\"project.priority === 'High'\" [class.low]=\"project.priority === 'Low'\">{{ project.priority }} priority</span>@if (project.isDelayed) { <span class=\"delay\">{{ project.status === 'Completed' ? 'Finished' : 'Delayed' }} {{ project.delayDays }}d late</span> }</div>\n          </div>\n          <div class=\"detail-actions\">\n            @if (activeTab() === 'current') { <button class=\"edit-link\" type=\"button\" (click)=\"edit(project)\">Edit project</button> }\n            <button class=\"modal-close\" type=\"button\" aria-label=\"Close project details\" (click)=\"closeDetails()\">\u00D7</button>\n          </div>\n        </div>\n\n        <p class=\"project-description\">{{ project.description || 'No description provided.' }}</p>\n\n        <div class=\"detail-layout\">\n          <div>\n            <h3>Timeline</h3>\n            <div class=\"project-dates\">\n              <span><strong>Started</strong>{{ project.startDate }}</span>\n              <span><strong>Due</strong>{{ project.dueDate || 'No deadline' }}</span>\n              @if (project.completedOn) { <span><strong>Completed</strong>{{ project.completedOn }}</span> }\n            </div>\n          </div>\n          <div>\n            <h3>Assigned Team ({{ project.employees.length }})</h3>\n            <div class=\"team\">\n              @for (employee of project.employees; track employee.id) {\n                <span><strong>{{ employee.name }}</strong><small>{{ employee.role }}</small>@if (canManageTeam(project)) { <button [attr.aria-label]=\"'Remove ' + employee.name\" (click)=\"unassign(project.id, employee.id)\">\u00D7</button> }</span>\n              } @empty { <small>No employees assigned.</small> }\n            </div>\n          </div>\n        </div>\n\n        @if (canManageTeam(project)) {\n          <div class=\"assignment-panel\">\n            <h3>Assign Employee</h3>\n            <div class=\"assign\">\n              <select (change)=\"changeAssignment(project.id, $event)\"><option value=\"0\">Select employee</option>@for (employee of availableEmployees(project); track employee.id) { <option [value]=\"employee.id\">{{ employee.name }}</option> }</select>\n              <input type=\"text\" maxlength=\"50\" placeholder=\"Role, e.g. Developer\" (input)=\"changeAssignmentRole(project.id, $event)\" />\n              <button class=\"primary\" [disabled]=\"busyId() === project.id\" (click)=\"assign(project)\">Assign</button>\n            </div>\n          </div>\n        }\n        @if (activeTab() === 'current') { <button class=\"delete-link\" type=\"button\" [disabled]=\"busyId() === project.id\" (click)=\"removeProject(project)\">Delete mistaken project</button> }\n      </article>\n      </div>\n    }\n\n    @if (isLoading()) {\n      <p class=\"empty-state\">Loading projects...</p>\n    } @else if (visibleProjects().length === 0) {\n      <p class=\"empty-state\">{{ activeTab() === 'current' ? 'No current projects.' : 'No completed project history yet.' }}</p>\n    } @else {\n      <div class=\"table-card\"><div class=\"table-scroll\"><table>\n        <thead><tr><th>Project</th><th>Status</th><th>Priority</th><th>Due</th><th>Team</th><th>Timing</th><th>Action</th></tr></thead>\n        <tbody>@for (project of visibleProjects(); track project.id) {\n          <tr [class.delayed-row]=\"project.isDelayed && project.status !== 'Completed'\">\n            <td><strong>{{ project.name }}</strong></td><td>{{ project.status }}</td><td>{{ project.priority }}</td><td>{{ project.dueDate || 'No deadline' }}</td><td>{{ project.employees.length }}</td>\n            <td>{{ project.isDelayed ? (project.status === 'Completed' ? 'Finished ' : 'Delayed ') + project.delayDays + 'd late' : 'On schedule' }}</td>\n            <td><div class=\"row-actions\">\n              <button class=\"view-link\" type=\"button\" (click)=\"toggleDetails(project.id)\">View details</button>\n              @if (activeTab() === 'current') { <button class=\"edit-link\" type=\"button\" (click)=\"edit(project)\">Edit</button> }\n            </div></td>\n          </tr>\n        }</tbody>\n      </table></div></div>\n    }\n  }\n</section>\n", styles: [".project-page { display: grid; gap: 1.25rem; }\n.page-heading, .section-heading, .list-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }\n.page-heading p, .list-toolbar p { margin: 0.35rem 0 0; color: #64748b; }\n.eyebrow { margin: 0 !important; color: #2563eb !important; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }\nh1, h2, h3, h4 { margin: 0; color: #0f172a; }\nbutton { border-radius: 8px; padding: 0.6rem 0.8rem; font: inherit; font-weight: 600; cursor: pointer; }\n.primary { border: 0; background: #2563eb; color: #fff; }\n.secondary { border: 1px solid #cbd5e1; background: #fff; color: #334155; }\n.project-tabs { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid #dbe3ef; border-radius: 12px; background: #edf2f7; padding: 0.45rem; gap: 0.4rem; }\n.project-tabs button { border: 0; background: transparent; color: #64748b; text-align: left; }\n.project-tabs button.active { background: #fff; color: #1d4ed8; box-shadow: 0 3px 10px rgb(15 23 42 / 9%); }\n.project-tabs span { display: inline-grid; min-width: 1.5rem; height: 1.5rem; margin-left: 0.35rem; border-radius: 999px; background: #dbeafe; place-items: center; }\n.project-form, .list-toolbar, .table-card { border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; padding: 1.25rem; box-shadow: 0 6px 18px rgb(15 23 42 / 5%); }\n.form-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin-top: 1rem; }\n.description { grid-column: span 3; }\nlabel { display: block; margin-bottom: 0.35rem; color: #334155; font-weight: 700; }\ninput, select, textarea { box-sizing: border-box; width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0.7rem; font: inherit; }\ntextarea { resize: vertical; }\n.form-grid small { color: #b91c1c; }\n.form-actions { display: flex; justify-content: flex-end; gap: 0.7rem; margin-top: 1rem; }\n.feedback { border-radius: 8px; padding: 0.75rem; }\n.error { background: #fef2f2; color: #b91c1c; }\n.success { background: #dcfce7; color: #166534; }\n.project-title { min-width: 0; }\n.badges { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.45rem; }\n.status, .priority, .delay { border-radius: 999px; padding: 0.2rem 0.45rem; font-size: 0.72rem; font-weight: 700; }\n.status { background: #dbeafe; color: #1e40af; }\n.priority { background: #fef3c7; color: #92400e; }\n.priority.high { background: #fee2e2; color: #b91c1c; }\n.priority.low { background: #f1f5f9; color: #475569; }\n.delay { background: #dc2626; color: #fff; }\n.edit-link, .view-link, .delete-link { border: 0; background: transparent; padding: 0; color: #2563eb; white-space: nowrap; }\n.delete-link { margin-top: 0.7rem; color: #dc2626; }\n.modal-backdrop { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; overflow-y: auto; padding: 2rem; background: rgb(15 23 42 / 42%); backdrop-filter: blur(7px); -webkit-backdrop-filter: blur(7px); }\n.project-detail-panel { box-sizing: border-box; width: min(920px, 100%); max-height: calc(100vh - 4rem); overflow-y: auto; border: 1px solid #dbeafe; border-radius: 16px; background: #fff; padding: 1.5rem; box-shadow: 0 24px 70px rgb(15 23 42 / 28%); }\n.detail-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }\n.detail-actions, .row-actions { display: flex; align-items: center; gap: 0.75rem; }\n.modal-close { display: grid; width: 2.25rem; height: 2.25rem; border: 1px solid #cbd5e1; border-radius: 999px; background: #fff; padding: 0; color: #475569; font-size: 1.35rem; line-height: 1; place-items: center; }\n.modal-close:hover { background: #f1f5f9; color: #0f172a; }\n.project-description { margin: 1rem 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 0.8rem 0; color: #475569; overflow-wrap: anywhere; }\n.detail-layout { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: 1.5rem; }\n.detail-layout h3, .assignment-panel h3 { margin-bottom: 0.6rem; font-size: 0.95rem; }\n.project-dates { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; }\n.project-dates span { display: grid; border-radius: 6px; background: #f8fafc; padding: 0.4rem; color: #475569; font-size: 0.78rem; }\n.project-dates strong { color: #0f172a; font-size: 0.65rem; text-transform: uppercase; }\n.team { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.5rem 0; }\n.team span { position: relative; display: grid; max-width: 100%; border-radius: 7px; background: #f1f5f9; padding: 0.35rem 1.7rem 0.35rem 0.5rem; font-size: 0.8rem; }\n.team span > small { color: #64748b; }\n.team button { position: absolute; top: 0.15rem; right: 0.25rem; border: 0; background: none; padding: 0; color: #dc2626; }\n.assign { display: grid; grid-template-columns: 1fr 1fr auto; gap: 0.4rem; margin-top: 0.6rem; }\n.assign input, .assign select { padding: 0.5rem; font-size: 0.85rem; }\n.assignment-panel { margin-top: 1rem; border-top: 1px solid #e2e8f0; padding-top: 0.9rem; }\n.empty-state { border: 1px dashed #cbd5e1; border-radius: 10px; padding: 2rem; color: #64748b; text-align: center; }\n.table-card { padding: 0; overflow: hidden; }\n.table-scroll { overflow-x: auto; }\ntable { width: 100%; border-collapse: collapse; text-align: left; }\nth, td { border-bottom: 1px solid #e2e8f0; padding: 0.8rem; white-space: nowrap; }\nth { background: #f8fafc; color: #64748b; font-size: 0.72rem; text-transform: uppercase; }\n.delayed-row { background: #fff7f7; }\n@media (max-width: 800px) {\n  .form-grid { grid-template-columns: 1fr 1fr; }\n  .description { grid-column: span 2; }\n  .project-tabs { grid-template-columns: 1fr; }\n  .detail-layout { grid-template-columns: 1fr; }\n}\n@media (max-width: 600px) {\n  .page-heading, .section-heading, .list-toolbar { align-items: stretch; flex-direction: column; }\n  .form-grid, .assign { grid-template-columns: 1fr; }\n  .description { grid-column: auto; }\n  .project-dates { grid-template-columns: 1fr; }\n  .detail-header { flex-direction: column; }\n  .modal-backdrop { align-items: start; padding: 1rem; }\n  .project-detail-panel { max-height: calc(100vh - 2rem); padding: 1rem; }\n}\n"] }]
    }], null, { projectFormElement: [{
            type: ViewChild,
            args: ['projectFormElement']
        }], projectNameInput: [{
            type: ViewChild,
            args: ['projectNameInput']
        }], closeDetailsWithEscape: [{
            type: HostListener,
            args: ['document:keydown.escape']
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ProjectManagement, { className: "ProjectManagement", filePath: "src/app/components/project-management/project-management.ts", lineNumber: 33 }); })();
