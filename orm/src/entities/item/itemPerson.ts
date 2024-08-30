import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Item } from './item';

@Entity()
export class ItemPerson {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  role!: string | null;

  @Column({ type: 'varchar', default: 'cast' })
  person_group!: string | null;

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
