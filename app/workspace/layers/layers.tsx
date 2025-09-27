import type { IImageEntity } from "../workspace.types";

const Menu = ({
  item = null,
  onChange,
}: {
  item: IImageEntity | null;
  onChange: (changes: Partial<IImageEntity>) => void;
}) => {
  if (item === null) {
    return null;
  }

  return (
    <div className="second-panel">
      <button
        className="control-button"
        tabIndex={0}
        onClick={() =>
          onChange({
            rotation: item.rotation + 90 > 360 ? 0 : item.rotation + 90,
            id: item.id,
          })
        }
      >
        <span>Rotate</span>
      </button>
      <button
        className="control-button"
        tabIndex={0}
        onClick={() => onChange({ reflected: !item.reflected, id: item.id })}
      >
        <span>Reflect</span>
      </button>
      <button
        className="control-button"
        tabIndex={0}
        onClick={() =>
          onChange({ scale: Math.max(item.scale - 0.1, 0.1), id: item.id })
        }
      >
        <span>Scale-</span>
      </button>
      <button
        className="control-button"
        tabIndex={0}
        onClick={() =>
          onChange({ scale: Math.min(item.scale + 0.1, 3), id: item.id })
        }
      >
        <span>Scale+</span>
      </button>
    </div>
  );
};

export const Layers = {
  Menu,
};
