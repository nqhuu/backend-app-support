// export class User {}

import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50, unique: true })
    username: string;

    @Column({
        type: 'varchar', length: 50,
        unique: true, nullable: true,
    })
    email: string | null;

    @Exclude() // Sử dụng decorator Exclude để loại bỏ trường password khi chuyển đổi sang JSON
    @Column()
    password: string;

    @Column({ unique: true, nullable: true })
    employeeId: number;

    @Column()
    role: string;

    @DeleteDateColumn()
    deletedAt: Date;

    @Column({ type: 'datetime' })
    lastLogin: Date;

    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'datetime' })
    updatedAt: Date;
}
