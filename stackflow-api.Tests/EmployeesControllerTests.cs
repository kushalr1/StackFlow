using Microsoft.AspNetCore.Mvc;
using stackflow_api.Controllers;
using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class EmployeesControllerTests
{
    [Fact]
    public async Task Create_WithValidEmployee_Returns201Created()
    {
        // Arrange
        var service = new FakeEmployeeService();
        var controller = new EmployeesController(service);
        var request = CreateRequest("Aarav Mehta", "Engineering");

        // Act
        var result = await controller.Create(request);

        // Assert
        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var employee = Assert.IsType<EmployeeDto>(created.Value);
        Assert.Equal(201, created.StatusCode);
        Assert.Equal("Aarav Mehta", employee.Name);
        Assert.True(employee.Id > 0);
    }

    [Fact]
    public async Task GetById_WithExistingEmployee_Returns200Ok()
    {
        // Arrange
        var service = new FakeEmployeeService();
        var existing = await service.CreateAsync(CreateRequest("Aarav Mehta", "Engineering"));
        var controller = new EmployeesController(service);

        // Act
        var result = await controller.GetById(existing.Id);

        // Assert
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var employee = Assert.IsType<EmployeeDto>(ok.Value);
        Assert.Equal(existing.Id, employee.Id);
    }

    [Fact]
    public async Task GetById_WithMissingEmployee_Returns404NotFound()
    {
        // Arrange
        var controller = new EmployeesController(new FakeEmployeeService());

        // Act
        var result = await controller.GetById(999);

        // Assert
        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task Update_WithExistingEmployee_Returns204NoContent()
    {
        // Arrange
        var service = new FakeEmployeeService();
        var existing = await service.CreateAsync(CreateRequest("Aarav Mehta", "Engineering"));
        var controller = new EmployeesController(service);
        var update = UpdateRequest("Aarav Mehta", "Product");

        // Act
        var result = await controller.Update(existing.Id, update);

        // Assert
        Assert.IsType<NoContentResult>(result);
        var updated = await service.GetByIdAsync(existing.Id);
        Assert.Equal("Product", updated?.Department);
    }

    [Fact]
    public async Task Delete_WithExistingEmployee_Returns204NoContent()
    {
        // Arrange
        var service = new FakeEmployeeService();
        var existing = await service.CreateAsync(CreateRequest("Aarav Mehta", "Engineering"));
        var controller = new EmployeesController(service);

        // Act
        var result = await controller.Delete(existing.Id);

        // Assert
        Assert.IsType<NoContentResult>(result);
        Assert.Null(await service.GetByIdAsync(existing.Id));
    }

    [Fact]
    public async Task Delete_WithMissingEmployee_Returns404NotFound()
    {
        // Arrange
        var controller = new EmployeesController(new FakeEmployeeService());

        // Act
        var result = await controller.Delete(999);

        // Assert
        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task GetAll_WithSearch_ReturnsMatchingEmployees()
    {
        // Arrange
        var service = new FakeEmployeeService();
        await service.CreateAsync(CreateRequest("Aarav Mehta", "Engineering"));
        await service.CreateAsync(CreateRequest("Maya Patel", "Human Resources"));
        var controller = new EmployeesController(service);

        // Act
        var result = await controller.GetAll("aarav", null);

        // Assert
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var employees = Assert.IsAssignableFrom<IReadOnlyList<EmployeeDto>>(ok.Value);
        var employee = Assert.Single(employees);
        Assert.Equal("Aarav Mehta", employee.Name);
    }

    [Fact]
    public async Task GetAll_WithDepartment_ReturnsMatchingEmployees()
    {
        // Arrange
        var service = new FakeEmployeeService();
        await service.CreateAsync(CreateRequest("Aarav Mehta", "Engineering"));
        await service.CreateAsync(CreateRequest("Maya Patel", "Human Resources"));
        var controller = new EmployeesController(service);

        // Act
        var result = await controller.GetAll(null, "engineering");

        // Assert
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var employees = Assert.IsAssignableFrom<IReadOnlyList<EmployeeDto>>(ok.Value);
        var employee = Assert.Single(employees);
        Assert.Equal("Engineering", employee.Department);
    }

    private static CreateEmployeeDto CreateRequest(string name, string department)
    {
        return new CreateEmployeeDto
        {
            Name = name,
            Email = $"{name.Replace(" ", ".").ToLowerInvariant()}@example.com",
            Phone = "9876543210",
            Department = department,
            JobTitle = "Developer",
            Salary = 75000,
            DateOfJoining = new DateOnly(2026, 1, 15),
            IsActive = true
        };
    }

    private static UpdateEmployeeDto UpdateRequest(string name, string department)
    {
        return new UpdateEmployeeDto
        {
            Name = name,
            Email = "aarav.mehta@example.com",
            Phone = "9876543210",
            Department = department,
            JobTitle = "Senior Developer",
            Salary = 90000,
            DateOfJoining = new DateOnly(2026, 1, 15),
            IsActive = true
        };
    }

    private sealed class FakeEmployeeService : IEmployeeService
    {
        private readonly List<EmployeeDto> employees = [];
        private int nextId = 1;

        public Task<IReadOnlyList<EmployeeDto>> GetAllAsync(
            string? search,
            string? department)
        {
            IEnumerable<EmployeeDto> result = employees;

            if (!string.IsNullOrWhiteSpace(search))
            {
                result = result.Where(employee =>
                    employee.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    employee.Email.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    employee.JobTitle.Contains(search, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(department))
            {
                result = result.Where(employee =>
                    employee.Department.Equals(department, StringComparison.OrdinalIgnoreCase));
            }

            return Task.FromResult<IReadOnlyList<EmployeeDto>>(result.ToList());
        }

        public Task<EmployeeDto?> GetByIdAsync(int id)
        {
            return Task.FromResult(employees.FirstOrDefault(employee => employee.Id == id));
        }

        public Task<EmployeeDto> CreateAsync(CreateEmployeeDto employeeDto)
        {
            var employee = new EmployeeDto
            {
                Id = nextId++,
                Name = employeeDto.Name,
                Email = employeeDto.Email,
                Phone = employeeDto.Phone,
                Department = employeeDto.Department,
                JobTitle = employeeDto.JobTitle,
                Salary = employeeDto.Salary,
                DateOfJoining = employeeDto.DateOfJoining!.Value,
                IsActive = employeeDto.IsActive
            };

            employees.Add(employee);
            return Task.FromResult(employee);
        }

        public Task<bool> UpdateAsync(int id, UpdateEmployeeDto employeeDto)
        {
            var employee = employees.FirstOrDefault(employee => employee.Id == id);

            if (employee is null)
            {
                return Task.FromResult(false);
            }

            employee.Name = employeeDto.Name;
            employee.Email = employeeDto.Email;
            employee.Phone = employeeDto.Phone;
            employee.Department = employeeDto.Department;
            employee.JobTitle = employeeDto.JobTitle;
            employee.Salary = employeeDto.Salary;
            employee.DateOfJoining = employeeDto.DateOfJoining!.Value;
            employee.IsActive = employeeDto.IsActive;

            return Task.FromResult(true);
        }

        public Task<bool> DeleteAsync(int id)
        {
            var employee = employees.FirstOrDefault(employee => employee.Id == id);

            if (employee is null)
            {
                return Task.FromResult(false);
            }

            employees.Remove(employee);
            return Task.FromResult(true);
        }
    }
}
