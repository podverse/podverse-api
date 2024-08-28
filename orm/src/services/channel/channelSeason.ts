import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelSeason } from '@orm/entities/channel/channelSeason';
import { applyProperties } from '@orm/lib/applyProperties';
import { entityUpdateMany } from '@orm/lib/entityUpdateMany';

type ChannelSeasonDto = {
  number: number
  name: string
}

export class ChannelSeasonService {
  private repository = AppDataSource.getRepository(ChannelSeason);

  async getAll(channel: Channel): Promise<ChannelSeason[]> {
    return this.repository.find({ where: { channel } });
  }

  async get(channel: Channel, number: number): Promise<ChannelSeason | null> {
    return this.repository.findOne({ where: { channel, number } });
  }

  async update(channel: Channel, dto: ChannelSeasonDto): Promise<ChannelSeason> {
    let channel_season = await this.get(channel, dto.url);

    if (!channel_season) {
      channel_season = new ChannelSeason();
      channel_season.channel = channel;
    }

    channel_season = applyProperties(channel_season, dto);

    return this.repository.save(channel_season);
  }

  async updateMany(channel: Channel, dtos: ChannelSeasonDto[]): Promise<ChannelSeason[]> {
    return entityUpdateMany<Channel, ChannelSeasonDto, ChannelSeason>(
      channel,
      dtos,
      this.getAll.bind(this),
      this.update.bind(this),
      this.repository,
      'number'
    );
  }

  async deleteAll(channel: Channel): Promise<void> {
    const channel_seasons = await this.getAll(channel);
    if (channel_seasons) {
      await this.repository.remove(channel_seasons);
    }
  }
}
