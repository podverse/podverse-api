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

@Entity('episodes')
export class Episode {

  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(type => MediaRef, mediaRef => mediaRef.episode)
  mediaRefs: MediaRef[]

}
