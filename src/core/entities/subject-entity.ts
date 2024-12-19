// Subject Entity
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { CourseEntity } from './course.entity';

@Entity({ name: 'subject' })
export class SubjectEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @OneToMany(() => CourseEntity, (course) => course.subject)
  courses: CourseEntity[];

  toDto() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      category: this.category?.toDto(),
    };
  }
}
