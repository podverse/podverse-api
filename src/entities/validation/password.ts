import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { validatePassword } from '~/lib/utility'

@ValidatorConstraint({ name: '', async: false })
export class ValidatePassword implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return validatePassword(text)
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid password. Password must be at least 8 character, with at least 1 uppercase letter, 1 lowercase letter, and 1 number.'
  }
}
