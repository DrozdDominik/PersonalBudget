import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from "../../user.entity";

export const TypeORMMySqlTestingModule = (entities: any[]) => [
    TypeOrmModule.forRoot({
        type: 'mysql',
        host: process.env.MYSQL_HOST || 'localhost',
        port: 3306,
        username: process.env.MYSQL_USERNAME || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'budget',
        entities: [...entities],
        synchronize: false,
    }),
        TypeOrmModule.forFeature([User]),
    ]