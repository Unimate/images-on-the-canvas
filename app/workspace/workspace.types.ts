export enum DragType {
  MOVE = "move",
  RESIZE = "resize",
  ROTATE = "rotate",
  NONE = "none",
}

export interface IPoint {
  x: number;
  y: number;
}

export interface IImageEntity {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  image: HTMLImageElement;
}
