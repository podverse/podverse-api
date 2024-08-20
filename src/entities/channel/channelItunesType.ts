import { Entity, PrimaryGeneratedColumn, Column, Unique, Check } from 'typeorm';

@Entity()
@Unique(['itunesType'])
@Check(`itunesType IN ('episodic', 'serial')`)
export class ChannelItunesType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  itunes_type!: string;
}
