import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    findAll(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
}
