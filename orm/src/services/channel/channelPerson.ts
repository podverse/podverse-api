import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelPerson } from '@orm/entities/channel/channelPerson';
import { applyProperties } from '@orm/lib/applyProperties';
import { BaseManyService } from '@orm/lib/baseManyService';
import { entityUpdateMany } from '@orm/lib/entityUpdateMany';

type ChannelPersonDto = {
  name: string
  role: string | null
  person_group: string | 'cast'
  img: string | null
  href: string | null
}

export class ChannelPersonService extends BaseManyService<ChannelPerson, 'channel'> {
  constructor() {
    super(ChannelPerson, 'channel');
  }
  
  async get(channel: Channel, name: string): Promise<ChannelPerson | null> {
    return this.repository.findOne({ where: { channel, name } });
  }

  async update(channel: Channel, dto: ChannelPersonDto): Promise<ChannelPerson> {
    let channel_person = await this.get(channel, dto.name);

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
}
