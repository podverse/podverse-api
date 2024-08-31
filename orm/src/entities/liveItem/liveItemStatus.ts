import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum LiveItemStatusEnum {
  Pending = 1,
  Live = 2,
  Ended = 3
}

export function getLiveItemStatusEnumValue(input: string | null): LiveItemStatusEnum | null {
  const sanitizedInput = input?.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');

  const mapping: { [key: string]: LiveItemStatusEnum } = {
    pending: LiveItemStatusEnum.Pending,
    live: LiveItemStatusEnum.Live,
    ended: LiveItemStatusEnum.Ended
  };

  return (sanitizedInput && mapping[sanitizedInput]) || null;
}

@Entity()
export class LiveItemStatus {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true })
  status!: 'pending' | 'live' | 'ended';
}
