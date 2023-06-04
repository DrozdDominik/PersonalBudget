import { Expose } from "class-transformer";

export class RegisterUserResponseDto {
    @Expose()
    id: string;

    @Expose()
    name: string;
}