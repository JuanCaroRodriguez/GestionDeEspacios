import { Request, Response } from "express";
import { ReservationUseCase } from "../../application/reservationUseCase";

export class ReservationController {
  constructor(private reservationUseCase: ReservationUseCase) {}


  public getReservation = async ({ query }: Request, res: Response) => {
    const { id = '' } = query;
    const reservation = await this.reservationUseCase.getReservationDetail(`${id}`);
    res.send({ reservation }); 
  }

  public getAllReservations = async (req: Request, res: Response) => {
    const reservations = await this.reservationUseCase.getAllReservations();
    res.send({ reservations });
  }
  
  public registerReservation = async ({ body }: Request, res: Response) => {
    const reservation = await this.reservationUseCase.registerReservation(body);
    res.send({ reservation });
  }
  
  public getReservationsByUserId = async ({ query }: Request, res: Response) => {
    const { userId } = query;
    const reservations = await this.reservationUseCase.getReservationsByUserId(`${userId}`);
    res.send({ reservations });
  }

  public updateReservation = async ({ body }: Request, res: Response) => {
    const reservation = await this.reservationUseCase.updateReservation(body);
    res.send({ reservation });
  }

}
