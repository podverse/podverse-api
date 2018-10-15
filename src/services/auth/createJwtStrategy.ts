import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt'
import { config } from 'config'
const { jwtSecret } = config

export const createJwtStrategy = () => {
  const opts: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret
  }

  return new JwtStrategy(opts, ({ id, roles }, done) => {
    done(null, { id, roles })
  })
}
