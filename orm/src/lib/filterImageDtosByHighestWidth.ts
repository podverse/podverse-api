interface FilterImageDto {
  url: string;
  image_width_size: number | null;
}

export function filterDtosByHighestWidth<T extends FilterImageDto>(dtos: Partial<T>[]): T[] {
  const dtoMap = new Map<string, T>();

  for (const dto of dtos) {
    if (!dto.url) continue;
    const existingDto = dtoMap.get(dto.url);
    if (
      !existingDto ||
      (dto.image_width_size !== undefined && dto.image_width_size !== null &&
      (existingDto.image_width_size === null || dto.image_width_size > existingDto.image_width_size))
    ) {
      dtoMap.set(dto.url, dto as T);
    }
  }

  return Array.from(dtoMap.values());
}