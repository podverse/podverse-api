export function hasDifferentValues<T>(entity: T, dto: Partial<T>): boolean {
  return Object.keys(dto).some(key => {
    const entityValue = entity[key as keyof T];
    const dtoValue = dto[key as keyof T];

    const normalizedEntityValue = isNumeric(entityValue) ? Number(entityValue) : entityValue;
    const normalizedDtoValue = isNumeric(dtoValue) ? Number(dtoValue) : dtoValue;

    if (isObjectWithId(normalizedEntityValue) && isNumeric(normalizedDtoValue)) {
      return normalizedEntityValue.id !== normalizedDtoValue;
    }

    if (isObjectWithId(dtoValue) && isNumeric(normalizedEntityValue)) {
      return dtoValue.id !== normalizedEntityValue;
    }

    if (isObjectWithId(normalizedEntityValue) && isObjectWithId(normalizedDtoValue)) {
      return normalizedEntityValue.id !== normalizedDtoValue.id;
    }

    return normalizedEntityValue !== normalizedDtoValue;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isNumeric(value: any): boolean {
  return !isNaN(value) && value !== null && value !== '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isObjectWithId(value: any): value is { id: number } {
  return value && typeof value === 'object' && 'id' in value;
}
