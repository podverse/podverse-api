import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';

@Entity()
export class ChannelPerson {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Channel, channel => channel.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  role!: string | null;

  @Column({ type: 'varchar', default: 'cast' })
  person_group!: string;

  @Column({ type: 'varchar', nullable: true  })
  img!: string | null;

  @Column({ type: 'varchar', nullable: true  })
  href!: string | null;

  @BeforeInsert()
  @BeforeUpdate()
  lowercaseFields() {
    if (this.role) {
      this.role = this.role.toLowerCase();
    }
    if (this.person_group) {
      this.person_group = this.person_group.toLowerCase();
    }
  }
}

