import { Expose } from "class-transformer";

export class EditUserResponseDto {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    email: string;
}