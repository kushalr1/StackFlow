using System.ComponentModel.DataAnnotations;
using stackflow_api.Models;

namespace stackflow_api.DTOs;

public class UpdateLeaveStatusDto
{
    [EnumDataType(typeof(LeaveStatus), ErrorMessage = "Leave status is invalid.")]
    public LeaveStatus Status { get; set; }
}
