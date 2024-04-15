/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsInt, IsUrl, Min, ValidateIf } from 'class-validator'
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  Unique,
  UpdateDateColumn
} from 'typeorm'
import {
  Author,
  Category,
  Episode,
  StatsMediaRef,
  User,
  UserHistoryItem,
  UserNowPlayingItem,
  UserQueueItem
} from '~/entities'
import { generateShortId } from '~/lib/utility'

@Entity('mediaRefs')
// Deprecated: we no longer ensure uniqueness with startTime as it was too buggy
// @Unique('mediaRef_index_episode_isOfficialChapter_startTime', ['episode', 'isOfficialChapter', 'startTime'])
// Instead, we ensure uniqueness with a compound index on chapterHash column
@Unique('chapterHash_3col_unique_idx', ['episode', 'isOfficialChapter', 'chapterHash'])
export class MediaRef {
  @PrimaryColumn('varchar', {
    default: generateShortId(),
    length: 14
  })
  id: string

  @Index()
  @Column()
  @Generated('increment')
  int_id: number

  // If chapters should update, we overwrite the existing chapter
  // at that chapterHash. This is just to prevent us from creating an
  // endless amount of chapter rows in our database whenever we
  // reparse a chapters file.
  @Index()
  @Column({ type: 'uuid', nullable: true })
  chapterHash: string

  @ValidateIf((a) => a.endTime != null)
  @IsInt()
  @Min(1)
  @Column({ nullable: true })
  endTime: number

  @ValidateIf((a) => a.imageUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  imageUrl?: string

  // If a chapter has true or null set for toc, then it should be handled as part of
  // the "table of contents" in the app UX. If it is set to false, then it should not.
  // podcasting 2.0 spec: https://github.com/Podcastindex-org/podcast-namespace/blob/main/chapters/jsonChapters.md#optional-attributes-1
  @Index()
  @Column({ default: null, nullable: true })
  isChapterToc: boolean

  @Index()
  @Column({ default: null, nullable: true })
  isOfficialChapter: boolean

  @Index()
  @Column({ default: false })
  isOfficialSoundBite: boolean

  @Index()
  @Column({ default: false })
  isPublic: boolean

  @ValidateIf((a) => a.linkUrl != null)
  @IsUrl()
  @Column({ nullable: true })
  linkUrl?: string

  @Index()
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  startTime: number

  @Index()
  @Column({ nullable: true })
  title?: string

  @ManyToMany((type) => Author)
  @JoinTable()
  authors: Author[]

  @ManyToMany((type) => Category)
  @JoinTable()
  categories: Category[]

  @Index()
  @ManyToOne((type) => Episode, (episode) => episode.mediaRefs, {
    onDelete: 'CASCADE'
  })
  episode: Episode

  @ManyToOne((type) => User, (user) => user.mediaRefs, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  owner: User

  @OneToMany((type) => UserHistoryItem, (userHistoryItem) => userHistoryItem.mediaRef)
  userHistoryItems: UserHistoryItem[]

  @OneToMany((type) => UserNowPlayingItem, (userNowPlayingItem) => userNowPlayingItem.mediaRef)
  userNowPlayingItems: UserNowPlayingItem[]

  @OneToMany((type) => UserQueueItem, (userQueueItem) => userQueueItem.mediaRef)
  userQueueItems: UserQueueItem[]

  @OneToMany(() => StatsMediaRef, (stats_media_ref) => stats_media_ref.mediaRef)
  stats_media_ref?: StatsMediaRef

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  beforeInsert() {
    this.id = generateShortId()
  }

  @BeforeInsert()
  @BeforeUpdate()
  trimStrings() {
    if (this.title) {
      this.title = this.title.trim() === '' ? undefined : this.title.trim()
    }
  }
}
