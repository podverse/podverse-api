/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';
import { config } from '@api/config';
import { loggerService } from '@api/factories/loggerService';

export function handleGenericErrorResponse(res: Response, error: any) {
  // TODO: how to handle logging of unknown server errors?
  if (config.nodeEnv !== 'production') {
    loggerService.logError('Internal server error', error as Error);
  }
  // res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  res.status(500).json({ message: error.message });
}
