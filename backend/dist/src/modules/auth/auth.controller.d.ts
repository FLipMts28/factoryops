import { UsersService } from '../users/users.service';
declare class LoginDto {
    username: string;
    password: string;
}
export declare class AuthController {
    private readonly usersService;
    constructor(usersService: UsersService);
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        user: {
            id: string;
            name: string;
            createdAt: Date;
            username: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
}
export {};
