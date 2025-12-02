import { Role } from "@/domain/enums/role";

export interface CreateUserRequest {
    name: string;
    email: string;
    role: Role;
    password: string;
}