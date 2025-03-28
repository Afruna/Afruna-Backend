import { NextFunction, Request, Response } from 'express';
import { DOCS_URL, MESSAGES } from '@config';
import HttpError from '@helpers/HttpError';

const docs = (req: Request, res: Response, next: NextFunction) => {
  if (!DOCS_URL) next(new HttpError(MESSAGES.DOC_NOT_FOUND, 404));
  res.redirect(DOCS_URL);
};

export default docs;
