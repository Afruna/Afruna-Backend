import { Request, Response, NextFunction } from 'express';
import { ROLES, MESSAGES } from '@config';
import { ResourceType } from '@interfaces/Role.Interface';
import HttpError from '@helpers/HttpError';

const accessControl = (resources: ResourceType[], action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let allow = false;
    const forbiddenResources = [];

    if (user && ROLES[user.role] && resources.length > 0) {
      resources.map((resource) => {
        if (ROLES[user.role][resource].includes(action)) {
          allow = true;
        } else {
          forbiddenResources.push(resource);
        }
      });
    }

    if (!allow)
      throw new HttpError(MESSAGES.FORBIDDEN, 403, {
        details: `**${action}** action forbidden on **${resources}** resource for your role`,
      });

    return next();
  };
};

export default accessControl;
