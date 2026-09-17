using Microsoft.AspNetCore.Mvc;
using stackflow_api.Controllers;
using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class AttendanceControllerTests
{
    [Fact]
    public async Task Create_WithValidRecord_Returns201Created()
    {
        var controller = new AttendanceController(new FakeAttendanceService());

        var result = await controller.Create(new SaveAttendanceDto
        {
            EmployeeId = 1,
            Date = new DateOnly(2026, 9, 17),
            Status = AttendanceStatus.Present
        });

        Assert.IsType<CreatedAtActionResult>(result.Result);
    }

    [Fact]
    public async Task Create_DuplicateEmployeeAndDate_Returns409Conflict()
    {
        var service = new FakeAttendanceService();
        var request = new SaveAttendanceDto
        {
            EmployeeId = 1,
            Date = new DateOnly(2026, 9, 17),
            Status = AttendanceStatus.Present
        };
        await service.CreateAsync(request);
        var controller = new AttendanceController(service);

        var result = await controller.Create(request);

        Assert.IsType<ConflictObjectResult>(result.Result);
    }

    [Fact]
    public async Task Update_MissingRecord_Returns404NotFound()
    {
        var controller = new AttendanceController(new FakeAttendanceService());

        var result = await controller.Update(99, new SaveAttendanceDto
        {
            EmployeeId = 1,
            Date = new DateOnly(2026, 9, 17),
            Status = AttendanceStatus.Late
        });

        Assert.IsType<NotFoundObjectResult>(result);
    }

    private sealed class FakeAttendanceService : IAttendanceService
    {
        private readonly List<AttendanceDto> records = [];

        public Task<IReadOnlyList<AttendanceDto>> GetAllAsync(
            DateOnly? date,
            int? employeeId,
            string? status) => Task.FromResult<IReadOnlyList<AttendanceDto>>(records);

        public Task<AttendanceDto?> GetByIdAsync(int id) =>
            Task.FromResult(records.FirstOrDefault(record => record.Id == id));

        public Task<AttendanceSaveResult> CreateAsync(SaveAttendanceDto dto)
        {
            if (records.Any(record => record.EmployeeId == dto.EmployeeId && record.Date == dto.Date))
            {
                return Task.FromResult(new AttendanceSaveResult(AttendanceSaveOutcome.Duplicate));
            }

            var record = new AttendanceDto
            {
                Id = records.Count + 1,
                EmployeeId = dto.EmployeeId,
                EmployeeName = "Test Employee",
                Date = dto.Date!.Value,
                Status = dto.Status.ToString()
            };
            records.Add(record);
            return Task.FromResult(new AttendanceSaveResult(AttendanceSaveOutcome.Saved, record));
        }

        public Task<AttendanceSaveResult> UpdateAsync(int id, SaveAttendanceDto dto) =>
            Task.FromResult(new AttendanceSaveResult(AttendanceSaveOutcome.NotFound));
    }
}
