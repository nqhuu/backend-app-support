import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDepartment1768749992134 implements MigrationInterface {
    name = 'CreateDepartment1768749992134'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`department\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(50) NOT NULL, \`description\` varchar(255) NULL, \`password\` varchar(255) NOT NULL, \`parentId\` int NULL, \`deletedAt\` datetime(6) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_62690f4fe31da9eb824d909285\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`email\` \`email\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`employeeId\` \`employeeId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`employeeId\` \`employeeId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`email\` \`email\` varchar(50) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`DROP INDEX \`IDX_62690f4fe31da9eb824d909285\` ON \`department\``);
        await queryRunner.query(`DROP TABLE \`department\``);
    }

}
