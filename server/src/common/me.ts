import { Request } from 'express';

export function getMeId(req: Request): number {
  const raw = req.header('x-user-id');
  const me = raw ? Number(raw) : 1; // default user id = 1 for this test
  return Number.isFinite(me) && me > 0 ? me : 1;
}
