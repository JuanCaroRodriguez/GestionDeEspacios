import { Router } from "express";
import { SpaceUseCase } from "../../application/spaceUseCase";
import { SpaceController } from "../controller/space.ctrl";
import { MongoRepository } from "../repository/mongo.repository";

import { authMiddleware } from "../middleware/session";

const route = Router();

const spaceRepo = new MongoRepository();
const spaceUseCase = new SpaceUseCase(spaceRepo);
const spaceCtrl = new SpaceController(spaceUseCase);


route.post(`/space`, authMiddleware, spaceCtrl.registerSpace);
route.get(`/space`, authMiddleware, spaceCtrl.getSpace);

export default route;
