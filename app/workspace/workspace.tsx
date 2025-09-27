import { useState, useRef, useCallback, useEffect } from "react";
import { type IImageEntity } from "./workspace.types";
import { useCanvasInteractions } from "./features/canvas-interactions";
import { Layers } from "./layers/layers";

export const Workspace = () => {
  const [items, setItems] = useState<IImageEntity[]>([]);
  const [activeItem, setActiveItem] = useState<IImageEntity | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const itemsRef = useRef(items);

  itemsRef.current = items;

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
        ctx.rotate((item.rotation * Math.PI) / 180);

        if (item.reflected) {
          ctx.scale(item.scale * -1, item.scale);
        } else {
          ctx.scale(item.scale, item.scale);
        }

        ctx.drawImage(
          item.image,
          -item.width / 2,
          -item.height / 2,
          item.width,
          item.height,
        );

        if (activeItem !== null && activeItem.id === item.id) {
          ctx.strokeStyle = "rgb(255 255 255 / 100%)";
          ctx.lineWidth = 2 / zoom;
          ctx.strokeRect(
            -item.width / 2,
            -item.height / 2,
            item.width,
            item.height,
          );
          ctx.fill();
        }
      }
      ctx.restore();
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

  const addPhoto = useCallback((file: Blob) => {
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
          reflected: false,
          index: itemsRef.current.length,
          scale: 1,
        };
        setItems((prev) => [...prev, newItem]);
      };
      img.src = (e.target as FileReader).result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e.target.files as FileList)[0];
    if (file && file.type.startsWith("image/")) {
      addPhoto(file);
    }
  };

  const handleItemChange = (changes: Partial<IImageEntity>) => {
    setItems((prev) => {
      return prev.map((item) => {
        if (item.id === changes.id) {
          const update = { ...item, ...changes };
          setActiveItem(update);
          return update;
        }
        return item;
      });
    });
  };

  return (
    <div className="wrapper">
      <canvas ref={canvasRef} className="w-full h-full" />

      {activeItem !== null && (
        <Layers.Menu item={activeItem} onChange={handleItemChange} />
      )}

      <div className="panel">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button onClick={() => fileInputRef.current?.click()}>Add Photo</button>
      </div>
    </div>
  );
};
