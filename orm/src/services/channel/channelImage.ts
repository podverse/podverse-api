import { Channel } from '@orm/entities/channel/channel';
import { ChannelImage } from '@orm/entities/channel/channelImage';
import { applyProperties } from '@orm/lib/applyProperties';
import { BaseManyService } from '@orm/lib/baseManyService';
import { entityUpdateMany } from '@orm/lib/entityUpdateMany';

type ChannelImageDto = {
  url: string
  image_width_size: number | null
}

export class ChannelImageService extends BaseManyService<ChannelImage, 'channel'> {
  constructor() {
    super(ChannelImage, 'channel');
  }

  async get(channel: Channel, url: string): Promise<ChannelImage | null> {
    return this.repository.findOne({ where: { channel, url } });
  }

  async update(channel: Channel, dto: ChannelImageDto): Promise<ChannelImage> {
    let channel_image = await this.get(channel, dto.url);

    if (!channel_image) {
      channel_image = new ChannelImage();
      channel_image.channel = channel;
    }

    channel_image = applyProperties(channel_image, dto);

    return this.repository.save(channel_image);
  }

  async updateMany(channel: Channel, dtos: ChannelImageDto[]): Promise<ChannelImage[]> {
    // TODO: adding image shrinking if an image < 500px is not found
  
    function filterDtosByHighestWidth(dtos: ChannelImageDto[]): ChannelImageDto[] {
      const dtoMap = new Map<string, ChannelImageDto>();
    
      for (const dto of dtos) {
        const existingDto = dtoMap.get(dto.url);
        if (!existingDto || (dto.image_width_size !== null && (existingDto.image_width_size === null || dto.image_width_size > existingDto.image_width_size))) {
          dtoMap.set(dto.url, dto);
        }
      }
    
      return Array.from(dtoMap.values());
    }

    const filteredDtos = filterDtosByHighestWidth(dtos);
  
    return entityUpdateMany<Channel, ChannelImageDto, ChannelImage>(
      channel,
      filteredDtos,
      this.getAll.bind(this),
      this.update.bind(this),
      this.repository,
      'url'
    );
  }
}
