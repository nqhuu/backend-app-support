import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('refresh_tokens')
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    userId: number;

    @Column({ length: 255 })
    refreshToken: string;

    @Column({ length: 255, nullable: true })
    userAgent: string;

    @Column({ length: 45, nullable: true })
    ipAddress: string;

    @Column({ default: false })
    isRevoked: boolean;

    @Column({ type: 'datetime', nullable: true })
    expiredAt: Date;

    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'datetime' })
    updatedAt: Date;
}
