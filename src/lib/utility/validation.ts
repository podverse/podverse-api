const passwordValidator = require('password-validator')

const schema = new passwordValidator()

const validatePasswordSchema = schema
  .is().min(8)
  .has().uppercase()
  .has().lowercase()
  .has().digits()

export const validatePassword = password => {
  return validatePasswordSchema.validate(password)
}

export const validateEmail = email => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

export const validateSearchQueryString = (str, minLength = 3) => {
  if (str.length < minLength) {
    throw new Error(`Search text must be greater than ${minLength} characters long.`)
  }
}