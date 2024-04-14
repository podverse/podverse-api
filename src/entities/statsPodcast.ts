/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsInt, Min, ValidateIf } from 'class-validator'
import { Podcast } from '~/entities'
import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity('stats_podcast')
export class StatsPodcast {
  @PrimaryColumn()
  id: string

  @Index()
  @ValidateIf((a) => a.pastDayTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastDayTotalUniquePageviews: number

  @Index()
  @ValidateIf((a) => a.pastWeekTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastWeekTotalUniquePageviews: number

  @Index()
  @ValidateIf((a) => a.pastMonthTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastMonthTotalUniquePageviews: number

  @Index()
  @ValidateIf((a) => a.pastYearTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastYearTotalUniquePageviews: number

  @Index()
  @ValidateIf((a) => a.pastAllTimeTotalUniquePageviews != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  pastAllTimeTotalUniquePageviews: number

  @OneToOne(() => Podcast, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'podcast_id' })
  podcast: Podcast

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
