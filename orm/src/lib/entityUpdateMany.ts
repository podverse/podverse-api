import { ObjectLiteral, Repository } from "typeorm";

// P = parent entity, D = DTO, E = entity
export async function entityUpdateMany<P extends ObjectLiteral, D extends ObjectLiteral, E extends ObjectLiteral>(
  entity: P,
  dtos: D[],
  getAll: (parentEntity: P) => Promise<E[]>,
  update: (parentEntity: P, dto: D) => Promise<E>,
  repository: Repository<E>,
  identifier: string
): Promise<E[]> {
  const existingEntities = await getAll(entity);
  const updatedEntities: E[] = [];
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
