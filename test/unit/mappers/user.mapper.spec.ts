import { Test } from "@nestjs/testing";
import { Role } from "@/domain/enums/role";
import { UserMapper } from "@/domain/mappers/user.mapper";
import { CreateUserRequest } from "@/infrastructure/adapters/in/rest/dto/requests/create-user.request";

describe('UserMapper', () => {
    let sut: UserMapper;
    
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [UserMapper],
        }).compile();

        sut = moduleRef.get<UserMapper>(UserMapper);
    });

    it("should be defined", () => {
        expect(sut).toBeDefined();
    });

    describe("fromCreateRequestToDomain", () => {
        it("should map CreateUserRequest to User domain model", () => {
            const request: CreateUserRequest = {
                name: "John Doe",
                email: "john.doe@example.com",
                role: Role.MEMBER,
                password: "securepassword"
            };

            const result = sut.fromCreateRequestToDomain(request);

            expect(result).toBeDefined();
            expect(result.name).toBe(request.name);
            expect(result.email).toBe(request.email);
            expect(result.role).toBe(request.role);
            expect(result.password).toBe(request.password);
        });
    });
});