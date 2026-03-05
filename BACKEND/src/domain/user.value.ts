import { v4 as uuid } from "uuid";
import { UserEntity } from "./user.entity";

export class UserValue implements UserEntity {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;

  constructor({ name, email, password, role }: { name: string; email: string, password:string, role:string }) {
    this.id = uuid();
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
  }

  public setId(id: string) {
    this.id = id;
  }
  
}
