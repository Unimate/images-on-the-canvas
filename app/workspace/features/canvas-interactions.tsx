import { isPointInItem } from "../utils/utils";
import type { IImageEntity, IPoint } from "../workspace.types";
import { useState, useEffect, useRef, type RefObject } from "react";

export const useCanvasInteractions = (
  canvas: RefObject<HTMLCanvasElement | null>,
  items: IImageEntity[],
) => {
  const [position, setPosition] = useState<IPoint>({ x: 0, y: 0 });
  const [selectedItem, setSelectedItem] = useState<IImageEntity | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState<IPoint>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<IPoint>({ x: 0, y: 0 });

  const itemsRef = useRef(items);
  const selectedItemRef = useRef(selectedItem);
  const startPositionRef = useRef(startPosition);
  const isDraggingRef = useRef(isDragging);
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);

  itemsRef.current = items;
  selectedItemRef.current = selectedItem;
  startPositionRef.current = startPosition;
  zoomRef.current = zoom;
  panRef.current = pan;
  isDraggingRef.current = isDragging;

  const getPosition = (e: MouseEvent): IPoint => {
    const rect = (canvas.current as HTMLCanvasElement).getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const x = (screenX - panRef.current.x) / zoomRef.current;
    const y = (screenY - panRef.current.y) / zoomRef.current;

    return { x: x, y: y };
  };

  const handleMouseMove = (e: MouseEvent) => {
    const worldPos = getPosition(e);
    if (isDraggingRef.current && selectedItemRef.current) {
      const dx = worldPos.x - startPositionRef.current.x;
      const dy = worldPos.y - startPositionRef.current.y;
      setPosition({
        x: selectedItemRef.current.x + dx,
        y: selectedItemRef.current.y + dy,
      });
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    const position = getPosition(e);
    setIsDragging(true);
    let isExists = false;

    for (const item of itemsRef.current) {
      if (isPointInItem(position, item)) {
        setStartPosition(position);
        setSelectedItem(item);
        isExists = true;
        break;
      }
    }

    if (!isExists) {
      setIsDragging(false);
      setSelectedItem(null);
      setStartPosition({ x: 0, y: 0 });
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    setIsDragging(false);
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    const { x, y } = getPosition(e);
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const nextZoom = Math.max(0.1, Math.min(3, zoomRef.current * delta));

    const nextPan = {
      x: x - ((x - panRef.current.x) / zoomRef.current) * nextZoom,
      y: y - ((y - panRef.current.y) / zoomRef.current) * nextZoom,
    };

    setZoom(nextZoom);
    setPan(nextPan);
  };

  useEffect(() => {
    if (!canvas.current) return;
    const current = canvas.current as HTMLCanvasElement;

    current.addEventListener("mousemove", handleMouseMove);
    current.addEventListener("mousedown", handleMouseDown);
    current.addEventListener("mouseup", handleMouseUp);
    current.addEventListener("wheel", handleWheel);

    return () => {
      current.removeEventListener("mousemove", handleMouseMove);
      current.removeEventListener("mousedown", handleMouseDown);
      current.removeEventListener("mouseup", handleMouseUp);
      current.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return {
    position: position,
    zoom: zoom,
    pan: pan,
    item: selectedItem,
  };
};
