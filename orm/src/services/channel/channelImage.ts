import { Channel } from '@orm/entities/channel/channel';
import { ChannelImage } from '@orm/entities/channel/channelImage';
import { filterDtosByHighestWidth } from '@orm/lib/filterImageDtosByHighestWidth';
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
