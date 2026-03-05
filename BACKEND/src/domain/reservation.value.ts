import { v4 as uuid } from "uuid";
import { ReservationEntity } from "./reservation.entity";

export class ReservationValue implements ReservationEntity {
  id: string;
  spaceId: string;
  userId: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  reservationReason: string;
  status: string;
  reservationType: string;

  constructor({spaceId, userId, reservationDate, startTime, endTime, reservationReason, status, reservationType,}:{spaceId:string; userId:string; reservationDate:string; startTime:string; endTime:string;
    reservationReason:string; status:string; reservationType:string;}) 
 {
      this.id = uuid(); 
      this.spaceId = spaceId;
      this.userId = userId;
      this.reservationDate = reservationDate;
      this.startTime = startTime;
      this.endTime = endTime;
      this.reservationReason = reservationReason;
      this.status = status;
      this.reservationType = reservationType;
 }
}
