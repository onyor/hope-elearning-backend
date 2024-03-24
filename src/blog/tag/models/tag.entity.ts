import { AuditingEntity } from '@/common/models/auditing.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TagDto } from './tag.dto';

@Entity({ name: 'tag' })
export class TagEntity extends AuditingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  toDto() {
    return new TagDto({
      id: this.id,
      slug: this.slug,
      name: this.name,
      audit: this.toAudit(),
    });
  }
}
