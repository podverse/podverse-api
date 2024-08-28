import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum MediumValueValueEnum {
  Publisher = 1,
  Podcast = 2,
  Music = 3,
  Video = 4,
  Film = 5,
  Audiobook = 6,
  Newsletter = 7,
  Blog = 8,
  Course = 9,
  Mixed = 10,
  PodcastL = 11,
  MusicL = 12,
  VideoL = 13,
  FilmL = 14,
  AudiobookL = 15,
  NewsletterL = 16,
  BlogL = 17,
  PublisherL = 18,
  CourseL = 19
}

export function getMediumValueValueEnumValue(input: string | null): MediumValueValueEnum | null {
  const sanitizedInput = input?.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');

  const mapping: { [key: string]: MediumValueValueEnum } = {
    publisher: MediumValueValueEnum.Publisher,
    podcast: MediumValueValueEnum.Podcast,
    music: MediumValueValueEnum.Music,
    video: MediumValueValueEnum.Video,
    film: MediumValueValueEnum.Film,
    audiobook: MediumValueValueEnum.Audiobook,
    newsletter: MediumValueValueEnum.Newsletter,
    blog: MediumValueValueEnum.Blog,
    course: MediumValueValueEnum.Course,
    mixed: MediumValueValueEnum.Mixed,
    podcastl: MediumValueValueEnum.PodcastL,
    musicl: MediumValueValueEnum.MusicL,
    videol: MediumValueValueEnum.VideoL,
    filml: MediumValueValueEnum.FilmL,
    audiobookl: MediumValueValueEnum.AudiobookL,
    newsletterl: MediumValueValueEnum.NewsletterL,
    blogl: MediumValueValueEnum.BlogL,
    publisherl: MediumValueValueEnum.PublisherL,
    coursel: MediumValueValueEnum.CourseL
  };

  return (sanitizedInput && mapping[sanitizedInput]) || null;
}

@Entity({ name: 'medium_value' })
export class MediumValue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: MediumValueValueEnum
  })
  value!: MediumValueValueEnum;
}
