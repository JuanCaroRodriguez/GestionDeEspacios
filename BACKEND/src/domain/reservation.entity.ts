export interface ReservationEntity {
    id: string;
    spaceId: string;
    userId: string;
    reservationDate: string;
    startTime: string;
    endTime:string;
    reservationReason: string;
    status: string;
    reservationType: string;
}
