import { Role } from "../enums/role";

export class User {
    id: string;
    name: string
    email: string;
    role: Role;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}