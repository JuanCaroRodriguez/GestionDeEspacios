/**
 * Infra! Mongo 🙌
 */
import { UserEntity } from "../../domain/user.entity";
import { UserRepository } from "../../domain/user.repository";
import UserModel from "../model/user.shchema"

import { ReservationEntity } from "../../domain/reservation.entity";
import { ReservationRepository } from "../../domain/reservation.repository";
import ReservationModel from "../model/reservation.shchema";

import { SpaceEntity } from "../../domain/space.entity";
import { SpaceRepository } from "../../domain/space.repository";
import SpaceModel from "../model/space.shchema";

/**
 * Mongo! 
 */
export class MongoRepository implements UserRepository, ReservationRepository, SpaceRepository {
    
    // ----------------- Users -----------------

    async findUserByEmail(email: string): Promise<any> {
        const user = await UserModel.findOne({ email });
        
        if (user == null || !user.password) {
            return null;
        }
        return user;
    }
    async findUserById(id: string): Promise<any> {
        const user = await UserModel.findOne({id})
        return user
    }
    async findAllUsers(): Promise<any> {
        const users = await UserModel.find();
        return users;
    }
    async registerUser(userIn: UserEntity): Promise<any> {
        const user = await UserModel.create(userIn)
        return user
    }
    async updateUser(user: UserEntity): Promise<any> {
        const updateData = { ...user };
        if (!user.password) {
            delete updateData.password;
        }
        const userUpdated = await UserModel
            .findOneAndUpdate({ id: user.id }, updateData, { new: true });
        return userUpdated;
    }

    // ----------------- Reservations -------------------------

    async findReservationById(id: string): Promise<any> {
        const reservation = await ReservationModel.find({ id });
        return reservation;
    }

    async findReservationsByUserId(userId: string): Promise<any> {
        const reservations = await ReservationModel.find({ userId });
        return reservations;
    }

    async findAllReservations(): Promise<any> {
        const reservations = await ReservationModel.find();
        return reservations
    }

    async findReservationsBySpaceId(spaceId: string): Promise<any> {
        const reservations = await ReservationModel.find({ spaceId });
        return reservations;
    }

    async createReservation(reservationIn: ReservationEntity): Promise<any> {
        const reservation = await ReservationModel.create(reservationIn);
        return reservation;
    }

    async updateReservation(id: string, reservationIn: ReservationEntity): Promise<any> {
        const {id:_id,...newData} = reservationIn; 
        const reservation = await ReservationModel.findOneAndUpdate(
            { id },
            {
                ...newData
            },
            { new: true } 
        );
        return reservation;
    }

    // ----------------- Spaces -----------------

    async findSpaceById(uuid: string): Promise<any> {
        const space = await SpaceModel.findOne({ uuid });
        return space;
    }

    async createSpace(spaceIn: SpaceEntity): Promise<any> {
        const space = await SpaceModel.create(spaceIn);
        return space;
    }

    async updateSpace(uuid: string): Promise<any> {
        const space = await SpaceModel.findOneAndUpdate(
            { uuid },
            { new: true }
        );
        return space;
    }

    async deleteSpace(uuid: string): Promise<boolean> {
        const result = await SpaceModel.deleteOne({ uuid });
        return result.deletedCount > 0;
    }
    
}