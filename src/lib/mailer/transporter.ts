import nodemailer from 'nodemailer';
import { config } from '@api/config';

export const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.mailer.host,
    port: parseInt(config.mailer.port, 10),
    // secure: config.nodeEnv === 'production', // true for 465, false for other ports
    secure: false,
    auth: {
      user: config.mailer.username,
      pass: config.mailer.password
    }
  });
};
