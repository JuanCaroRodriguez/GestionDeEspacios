import { SpaceEntity } from "./space.entity";

export interface SpaceRepository {
  findSpaceById(spaceId: string): Promise<SpaceEntity | null>;
  createSpace(space: SpaceEntity): Promise<SpaceEntity | null>;
  updateSpace(spaceId: string): Promise<SpaceEntity | null>;
  deleteSpace(spaceId: string): Promise<boolean>;
}

