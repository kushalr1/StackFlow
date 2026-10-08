using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace stackflow_api.Validation;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public sealed class EmployeeNameAttribute : ValidationAttribute
{
    private static readonly Regex ValidName = new(
        @"^[A-Za-z]+(?: [A-Za-z]+)*$",
        RegexOptions.Compiled | RegexOptions.CultureInvariant);

    public EmployeeNameAttribute()
        : base("Name can contain only letters and spaces.")
    {
    }

    public override bool IsValid(object? value)
    {
        if (value is not string name)
        {
            return true;
        }

        return ValidName.IsMatch(name.Trim());
    }
}
