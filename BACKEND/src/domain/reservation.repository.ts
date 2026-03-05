import { ReservationEntity } from "./reservation.entity";

export interface ReservationRepository {
  findReservationById(id: string): Promise<ReservationEntity | null>;
  findReservationsByUserId(userId: string): Promise<ReservationEntity[] | null>;
  findReservationsBySpaceId(spaceId: string): Promise<ReservationEntity[] | null>;
  createReservation(reservation: ReservationEntity): Promise<ReservationEntity | null>;
  updateReservation(id: string, reservation: ReservationEntity): Promise<ReservationEntity | null>;
  findAllReservations(): Promise<ReservationEntity[] | null>;
}

