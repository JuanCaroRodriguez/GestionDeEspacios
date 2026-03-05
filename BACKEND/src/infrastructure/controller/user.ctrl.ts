import { Request, Response } from "express";
import { UserUseCase } from "../../application/userUseCase";

import { encrypt, verified } from "../utils/bcrypt.handle";
import { generateToken } from "../utils/jwt.handle";

export class UserController {
  constructor(private userUseCase: UserUseCase) {
  }

  public getUser = async ({ query }: Request, res: Response) => {
    const { id = '' } = query;
    const user = await this.userUseCase.getDetailUSer(`${id}`);
    res.status(200).send({ user });
  }

  public getAllUsers = async (req: Request, res: Response) => {
    const users = await this.userUseCase.getAllUsers();
    res.status(200).send({ users });
  }
  

  public registerUser = async ({ body }: Request, res: Response) => {

    const user = await this.userUseCase.getUserByEmail(body.email);

    if (user) {
      res.status(404).send({ message: 'User already exists' });
      return;
    }
 
    const passHash = await encrypt(body.password);
    body.password = passHash;

    const newUser = await this.userUseCase.registerUser(body);

    res.status(201).send({ newUser });
  }

  public loginUser = async ({ body }: Request, res: Response) => {
    const { email, password } = body;
    const user = await this.userUseCase.getUserByEmail(email);

    if (!user) {
      res.status(404).send({ message: 'User not found' });
      return;
    }
    console.log(user)

    const isPasswordValid = await verified(password, user.password);

    if (!isPasswordValid) {
      res.status(401).send({ message: 'Invalid password' });
      return;
    }
    const { id, name, role } = user; 
    const token = generateToken({ id, name, email, role });

    res.status(200).send({ token, user: { id, name, email, role } });
  }

  public updateUser = async ({ body }: Request, res: Response) => {
    
    const userCurrent = await this.userUseCase.getDetailUSer(body.id);
    console.log(userCurrent)

    const isPasswordValid = await verified(body.currentPassword, userCurrent.password);

    if (!isPasswordValid) {
      res.status(401).send({ message: 'Invalid password' });
      return;
    }

    if(body.password){
      const passHash = await encrypt(body.password);
      body.password = passHash;
    }

    console.log(body)
    
    const user = await this.userUseCase.updateUser(body);

    if (!user) {
      res.status(404).send({ message: 'User not found' });
      return;
    }

    const { id, name, email, role } = user;
    const token = generateToken({ id, name, email, role });

    res.status(200).send({ user, token });
  }
  
}
