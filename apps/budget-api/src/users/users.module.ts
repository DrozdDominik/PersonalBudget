import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { UsersService } from "./services/users.service";
import { AuthService } from "./services/auth.service";

@Module({
  imports:[TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService
  ]
})
export class UsersModule {}
