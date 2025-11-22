import { Request } from "express";
import { PAGINATION } from "podverse-helpers";

export function getPaginationParams(req: Request) {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = PAGINATION.DEFAULT_LIMIT;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export type PaginatedData<T> = {
  results: T[];
  count: number | null;
};
