import * as passwordValidator from 'password-validator'

const schema = new passwordValidator()

const validatePassword = schema
  .is().min(8)
  .has().uppercase()
  .has().lowercase()
  .has().digits()
  .has().not().spaces()

export default validatePassword
