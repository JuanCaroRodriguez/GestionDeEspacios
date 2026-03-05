import { UserRepository } from "../domain/user.repository";
import { UserValue } from "../domain/user.value";

export class UserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  public registerUser = async ({ name, email, password, role }) => {
    const userValue = new UserValue({ name, email, password, role });
    const userCreated = await this.userRepository.registerUser(userValue);
    delete userCreated.password
    return userCreated
  }

  public getDetailUSer = async (id:string) => {
    const user = await this.userRepository.findUserById(id)
    return user
  }

  public getUserByEmail = async (email:string) => {
    const user = await this.userRepository.findUserByEmail(email)
    return user
  }

  public updateUser = async ({ id, name, email, password, role }) => {
    const userValue = new UserValue({ name, email, password, role });
    userValue.setId(id)
    const user = await this.userRepository.updateUser(userValue)
    return user
  }

  public getAllUsers = async () => {  
    const users = await this.userRepository.findAllUsers();
    return users
  }
}
