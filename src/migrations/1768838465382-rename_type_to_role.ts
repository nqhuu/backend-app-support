import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameTypeToRole1768838465382 implements MigrationInterface {
    name = 'RenameTypeToRole1768838465382'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn(
            "user", // chú ý: bảng của bạn là "user" 
            "type", // cột hiện tại cần đổi tên
            "role", // tên mới của cột
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn(
            "user",
            "role",
            "type",
        );
    }
}
