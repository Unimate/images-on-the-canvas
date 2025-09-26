import type { IImageEntity, IPoint } from "../workspace.types";

export const isPointInItem = (point: IPoint, item: IImageEntity) => {
  return (
    point.x >= item.x &&
    point.x <= item.x + item.width &&
    point.y >= item.y &&
    point.y <= item.y + item.height
  );
};
