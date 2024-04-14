/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsInt, Min, ValidateIf } from 'class-validator'
import { Episode } from '~/entities'
import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity('stats_episode')
export class StatsEpisode {
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

  @OneToOne(() => Episode, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'episode_id' })
  episode: Episode

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
