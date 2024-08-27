import { Channel } from "@orm/entities/channel/channel";

export async function channelCreateOrUpdateMany<T, D>(
  channel: Channel,
  dtos: D[],
  getAllByChannel: (channel: Channel) => Promise<T[]>,
  createOrUpdate: (channel: Channel, dto: D) => Promise<T>,
  repository: { save: (entities: T[]) => Promise<void>; remove: (entities: T[]) => Promise<void> },
  getIdentifier: (dto: D) => string,
  getEntityIdentifier: (entity: T) => string
): Promise<T[]> {
  const existingEntities = await getAllByChannel(channel);
  const updatedEntities: T[] = [];
  const dtoIdentifiers = dtos.map(getIdentifier);

  for (const dto of dtos) {
    const entity = await createOrUpdate(channel, dto);
    updatedEntities.push(entity);
  }

  await repository.save(updatedEntities);

  const entitiesToDelete = existingEntities.filter(entity => !dtoIdentifiers.includes(getEntityIdentifier(entity)));
  if (entitiesToDelete.length > 0) {
    await repository.remove(entitiesToDelete);
  }

  return updatedEntities;
}
