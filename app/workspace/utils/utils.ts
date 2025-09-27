import type { IImageEntity, IPoint } from "../workspace.types";

export const isPointInItem = (point: IPoint, item: IImageEntity) => {
  const scaledWidth = item.width * item.scale;
  const scaledHeight = item.height * item.scale;

  const scaledX = item.x - (scaledWidth - item.width) / 2;
  const scaledY = item.y - (scaledHeight - item.height) / 2;

  return (
    point.x >= scaledX &&
    point.x <= scaledX + scaledWidth &&
    point.y >= scaledY &&
    point.y <= scaledY + scaledHeight
  );
};
