import { Injectable } from "@nestjs/common";
import { CreateUserRequest } from "@/infrastructure/adapters/in/rest/dto/requests/create-user.request";
import { User } from "../models/user";

@Injectable()
export class UserMapper {
    fromCreateRequestToDomain(request: CreateUserRequest): User {
        const user = new User();
        user.name = request.name;
        user.email = request.email;
        user.role = request.role;
        user.password = request.password;
        return user;
    }
}