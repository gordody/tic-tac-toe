import React from "react";

export interface GridProps {
  rows: number;
  cols: number;
  cellSize?: number; // px
  gap?: number; // px
  className?: string;
  // Single callback for the whole grid. Receives:
  // - the clicked/focused cell element (or null),
  // - zero-indexed row and col (or undefined),
  // - the original React event (Mouse or Keyboard).
  onGridClick?: (
    cell: HTMLDivElement | null,
    x?: number,
    y?: number,
    event?: React.SyntheticEvent
  ) => void;
  renderCell?: (x: number, y: number) => React.ReactNode;
}

export const Grid: React.FC<GridProps> = ({
  rows,
  cols,
  cellSize = 40,
  gap = 4,
  className,
  onGridClick,
  renderCell,
}) => {
  const containerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridAutoRows: `${cellSize}px`,
    gap: `${gap}px`,
  };

  const cellStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    cursor: "pointer",
    background: "#fff",
    border: "1px solid #ddd",
    boxSizing: "border-box",
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as Element).closest("[data-cell]") as HTMLDivElement | null;
    const y = target ? Number(target.dataset.row) : undefined;
    const x = target ? Number(target.dataset.col) : undefined;
    onGridClick?.(target, x, y, e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const active = document.activeElement as HTMLElement | null;
    const target = active?.closest("[data-cell]") as HTMLDivElement | null;
    const y = target ? Number(target.dataset.row) : undefined;
    const x = target ? Number(target.dataset.col) : undefined;
    onGridClick?.(target, x, y, e);
    e.preventDefault();
  };

  const cells: React.ReactNode[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const key = `${y}-${x}`;
      cells.push(
        <div
          key={key}
          data-cell
          data-col={x}
          data-row={y}
          role="button"
          tabIndex={0}
          style={cellStyle}
          aria-label={`cell-${y}-${x}`}
        >
          {renderCell ? renderCell(x, y) : null}
        </div>
      );
    }
  }

  return (
    <div
      className={className}
      style={containerStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {cells}
    </div>
  );
};

export default Grid;