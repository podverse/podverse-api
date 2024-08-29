import { Channel } from "@orm/entities/channel/channel";

interface Service<T> {
  update(channel: Channel, dto: Partial<T>): Promise<T>;
  _delete(channel: Channel): Promise<void>;
}

export const handleParsedOneData = async <T>(
  channel: Channel,
  service: Service<T>,
  dto: Partial<T> | null
) => {
  if (dto) {
    await service.update(channel, dto);
  } else {
    await service._delete(channel);
  }
};

