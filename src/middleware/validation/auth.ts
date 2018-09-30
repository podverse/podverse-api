const Joi = require('joi')
import { validateBaseBody, validateBaseQuery } from './base'

const validateAuthRegister = async (ctx, next) => {
  const schema = Joi.object().keys({
    email: Joi.string().required(),
    name: Joi.string(),
    password: Joi.string().required()
  })

  await validateBaseBody(schema, ctx, next)
}

const validateAuthLogin = async (ctx, next) => {
  const schema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required()
  })

  await validateBaseBody(schema, ctx, next)
}

const validateAuthSendVerification = async (ctx, next) => {
  const schema = Joi.object().keys({
    email: Joi.string().required()
  })

  await validateBaseBody(schema, ctx, next)
}

const validateAuthSendResetPassword = async (ctx, next) => {
  const schema = Joi.object().keys({
    email: Joi.string().required()
  })

  await validateBaseBody(schema, ctx, next)
}

const validateAuthResetPassword = async (ctx, next) => {
  const schema = Joi.object().keys({
    password: Joi.string().required(),
    resetPasswordToken: Joi.string().required()
  })

  await validateBaseBody(schema, ctx, next)
}

const validateAuthVerifyEmail = async (ctx, next) => {
  const schema = Joi.object().keys({
    token: Joi.string().required()
  })

  await validateBaseQuery(schema, ctx, next)
}

export {
  validateAuthRegister,
  validateAuthLogin,
  validateAuthSendVerification,
  validateAuthSendResetPassword,
  validateAuthResetPassword,
  validateAuthVerifyEmail
}