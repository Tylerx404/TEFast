"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

import { uploadTeacherSingleFile } from "@/features/teacher/uploads";
import { ApiRequestError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ImageUploadFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function ImageUploadField({
  value,
  onChange,
  disabled = false,
  placeholder = "/uploads/images/example.jpg",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", "images");

    try {
      const response = await uploadTeacherSingleFile(formData);
      onChange(response.data.url);
      toast.success("Upload ảnh thành công");
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error("Không thể upload ảnh lúc này");
      }
    } finally {
      event.target.value = "";
      setIsUploading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled || isUploading}
      />
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          {isUploading ? "Đang upload ảnh..." : "Chọn ảnh để upload"}
        </Button>
        {value ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[hsl(var(--primary))] underline-offset-4 hover:underline"
          >
            Mở ảnh hiện tại
          </a>
        ) : (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Bạn vẫn có thể dán URL ảnh nếu đã có sẵn.
          </p>
        )}
      </div>
    </div>
  );
}
