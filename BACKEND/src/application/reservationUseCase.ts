import { ReservationRepository } from "../domain/reservation.repository";
import { ReservationValue } from "../domain/reservation.value";

export class ReservationUseCase {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  // se crear una nueva reserva
  public registerReservation = async ({
    spaceId,
    userId,
    reservationDate,
    startTime,
    endTime,
    reservationReason,
    status,
    reservationType,
  }) => {
    const reservationValue = new ReservationValue({
      spaceId,
      userId,
      reservationDate,
      startTime,
      endTime,
      reservationReason,
      status,
      reservationType,
    });
    const reservationCreated = await this.reservationRepository.createReservation(reservationValue);
    return reservationCreated;
  }

  // detalles de una reserva por ID
  public getReservationDetail = async (id: string) => {
    const reservation = await this.reservationRepository.findReservationById(id);
    return reservation;
  }

  // todas las reservas de un usuario
  public getReservationsByUserId = async (userId: string) => {
    const reservations = await this.reservationRepository.findReservationsByUserId(userId);
    return reservations;
  }

  // actualizar una reserva
  public updateReservation = async ({
    id,
    spaceId,
    userId,
    reservationDate,
    startTime,
    endTime,
    reservationReason,
    status,
    reservationType,
  }) => {
    const reservationValue = new ReservationValue({
      spaceId,
      userId,
      reservationDate,
      startTime,
      endTime,
      reservationReason,
      status,
      reservationType,
    });
    const reservationUpdated = await this.reservationRepository.updateReservation(id, reservationValue);
    return reservationUpdated;
  }

  public getAllReservations = async () => {
    const reservations = await this.reservationRepository.findAllReservations();
    return reservations;
  }
  
}
