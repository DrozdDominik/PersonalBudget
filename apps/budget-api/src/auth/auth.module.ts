import { Module } from '@nestjs/common';
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { AuthController } from "./auth.controller";

@Module({
    imports:[UsersService],
    controllers: [AuthController],
    providers: [
        UsersService,
        AuthService
    ]
})
export class UsersModule {}
