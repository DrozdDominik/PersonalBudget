import { Expose } from "class-transformer";
import { UserId } from "../types";

export class RegisterResponseDto {
    @Expose()
    id: UserId;

    @Expose()
    name: string;
}