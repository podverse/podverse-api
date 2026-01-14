import { Request, Response, NextFunction, CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { AuthCookieName, ERROR_MESSAGES, AccountMembershipEnum } from 'podverse-helpers';
import { AccountService } from 'podverse-orm';
import { config } from '@api/config';
import { verifyPassword } from './password';

const isProduction = config.nodeEnv === 'production';

const setAuthCookie = (res: Response, token: string) => {
  if (isProduction) {
    const prodCookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      domain: config.api.cookie.domain,
      path: '/',
      maxAge: 365 * 24 * 60 * 60 * 1000,
    };
    res.cookie(AuthCookieName, token, prodCookieOptions);
  } else {
    res.cookie(AuthCookieName, token, {
      httpOnly: true,
      secure: false, // dev only
      sameSite: 'strict',
      path: '/',
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
  }
};

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
    
    setAuthCookie(res, token);
    
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
  options: { skipMembershipStatus: boolean; noFreeTrial?: boolean }
) => {
  interface DecodedToken { id: number; [key: string]: unknown }
  jwt.verify(token, config.auth.jwtSecret, async (err: jwt.VerifyErrors | null, decoded: unknown) => {
    if (err) {
      console.error('[verifyTokenAndMembership] JWT verification error:', err);
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!decoded) {
      console.error('[verifyTokenAndMembership] No decoded JWT payload');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const payload = decoded as DecodedToken;
    req.user = { id: payload.id } as unknown as globalThis.Express.User;

    if (!req?.user?.id) {
      console.error('[verifyTokenAndMembership] Decoded JWT missing user id');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!options.skipMembershipStatus) {
      const relations = options.noFreeTrial 
        ? ['account_membership_status', 'account_membership_status.account_membership']
        : ['account_membership_status'];
      const account = await accountService.get(req.user.id, { relations });
      if (!account) {
        console.error('[verifyTokenAndMembership] No account found for user id:', req.user.id);
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const membershipStatus = account.account_membership_status;

      if (
        !membershipStatus ||
        !membershipStatus.membership_expires_at ||
        new Date(membershipStatus.membership_expires_at) < new Date()
      ) {
        console.warn('[verifyTokenAndMembership] Membership expired or missing for user id:', req.user.id);
        return res.status(403).json({ message: 'Membership expired' });
      }

      if (options.noFreeTrial) {
        const accountMembership = membershipStatus.account_membership;
        if (accountMembership && accountMembership.id === AccountMembershipEnum.Trial) {
          return res.status(403).json({ message: 'This feature is only available to premium accounts and is not available to free trials' });
        }
      }
    }

    next();
  });
};

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction, options: { skipMembershipStatus: boolean; noFreeTrial?: boolean }) => {
  const token = req.cookies[AuthCookieName] || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  verifyTokenAndMembership(req, res, next, token, options);
};

export const optionalEnsureAuthenticated = (req: Request, res: Response, next: NextFunction, options: { skipMembershipStatus: boolean; noFreeTrial?: boolean }) => {
  const token = req.cookies[AuthCookieName] || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next();
  }

  verifyTokenAndMembership(req, res, next, token, options);
};

export const logout = (req: Request, res: Response) => {
  // Clear possible host-only cookie (older deployments or dev)
  res.clearCookie(AuthCookieName, {
    path: '/',
  });

  // If in production and you set a domain cookie, clear that too
  if (isProduction) {
    res.clearCookie(AuthCookieName, {
      path: '/',
      domain: config.api.cookie.domain, // e.g. '.podverse.fm'
    });
  }

  return res.json({ message: 'Logged out successfully' });
};
