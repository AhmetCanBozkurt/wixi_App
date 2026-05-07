using FluentValidation;

namespace Wixi.Modules.Core.Application.Currencies.Commands.CreateCurrency;

public class CreateCurrencyCommandValidator : AbstractValidator<CreateCurrencyCommand>
{
    public CreateCurrencyCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty()
            .MaximumLength(10)
            .Matches("^[A-Z]{2,10}$").WithMessage("Code must contain only uppercase letters (2-10 characters).");

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Unit)
            .GreaterThan(0);
    }
}
