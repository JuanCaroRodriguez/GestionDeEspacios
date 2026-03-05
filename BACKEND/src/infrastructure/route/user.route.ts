import { Router } from "express";
import { UserUseCase } from "../../application/userUseCase";
import { UserController } from "../controller/user.ctrl";
import { MongoRepository } from "../repository/mongo.repository";

import { authMiddleware } from "../middleware/session";
 
const route = Router()

const userRepo = new MongoRepository()
const userUseCase = new UserUseCase(userRepo)
const userCtrl = new UserController(userUseCase)


route.post(`/user`, userCtrl.registerUser)
route.get(`/user`, authMiddleware, userCtrl.getUser)
route.get(`/users`, userCtrl.getAllUsers)
route.post(`/login`, userCtrl.loginUser)
route.put(`/user`, userCtrl.updateUser)


export default route