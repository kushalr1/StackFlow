using Microsoft.AspNetCore.Mvc;
using stackflow_api.Controllers;
using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class DepartmentsControllerTests
{
    [Fact]
    public async Task Create_WithUniqueName_Returns201Created()
    {
        var service = new FakeDepartmentService();
        var controller = new DepartmentsController(service);

        var result = await controller.Create(new SaveDepartmentDto
        {
            Name = "Engineering",
            Description = "Builds products"
        });

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var department = Assert.IsType<DepartmentDto>(created.Value);
        Assert.Equal("Engineering", department.Name);
    }

    [Fact]
    public async Task Update_WithExistingDepartment_Returns204NoContent()
    {
        var service = new FakeDepartmentService();
        var department = await service.CreateAsync(new SaveDepartmentDto
        {
            Name = "Engineering"
        });
        var controller = new DepartmentsController(service);

        var result = await controller.Update(department!.Id, new SaveDepartmentDto
        {
            Name = "Product Engineering"
        });

        Assert.IsType<NoContentResult>(result);
        Assert.Equal("Product Engineering", (await service.GetByIdAsync(department.Id))?.Name);
    }

    [Fact]
    public async Task Delete_WithUnusedDepartment_Returns204NoContent()
    {
        var service = new FakeDepartmentService();
        var department = await service.CreateAsync(new SaveDepartmentDto { Name = "Finance" });
        var controller = new DepartmentsController(service);

        var result = await controller.Delete(department!.Id);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_WithAssignedEmployees_Returns409Conflict()
    {
        var service = new FakeDepartmentService { SimulateAssignedEmployees = true };
        var department = await service.CreateAsync(new SaveDepartmentDto { Name = "Engineering" });
        var controller = new DepartmentsController(service);

        var result = await controller.Delete(department!.Id);

        Assert.IsType<ConflictObjectResult>(result);
    }

    [Fact]
    public async Task Create_WithDuplicateName_Returns409Conflict()
    {
        var service = new FakeDepartmentService();
        await service.CreateAsync(new SaveDepartmentDto { Name = "Engineering" });
        var controller = new DepartmentsController(service);

        var result = await controller.Create(new SaveDepartmentDto { Name = "Engineering" });

        Assert.IsType<ConflictObjectResult>(result.Result);
    }

    private sealed class FakeDepartmentService : IDepartmentService
    {
        private readonly List<DepartmentDto> departments = [];
        private int nextId = 1;

        public bool SimulateAssignedEmployees { get; init; }

        public Task<IReadOnlyList<DepartmentDto>> GetAllAsync() =>
            Task.FromResult<IReadOnlyList<DepartmentDto>>(departments);

        public Task<DepartmentDto?> GetByIdAsync(int id) =>
            Task.FromResult(departments.FirstOrDefault(department => department.Id == id));

        public Task<DepartmentDto?> CreateAsync(SaveDepartmentDto departmentDto)
        {
            if (departments.Any(department =>
                department.Name.Equals(departmentDto.Name, StringComparison.OrdinalIgnoreCase)))
            {
                return Task.FromResult<DepartmentDto?>(null);
            }

            var department = new DepartmentDto
            {
                Id = nextId++,
                Name = departmentDto.Name,
                Description = departmentDto.Description
            };
            departments.Add(department);
            return Task.FromResult<DepartmentDto?>(department);
        }

        public Task<DepartmentUpdateResult> UpdateAsync(
            int id,
            SaveDepartmentDto departmentDto)
        {
            var department = departments.FirstOrDefault(department => department.Id == id);
            if (department is null)
            {
                return Task.FromResult(DepartmentUpdateResult.NotFound);
            }

            department.Name = departmentDto.Name;
            department.Description = departmentDto.Description;
            return Task.FromResult(DepartmentUpdateResult.Updated);
        }

        public Task<DepartmentDeleteResult> DeleteAsync(int id)
        {
            var department = departments.FirstOrDefault(department => department.Id == id);
            if (department is null)
            {
                return Task.FromResult(DepartmentDeleteResult.NotFound);
            }

            if (SimulateAssignedEmployees)
            {
                return Task.FromResult(DepartmentDeleteResult.HasEmployees);
            }

            departments.Remove(department);
            return Task.FromResult(DepartmentDeleteResult.Deleted);
        }
    }
}
