import { Request } from "express";

export function getPaginationParams(req: Request) {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export type PaginatedData<T> = {
  results: T[];
  count: number | null;
};
