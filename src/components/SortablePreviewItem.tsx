"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SortablePreviewItemProps = {
  id: string;
  dataUrl: string;
  index: number;
  onRemove: (id: string) => void;
  onTap: (id: string) => void;
};

export default function SortablePreviewItem({
  id,
  dataUrl,
  index,
  onRemove,
  onTap,
}: SortablePreviewItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto" as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative shrink-0">
      <div
        {...attributes}
        {...listeners}
        onClick={() => onTap(id)}
        className={`overflow-hidden rounded-xl border-3 shadow-md touch-none cursor-pointer ${
          isDragging ? "border-[#4ECDC4]" : "border-[#FFD93D]"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl}
          alt={`しゃしん ${index + 1}`}
          className="h-40 w-32 object-cover pointer-events-none"
          draggable={false}
        />
      </div>
      <button
        onClick={() => onRemove(id)}
        className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#FF6B6B] text-xs font-bold text-white shadow"
      >
        ✕
      </button>
    </div>
  );
}
