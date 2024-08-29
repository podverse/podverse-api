import { Channel } from '@orm/entities/channel/channel';
import { ChannelImage } from '@orm/entities/channel/channelImage';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ChannelImageDto = {
  url: string
  image_width_size: number | null
}

export class ChannelImageService extends BaseManyService<ChannelImage, 'channel'> {
  constructor() {
    super(ChannelImage, 'channel');
  }

  async update(channel: Channel, dto: ChannelImageDto): Promise<ChannelImage> {
    const whereKeys = ['url'] as (keyof ChannelImage)[];
    return super._update(channel, whereKeys, dto);
  }

  async updateMany(channel: Channel, dtos: ChannelImageDto[]): Promise<ChannelImage[]> {
    // TODO: adding image shrinking if an image < 500px is not found
    
    const filteredDtos = filterDtosByHighestWidth(dtos);
    const whereKeys = ['url'] as (keyof ChannelImage)[];
    return super._updateMany(channel, whereKeys, filteredDtos);
  }
}

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

