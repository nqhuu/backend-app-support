import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('refresh_tokens') // tên bảng trong database sẽ là refresh_tokens, nếu không có @Entity('refresh_tokens') thì tên bảng sẽ được tự động đặt theo tên class là RefreshToken, nhưng để đảm bảo tên bảng trong database là refresh_tokens thì mình sẽ thêm @Entity('refresh_tokens') vào đây
export class RefreshToken { // đây là entity để định nghĩa cấu trúc của bảng refresh_tokens trong database, mỗi instance của class này sẽ tương ứng với một bản ghi trong bảng refresh_tokens
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
