import { ValidationChain, validationResult, matchedData, ValidationError } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import HttpError from '@helpers/HttpError';

// eslint-disable-next-line import/prefer-default-export
export const validator = (dtos: ValidationChain[], allowExtraFields = true) => [
  ...dtos,
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = errors.array();
      throw new HttpError('user input validation error', 400, error);
    }

    if (!allowExtraFields) {
      // Fields validation
      // eslint-disable-next-line no-use-before-define
      const extraFields = checkIfExtraFields(req);
      if (extraFields) {
        // eslint-disable-next-line nonblock-statement-body-position
        throw new HttpError('user input validation error', 400, {
          details: 'request contains unspecified input',
        });
      }
    }
    next();
  },
];

function checkIfExtraFields(req: Request) {
  const allowedFields = Object.keys(matchedData(req)).sort();

  // Check for all common request inputs
  const requestInput = { ...req.query, ...req.params, ...req.body };
  const requestFields = Object.keys(requestInput).sort();

  if (JSON.stringify(allowedFields) === JSON.stringify(requestFields)) {
    return false;
  }
  return true;
}
