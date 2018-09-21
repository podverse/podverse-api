import * as bcrypt from 'bcryptjs'
const passport = require('koa-passport')
import { getRepository } from 'typeorm'
import { User } from 'entities'
const LocalStrategy = require('passport-local').Strategy

const options = {
  usernameField: 'email',
  passwordField: 'password'
}

const comparePass = (userPassword, databasePassword) => {
  return bcrypt.compareSync(userPassword, databasePassword)
}

passport.serializeUser((user, done) => {
  console.log('serializeUser', user)
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  console.log('deserializeUser', id)
  return getRepository(User)
    .findOne({ id })
    .then(user => done(null, user))
    .catch(err => { done(err, null) })
})

passport.use(new LocalStrategy(options, (email, password, done) => {
  return getRepository(User)
    .findOne({ email })
    .then(user => {
      if (!user) {
        return done(null, false)
      }

      if (!comparePass(password, user.password)) {
        return done(null, false)
      } else {
        return done(null, user)
      }
    })
}))
