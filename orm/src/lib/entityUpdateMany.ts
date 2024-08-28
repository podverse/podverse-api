import { ObjectLiteral, Repository } from "typeorm";

export async function entityUpdateMany<E extends ObjectLiteral, D extends ObjectLiteral, F extends ObjectLiteral>(
  entity: E,
  dtos: D[],
  getAll: (entity: E) => Promise<F[]>,
  update: (entity: E, dto: D) => Promise<F>,
  repository: Repository<F>,
  identifier: string
): Promise<F[]> {
  const existingEntities = await getAll(entity);
  const updatedEntities: F[] = [];
  const dtoIdentifiers = dtos.map((dto: D) => dto[identifier]);

  for (const dto of dtos) {
    const updatedEntity = await update(entity, dto);
    updatedEntities.push(updatedEntity);
  }

  await repository.save(updatedEntities);

  const entitiesToDelete = existingEntities.filter(existingEntity => !dtoIdentifiers.includes(existingEntity[identifier]));
  if (entitiesToDelete.length > 0) {
    await repository.remove(entitiesToDelete);
  }

  return updatedEntities;
}
