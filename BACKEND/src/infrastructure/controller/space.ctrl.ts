import { Request, Response } from "express";
import { SpaceUseCase } from "../../application/spaceUseCase";

export class SpaceController {
  constructor(private spaceUseCase: SpaceUseCase) {}


  public getSpace = async ({ query }: Request, res: Response) => {
    const { uuid = '' } = query;
    const space = await this.spaceUseCase.getSpaceDetail(`${uuid}`);
    res.send({ space });
  }
  public registerSpace = async ({ body }: Request, res: Response) => {
    const space = await this.spaceUseCase.registerSpace(body);
    res.send({ space });
  }

}
