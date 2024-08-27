import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelPerson } from '@orm/entities/channel/channelPerson';
import { applyProperties } from '@orm/lib/applyProperties';
import { channelCreateOrUpdateMany } from '@orm/lib/channel/channelCreateOrUpdateMany';

type ChannelPersonDto = {
  name: string
  role: string | null
  person_group: string | 'cast'
  img: string | null
  href: string | null
}

export class ChannelPersonService {
  private channelPersonRepository = AppDataSource.getRepository(ChannelPerson);

  async getAllByChannel(channel: Channel): Promise<ChannelPerson[]> {
    return this.channelPersonRepository.find({ where: { channel } });
  }

  async getByChannelAndName(channel: Channel, name: string): Promise<ChannelPerson | null> {
    return this.channelPersonRepository.findOne({ where: { channel, name } });
  }

  async createOrUpdate(channel: Channel, dto: ChannelPersonDto): Promise<ChannelPerson> {
    let channel_person = await this.getByChannelAndName(channel, dto.name);

    if (!channel_person) {
      channel_person = new ChannelPerson();
      channel_person.channel = channel;
    }

    channel_person = applyProperties(channel_person, dto);

    return this.channelPersonRepository.save(channel_person);
  }

  async createOrUpdateMany(channel: Channel, dtos: ChannelPersonDto[]): Promise<ChannelPerson[]> {
    return channelCreateOrUpdateMany(
      channel,
      dtos,
      this.getAllByChannel.bind(this),
      this.createOrUpdate.bind(this),
      {
        save: this.channelPersonRepository.save.bind(this.channelPersonRepository),
        remove: async (entities: ChannelPerson[]) => {
          await this.channelPersonRepository.remove(entities);
        }
      },
      (dto: ChannelPersonDto) => dto.name,
      (person: ChannelPerson) => person.name
    );
  }

  async deleteAllByChannel(channel: Channel): Promise<void> {
    const channelPersons = await this.getAllByChannel(channel);
    if (channelPersons) {
      await this.channelPersonRepository.remove(channelPersons);
    }
  }
}
