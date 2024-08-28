import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelImage } from '@orm/entities/channel/channelImage';
import { applyProperties } from '@orm/lib/applyProperties';

type ChannelImageDto = {
  url: string
  image_width_size: number | null
}

export class ChannelImageService {
  private channelImageRepository = AppDataSource.getRepository(ChannelImage);

  async getAllByChannel(channel: Channel): Promise<ChannelImage[] | null> {
    return this.channelImageRepository.find({ where: { channel } });
  }

  async getByChannelAndUrl(channel: Channel, url: string): Promise<ChannelImage | null> {
    return this.channelImageRepository.findOne({ where: { channel, url } });
  }

  async createOrUpdate(channel: Channel, dto: ChannelImageDto): Promise<ChannelImage> {
    let channel_image = await this.getByChannelAndUrl(channel, dto.url);

    if (!channel_image) {
      channel_image = new ChannelImage();
      channel_image.channel = channel;
    }

    channel_image = applyProperties(channel_image, dto);

    return this.channelImageRepository.save(channel_image);
  }

  async updateMany(channel: Channel, dtos: ChannelImageDto[]): Promise<ChannelImage[]> {
    const existingChannelImages = await this.getAllByChannel(channel);
    const updatedChannelImages: ChannelImage[] = [];

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
    const dtoUrls = filteredDtos.map(dto => dto.url);
  
    for (const dto of filteredDtos) {
      const channel_image = await this.createOrUpdate(channel, dto);
      updatedChannelImages.push(channel_image);
    }
  
    await this.channelImageRepository.save(updatedChannelImages);
  
    const imagesToDelete = existingChannelImages?.filter(image => !dtoUrls.includes(image.url));
    if (imagesToDelete && imagesToDelete.length > 0) {
      await this.channelImageRepository.remove(imagesToDelete);
    }
  
    return updatedChannelImages;
  }

  async deleteAllByChannel(channel: Channel): Promise<void> {
    const channelImages = await this.getAllByChannel(channel);
    if (channelImages) {
      await this.channelImageRepository.remove(channelImages);
    }
  }
}
