import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelPerson } from '@orm/entities/channel/channelPerson';
import { applyProperties } from '@orm/lib/applyProperties';
import { entityUpdateMany } from '@orm/lib/entityUpdateMany';

type ChannelPersonDto = {
  name: string
  role: string | null
  person_group: string | 'cast'
  img: string | null
  href: string | null
}

export class ChannelPersonService {
  private repository = AppDataSource.getRepository(ChannelPerson);

  async getAll(channel: Channel): Promise<ChannelPerson[]> {
    return this.repository.find({ where: { channel } });
  }

  async getOne(channel: Channel, name: string): Promise<ChannelPerson | null> {
    return this.repository.findOne({ where: { channel, name } });
  }

  async update(channel: Channel, dto: ChannelPersonDto): Promise<ChannelPerson> {
    let channel_person = await this.getOne(channel, dto.name);

    if (!channel_person) {
      channel_person = new ChannelPerson();
      channel_person.channel = channel;
    }

    channel_person = applyProperties(channel_person, dto);

    return this.repository.save(channel_person);
  }

  async updateMany(channel: Channel, dtos: ChannelPersonDto[]): Promise<ChannelPerson[]> {
    return entityUpdateMany<Channel, ChannelPersonDto, ChannelPerson>(
      channel,
      dtos,
      this.getAll.bind(this),
      this.update.bind(this),
      this.repository,
      'name'
    );
  }

  async deleteAll(channel: Channel): Promise<void> {
    const channel_persons = await this.getAll(channel);
    if (channel_persons) {
      await this.repository.remove(channel_persons);
    }
  }
}
