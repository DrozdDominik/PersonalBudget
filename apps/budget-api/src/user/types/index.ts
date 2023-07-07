export enum UserRole {
    User = 'user',
    Admin = 'admin'
}

export interface NewUserData {
    name: string;
    email: string;
    passwordHash: string;
}

export type UserIdentificationData = {
    id: string
    role: UserRole
}