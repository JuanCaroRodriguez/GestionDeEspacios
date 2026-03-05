import { v4 as uuid } from "uuid";
import { SpaceEntity } from "./space.entity";

export class SpaceValue implements SpaceEntity {
   id: string;
   name: string;
   type: string;
   location:string;

   constructor({ name, type, location}) 
   {
      this.id =  uuid();
      this.name = name;
      this.type = type;
      this.location = location;
   }
}
