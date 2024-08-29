import { Channel } from "@orm/entities/channel/channel";

interface Service<T> {
  updateMany(channel: Channel, dtos: Partial<T>[]): Promise<T[]>;
  _deleteAll(channel: Channel): Promise<void>;
}

// TODO: get rid of any
export const handleParsedManyData = async<T> (
  channel: Channel,
  service: Service<T>,
  dtos: Partial<T>[]
) => {
  if (dtos.length > 0) {
    await service.updateMany(channel, dtos);
  } else {
    await service._deleteAll(channel);
  }
};
