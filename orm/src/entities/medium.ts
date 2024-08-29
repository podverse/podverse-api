import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum MediumValueEnum {
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

export function getMediumValueEnumValue(input: string | null): MediumValueEnum | null {
  const sanitizedInput = input?.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');

  const mapping: { [key: string]: MediumValueEnum } = {
    publisher: MediumValueEnum.Publisher,
    podcast: MediumValueEnum.Podcast,
    music: MediumValueEnum.Music,
    video: MediumValueEnum.Video,
    film: MediumValueEnum.Film,
    audiobook: MediumValueEnum.Audiobook,
    newsletter: MediumValueEnum.Newsletter,
    blog: MediumValueEnum.Blog,
    course: MediumValueEnum.Course,
    mixed: MediumValueEnum.Mixed,
    podcastl: MediumValueEnum.PodcastL,
    musicl: MediumValueEnum.MusicL,
    videol: MediumValueEnum.VideoL,
    filml: MediumValueEnum.FilmL,
    audiobookl: MediumValueEnum.AudiobookL,
    newsletterl: MediumValueEnum.NewsletterL,
    blogl: MediumValueEnum.BlogL,
    publisherl: MediumValueEnum.PublisherL,
    coursel: MediumValueEnum.CourseL
  };

  return (sanitizedInput && mapping[sanitizedInput]) || null;
}

@Entity({ name: 'medium_value' })
export class Medium {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: MediumValueEnum
  })
  value!: MediumValueEnum;
}
