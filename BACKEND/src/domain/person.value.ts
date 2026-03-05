import { v4 as uuid } from "uuid";
import { UserValue } from "./user.value";

import { ROLE_USER } from "./utils";

export class PersonValue extends UserValue {
  id: string;

  constructor({ name, email, password, role }: { name: string; email: string, password:string, role:string }) {
    super({ name, email, password, role });
    this.id = uuid();
    if (role !== ROLE_USER) {
      this.role = ROLE_USER;
    }
  }

  public setId(id: string) {
    this.id = id;
  }
}
