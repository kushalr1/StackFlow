using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.Controllers;
using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class LeaveRequestTests
{
    [Fact]
    public void Validation_EndBeforeStart_IsInvalid()
    {
        var dto = ValidRequest();
        dto.EndDate = new DateOnly(2026, 9, 16);
        var results = new List<ValidationResult>();

        var isValid = Validator.TryValidateObject(dto, new ValidationContext(dto), results, true);

        Assert.False(isValid);
        Assert.Contains(results, result => result.ErrorMessage == "End date cannot be before start date.");
    }

    [Fact]
    public async Task Create_ValidRequest_Returns201CreatedAndPendingStatus()
    {
        var controller = new LeavesController(new FakeLeaveRequestService());

        var result = await controller.Create(ValidRequest());

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var request = Assert.IsType<LeaveRequestDto>(created.Value);
        Assert.Equal("Pending", request.Status);
    }

    [Fact]
    public async Task UpdateStatus_Approve_Returns204NoContent()
    {
        var service = new FakeLeaveRequestService();
        var created = await service.CreateAsync(ValidRequest());
        var controller = new LeavesController(service);

        var result = await controller.UpdateStatus(
            created.LeaveRequest!.Id,
            new UpdateLeaveStatusDto { Status = LeaveStatus.Approved });

        Assert.IsType<NoContentResult>(result);
        Assert.Equal("Approved", (await service.GetByIdAsync(created.LeaveRequest.Id))!.Status);
    }

    [Fact]
    public async Task UpdateStatus_Pending_Returns400BadRequest()
    {
        var controller = new LeavesController(new FakeLeaveRequestService());

        var result = await controller.UpdateStatus(
            1,
            new UpdateLeaveStatusDto { Status = LeaveStatus.Pending });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    private static SaveLeaveRequestDto ValidRequest() => new()
    {
        EmployeeId = 1,
        LeaveType = LeaveType.CasualLeave,
        StartDate = new DateOnly(2026, 9, 17),
        EndDate = new DateOnly(2026, 9, 18),
        Reason = "Family event"
    };

    private sealed class FakeLeaveRequestService : ILeaveRequestService
    {
        private readonly List<LeaveRequestDto> requests = [];

        public Task<IReadOnlyList<LeaveRequestDto>> GetAllAsync(
            int? employeeId,
            LeaveStatus? status,
            LeaveType? leaveType) => Task.FromResult<IReadOnlyList<LeaveRequestDto>>(requests);

        public Task<LeaveRequestDto?> GetByIdAsync(int id) =>
            Task.FromResult(requests.FirstOrDefault(request => request.Id == id));

        public Task<LeaveSaveResult> CreateAsync(SaveLeaveRequestDto dto)
        {
            var request = new LeaveRequestDto
            {
                Id = requests.Count + 1,
                EmployeeId = dto.EmployeeId,
                EmployeeName = "Test Employee",
                LeaveType = "Casual Leave",
                StartDate = dto.StartDate!.Value,
                EndDate = dto.EndDate!.Value,
                Reason = dto.Reason,
                Status = "Pending",
                AppliedOn = DateTime.UtcNow
            };
            requests.Add(request);
            return Task.FromResult(new LeaveSaveResult(LeaveSaveOutcome.Saved, request));
        }

        public Task<LeaveSaveOutcome> UpdateAsync(int id, SaveLeaveRequestDto dto) =>
            Task.FromResult(LeaveSaveOutcome.NotFound);

        public Task<LeaveSaveOutcome> UpdateStatusAsync(int id, LeaveStatus status)
        {
            var request = requests.FirstOrDefault(item => item.Id == id);
            if (request is null) return Task.FromResult(LeaveSaveOutcome.NotFound);
            request.Status = status.ToString();
            return Task.FromResult(LeaveSaveOutcome.Saved);
        }
    }
}
