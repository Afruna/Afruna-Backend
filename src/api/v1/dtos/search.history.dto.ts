import { body, check, param } from 'express-validator';

export const searchHistoryRequestDTO = {
  id: [param('searchHistoryId').exists()],
  create: [
    check('name').exists()
  ],
  update: [check('name').optional()]
};
