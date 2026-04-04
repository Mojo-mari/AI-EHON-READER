"use client";

import { useRef, useState, useCallback, DragEvent } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import exifr from "exifr";
import SortablePreviewItem from "./SortablePreviewItem";
import { Camera, Plus, CalendarArrowUp, Undo2, ScanText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

type CameraCaptureProps = {
  onCapture: (imageDataUrls: string[]) => void;
};

type PreviewItem = {
  id: string;
  dataUrl: string;
  capturedAt: Date | null;
};

let nextId = 0;
function generateId(): string {
  return `preview-${Date.now()}-${nextId++}`;
}

async function readExifDate(file: File): Promise<Date | null> {
  try {
    const exif = await exifr.parse(file, { pick: ["DateTimeOriginal"] });
    if (exif?.DateTimeOriginal instanceof Date) {
      return exif.DateTimeOriginal;
    }
    return null;
  } catch {
    return null;
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  });
}

async function filesToPreviewItems(
  files: FileList | File[]
): Promise<PreviewItem[]> {
  const fileArray = Array.from(files).filter((f) =>
    f.type.startsWith("image/")
  );
  return Promise.all(
    fileArray.map(async (file) => {
      const [dataUrl, capturedAt] = await Promise.all([
        fileToDataUrl(file),
        readExifDate(file),
      ]);
      return { id: generateId(), dataUrl, capturedAt };
    })
  );
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // dnd-kit センサー設定: スマホでは長押し200msでドラッグ開始（横スクロールと区別）
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const addFiles = useCallback((files: FileList | File[]) => {
    filesToPreviewItems(files).then((items) => {
      if (items.length > 0) {
        setPreviews((prev) => [...prev, ...items]);
      }
    });
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      addFiles(files);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        addFiles(files);
      }
    },
    [addFiles]
  );

  const handleUsePhotos = useCallback(() => {
    if (previews.length > 0) {
      onCapture(previews.map((p) => p.dataUrl));
      setPreviews([]);
    }
  }, [previews, onCapture]);

  const handleRemovePhoto = useCallback((id: string) => {
    setPreviews((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleReset = useCallback(() => {
    setPreviews([]);
  }, []);

  const handleTapCapture = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleTapImage = useCallback((id: string) => {
    const item = previews.find((p) => p.id === id);
    if (item) setViewingImage(item.dataUrl);
  }, [previews]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPreviews((prev) => {
        const oldIndex = prev.findIndex((p) => p.id === active.id);
        const newIndex = prev.findIndex((p) => p.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  // EXIF撮影日時の早い順にソート
  const handleSortByDate = useCallback(() => {
    setPreviews((prev) => {
      const withDate = prev
        .filter((p) => p.capturedAt !== null)
        .sort(
          (a, b) => a.capturedAt!.getTime() - b.capturedAt!.getTime()
        );
      const withoutDate = prev.filter((p) => p.capturedAt === null);
      return [...withDate, ...withoutDate];
    });
  }, []);

  // EXIF情報を持つ画像が1枚以上あるかチェック
  const hasExifDates = previews.some((p) => p.capturedAt !== null);

  // ファイル入力（常にDOMに存在させる）
  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/png,image/jpeg,image/gif,image/webp"
      multiple
      onChange={handleFileChange}
      className="hidden"
    />
  );

  // プレビュー表示中
  if (previews.length > 0) {
    return (
      <div
        className={`flex flex-col items-center gap-4 rounded-2xl border-3 border-dashed p-4 transition-colors ${isDragging ? "border-secondary bg-secondary/10" : "border-transparent"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {fileInput}
        <p className="text-sm font-bold text-foreground">
          {previews.length}まいのしゃしん
        </p>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={previews.map((p) => p.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex w-full gap-2 overflow-x-auto px-2 pb-2">
              {previews.map((item, i) => (
                <SortablePreviewItem
                  key={item.id}
                  id={item.id}
                  dataUrl={item.dataUrl}
                  index={i}
                  onRemove={handleRemovePhoto}
                  onTap={handleTapImage}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <p className="text-xs text-muted-foreground">
          長おしでドラッグして順番をかえられるよ
        </p>
        <button
          onClick={handleUsePhotos}
          className="btn-secondary-gradient flex w-full max-w-xs items-center justify-center gap-2 rounded-full px-6 py-4 text-lg font-bold text-white"
        >
          <ScanText className="size-5" />
          よみとる
        </button>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={handleTapCapture}
            className="action-btn flex items-center gap-1.5 rounded-full bg-accent px-5 py-3 text-base font-bold text-accent-foreground"
          >
            <Plus className="size-4" />
            ついか
          </button>
          {hasExifDates && (
            <button
              onClick={handleSortByDate}
              className="action-btn flex items-center gap-1.5 rounded-full bg-secondary px-5 py-3 text-base font-bold text-white"
            >
              <CalendarArrowUp className="size-4" />
              さつえい日じゅん
            </button>
          )}
          <button
            onClick={handleReset}
            className="action-btn flex items-center gap-1.5 rounded-full bg-muted px-5 py-3 text-base font-bold text-muted-foreground"
          >
            <Undo2 className="size-4" />
            やりなおす
          </button>
        </div>

        {/* 画像拡大モーダル（Dialog） */}
        <Dialog
          open={viewingImage !== null}
          onOpenChange={(open) => {
            if (!open) setViewingImage(null);
          }}
        >
          <DialogContent
            className="max-w-[90vw] border-none bg-transparent p-0 ring-0 shadow-none sm:max-w-[90vw]"
            showCloseButton={false}
          >
            <DialogTitle className="sr-only">拡大プレビュー</DialogTitle>
            <div className="relative flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {viewingImage && (
                <img
                  src={viewingImage}
                  alt="拡大プレビュー"
                  className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // 撮影ボタン＋ドラッグ＆ドロップエリア
  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-2xl border-3 border-dashed p-6 transition-colors ${isDragging ? "border-secondary bg-secondary/10" : "border-border"}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {fileInput}
      <button
        onClick={handleTapCapture}
        className="capture-btn flex h-40 w-40 flex-col items-center justify-center rounded-full text-white"
      >
        <Camera className="size-12" />
        <span className="mt-1 text-sm font-bold">ページをさつえい</span>
      </button>
      <p className="text-center text-sm text-muted-foreground">
        ボタンをおすか、ここに画像をドラッグ＆ドロップ
        <br />
        <span className="text-xs">（まとめてえらべるよ）</span>
      </p>
    </div>
  );
}
