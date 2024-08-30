interface Service<T, P> {
  updateMany(parentEntity: P, dtos: Partial<T>[]): Promise<T[]>;
  _deleteAll(parentEntity: P): Promise<void>;
}

export const handleParsedManyData = async<T, P> (
  parentEntity: P,
  service: Service<T, P>,
  dtos: Partial<T>[]
) => {
  if (dtos.length > 0) {
    await service.updateMany(parentEntity, dtos);
  } else {
    await service._deleteAll(parentEntity);
  }
};
