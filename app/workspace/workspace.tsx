import { useState, useRef, useCallback, useEffect } from "react";
import { type IImageEntity } from "./workspace.types";
import { useCanvasInteractions } from "./features/canvas-interactions";

export const Workspace = () => {
  const [items, setItems] = useState<IImageEntity[]>([]);
  const [activeItem, setActiveItem] = useState<IImageEntity | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { pan, zoom, position, item } = useCanvasInteractions(canvasRef, items);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx: CanvasRenderingContext2D = canvas.getContext(
      "2d",
    ) as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    items.forEach((item: IImageEntity) => {
      if (item.image && item.image.complete) {
        ctx.save();
        ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
        ctx.rotate(item.rotation);
        ctx.drawImage(
          item.image,
          -item.width / 2,
          -item.height / 2,
          item.width,
          item.height,
        );
        ctx.restore();

        if (activeItem !== null && activeItem.id === item.id) {
          ctx.strokeStyle = "rgb(255 255 255 / 100%)";
          ctx.lineWidth = 2 / zoom;
          ctx.strokeRect(item.x, item.y, item.width, item.height);
          ctx.fill();
        }
      }
    });

    ctx.restore();
  }, [items, activeItem, zoom, pan]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      draw();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [draw]);

  useEffect(() => {
    setActiveItem(item);
    if (item && position.x !== 0 && position.y !== 0) {
      setItems((previous: IImageEntity[]) => {
        return previous.map((i: IImageEntity) => {
          if (i.id === item.id) {
            return { ...i, x: position.x, y: position.y };
          }
          return i;
        });
      });
    }
  }, [position, item]);

  const addPhoto = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const newItem: IImageEntity = {
          id: Date.now(),
          x: 100,
          y: 100,
          width: img.width * 0.3,
          height: img.height * 0.3,
          rotation: 0,
          image: img,
        };
        setItems((prev) => [...prev, newItem]);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      addPhoto(file);
    }
  };

  return (
    <div className="wrapper">
      <canvas ref={canvasRef} className="w-full h-full" />

      <div className="panel">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button onClick={() => fileInputRef.current.click()}>Add Photo</button>
      </div>
    </div>
  );
};
