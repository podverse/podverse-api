import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt'

export const createJwtStrategy = () => {
  const opts: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  }

  return new JwtStrategy(opts, ({ id, roles }, done) => {
    done(null, { id, roles })
  })
}
