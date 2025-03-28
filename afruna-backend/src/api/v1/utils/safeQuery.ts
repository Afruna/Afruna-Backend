import { Request } from 'express';

// eslint-disable-next-line no-unused-vars
export default function safeQuery<T extends string>(q: Request): { [k in T]: any } {
  return q.query as any;
}
