import { Expose } from "class-transformer";

export class RegisterResponseDto {
    @Expose()
    id: string;

    @Expose()
    name: string;
}