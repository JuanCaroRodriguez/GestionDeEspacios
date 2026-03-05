import { v4 as uuid } from "uuid";
import { UserValue } from "./user.value";

import { ROLE_ADMIN } from "./utils";

export class AdminValue extends UserValue {
  id: string;

  constructor({ name, email, password, role }: { name: string; email: string, password:string, role:string }) {
    super({ name, email, password, role });
    this.id = uuid();
    if (role !== ROLE_ADMIN) {
      this.role = ROLE_ADMIN;
    }
  }

  public setId(id: string) {
    this.id = id;
  }
  
}
