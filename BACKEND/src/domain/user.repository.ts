import { UserEntity } from "./user.entity";

export interface UserRepository {
  findUserByEmail(email: string): Promise<UserEntity | null>;
  findUserById(id: string): Promise<UserEntity | null>;
  findAllUsers(): Promise<UserEntity[] | null>;
  registerUser(user:UserEntity): Promise<UserEntity | null>;
  updateUser(user:UserEntity): Promise<UserEntity | null>;
}
