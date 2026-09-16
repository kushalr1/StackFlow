# StackFlow Manual Test Cases

## Purpose

This document is a checklist for manually testing StackFlow from a user's point of view. Update **Actual Result** and **Status** after performing each test.

Status values:

- `Not Run` — the test has not been performed yet.
- `Pass` — the actual result matches the expected result.
- `Fail` — the actual result does not match the expected result.

## Test Setup

Before testing:

1. Confirm PostgreSQL is running.
2. Start the backend at `http://localhost:5090`.
3. Start the Angular frontend at `http://localhost:4200`.
4. Open `http://localhost:4200` in a browser.
5. Use clearly identifiable test data so it can be edited or removed safely.

## Test Cases

| Test Case ID | Feature | Scenario | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC-001 | Add Employee | Create an employee with valid information | 1. Open **Add Employee**.<br>2. Enter valid values in every required field.<br>3. Click **Save Employee**. | A success message appears, the browser returns to the employee list, and the new employee appears in the table. | — | Not Run |
| TC-002 | Edit Employee | Update an existing employee | 1. Open **Employees**.<br>2. Click **Edit** for a test employee.<br>3. Change the department or job title.<br>4. Click **Update Employee**. | A success message appears and the employee list displays the updated information. | — | Not Run |
| TC-003 | Delete Employee | Delete an existing employee after confirmation | 1. Open **Employees**.<br>2. Click **Delete** for a test employee.<br>3. Confirm the browser prompt. | The button displays **Deleting...**, the employee is removed, and the refreshed table no longer contains that employee. | — | Not Run |
| TC-004 | View Employee | View complete employee details | 1. Open **Employees**.<br>2. Click **View** for an employee. | The details page displays the correct name, email, phone, department, job title, salary, joining date, status, and ID. | — | Not Run |
| TC-005 | Validation | Submit required fields without values | 1. Open **Add Employee**.<br>2. Clear all form fields.<br>3. Click **Save Employee**. | The form is not submitted and clear required-field messages appear. | — | Not Run |
| TC-006 | Validation | Enter an invalid email address | 1. Open **Add Employee**.<br>2. Enter `invalid-email` in Email.<br>3. Complete the other fields correctly.<br>4. Click **Save Employee**. | The form is not submitted and **Enter a valid email address** appears. | — | Not Run |
| TC-007 | Validation | Enter an invalid salary | 1. Open **Add Employee**.<br>2. Enter `0` or a negative number in Salary.<br>3. Complete the other fields correctly.<br>4. Click **Save Employee**. | The form is not submitted and **Salary must be greater than 0** appears. | — | Not Run |
| TC-008 | Search | Search by employee name, email, or job title | 1. Open **Employees**.<br>2. Enter part of a known employee's name, email, or job title.<br>3. Click **Search**. | Only matching employees appear. A search with no match displays **No matching employees**. | — | Not Run |
| TC-009 | Department Filter | Filter employees by department | 1. Open **Employees**.<br>2. Select a department.<br>3. Click **Search**. | Every displayed employee belongs to the selected department. Clicking **Clear** restores the complete list. | — | Not Run |
| TC-010 | Error Handling | Open the frontend while the backend is unavailable | 1. Stop the .NET backend with `Ctrl+C`.<br>2. Keep Angular running.<br>3. Refresh **Employees** or **Dashboard**. | A friendly message explains that the API is unavailable. The browser does not display internal exception details or credentials. | — | Not Run |
| TC-011 | Error Handling | Request an employee that does not exist | 1. Ensure the backend is running.<br>2. Open `http://localhost:4200/employees/999999`.<br>3. Use an ID that does not exist if `999999` is present. | The page displays an employee-not-found message and provides a link back to Employees. | — | Not Run |
| TC-012 | Empty State | Display the list when the database has no employees | 1. Use a safe test database with an empty `Employees` table.<br>2. Open **Employees**. | The page displays **No employees yet** and an **Add First Employee** link instead of an empty table. | — | Not Run |

## Recording a Failure

When a test fails, record:

1. What you expected.
2. What actually happened.
3. The page and employee ID involved.
4. Any browser console or backend terminal error.
5. Whether the problem happens every time.

Do not place database passwords, connection strings, or other secrets in this document.
