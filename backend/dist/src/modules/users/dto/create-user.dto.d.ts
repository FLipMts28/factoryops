export declare enum UserRole {
    ADMIN = "ADMIN",
    ENGINEER = "ENGINEER",
    OPERATOR = "OPERATOR",
    MAINTENANCE = "MAINTENANCE"
}
export declare class CreateUserDto {
    username: string;
    name: string;
    password: string;
    role: UserRole;
}
