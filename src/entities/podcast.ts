import { IsUrl, IsInt, Min, IsNotEmpty, ValidateIf } from 'class-validator'
import { MediaRef } from 'entities/mediaRef'
import {
  BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm'

const shortid = require('shortid')

@Entity('podcasts')
export class Podcast {

  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(type => MediaRef, mediaRef => mediaRef.podcast)
  mediaRefs: MediaRef[]

}
