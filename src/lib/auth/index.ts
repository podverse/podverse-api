import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { ERROR_MESSAGES } from 'podverse-helpers';
import { AccountService } from 'podverse-orm';
import { config } from '@api/config';
import { verifyPassword } from './password';

const accountService = new AccountService();

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      if (!password) {
        return done(null, false, { message: 'Password missing.' });
      }

      const account = await accountService.getByEmail(email, { relations: ['account_credentials'] });
      if (!account) {
        return done(null, false, { message: 'Incorrect email.' });
      }

      const accountCredentials = account.account_credentials;
      if (!accountCredentials) {
        return done(null, false, { message: 'Credentials missing.' });
      }

      const isMatch = await verifyPassword(password, accountCredentials.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      const isVerified = account.verified;
      if (!isVerified) {
        return done(null, false, { message: ERROR_MESSAGES.ACCOUNT.NOT_VERIFIED });
      }
      
      return done(null, account);
    } catch (error) {
      return done(error);
    }
  }
));

passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.auth.jwtSecret
  },
  async (jwtPayload, done) => {
    try {
      const account = await accountService.get(jwtPayload.id);
      if (account) {
        return done(null, account);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const account = await accountService.get(id);
    done(null, account);
  } catch (error) {
    done(error);
  }
});

export const initializePassport = () => passport.initialize();

export const authenticate = (req: Request, res: Response, next: NextFunction) => {    
  passport.authenticate('local', { session: false }, (err: Error, user: globalThis.Express.User, info: { message: string }) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      if (info.message === ERROR_MESSAGES.ACCOUNT.NOT_VERIFIED) {
        return res.status(403).json({ message: info.message });
      } else {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    }

    const token = jwt.sign({ id: user.id }, config.auth.jwtSecret, { expiresIn: '365d' });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      ...(config.api.cookie.domain !== 'localhost' ? { domain: config.api.cookie.domain } : {}),
      maxAge: 31536000000 // 1 year in milliseconds
    });

    const response: { message: string; token?: string } = { message: 'Authenticated successfully' };
    if (req.body.includeTokenInResponseBody) {
      response['token'] = token;
    }

    return res.json(response);
  })(req, res, next);
};

// export type RequestWithUser = Request & { user: { id: number } };

const verifyTokenAndMembership = async (
  req: Request,
  res: Response,
  next: NextFunction,
  token: string,
  options?: { skipMembershipStatus?: boolean }
) => {
  jwt.verify(token, config.auth.jwtSecret, async (err: jwt.VerifyErrors | null, decoded: any) => {
    if (err || !decoded) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = decoded;

    if (!req?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!options?.skipMembershipStatus) {
      const account = await accountService.get(req.user.id, { relations: ['account_membership_status'] });
      if (!account) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const membershipStatus = account.account_membership_status;
      if (
        !membershipStatus ||
        !membershipStatus.membership_expires_at ||
        new Date(membershipStatus.membership_expires_at) < new Date()
      ) {
        return res.status(403).json({ message: 'Membership expired' });
      }
    }

    next();
  });
};

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction, options?: { skipMembershipStatus?: boolean }) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  verifyTokenAndMembership(req, res, next, token, options);
};

export const optionalEnsureAuthenticated = (req: Request, res: Response, next: NextFunction, options?: { skipMembershipStatus?: boolean }) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next();
  }

  verifyTokenAndMembership(req, res, next, token, options);
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });
  return res.json({ message: 'Logged out successfully' });
};
