import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from "./user/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from 'path'
import { config } from "./config/config";
import { AuthModule } from "./auth/auth.module";

const { host, username, password, database } = config.db

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host,
    port: 3306,
    username,
    password,
    database,
    entities: [join(__dirname, '**', '*.entity.{ts,js}')],
    synchronize: false,
  }),
    UserModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
