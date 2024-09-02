interface Service<T, P> {
  update(parentEntity: P, dto: Partial<T>): Promise<T>;
  _delete(parentEntity: P): Promise<void>;
}

export const handleParsedOneData = async <T, P>(
  parentEntity: P,
  service: Service<T, P>,
  dto: Partial<T> | null
) => {
  if (dto) {
    await service.update(parentEntity, dto);
  } else {
    await service._delete(parentEntity);
  }
};

