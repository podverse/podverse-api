import { Entity, PrimaryGeneratedColumn, Column, Unique, Check } from 'typeorm';

@Entity()
@Unique(['itunes_type'])
@Check(`itunes_type IN ('episodic', 'serial')`)
export class ChannelItunesType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  itunes_type!: string;
}
