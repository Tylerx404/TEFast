"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  uploadTeacherMultipleFiles,
  uploadTeacherSingleFile,
} from "@/features/teacher/uploads";
import { ApiRequestError } from "@/lib/api/client";
import type { UploadFileItem } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UPLOAD_FOLDER_OPTIONS = [
  {
    value: "images",
    label: "Hinh anh",
    description: "PNG, JPG, WEBP va cac file image khac",
    accept: "image/*",
  },
  {
    value: "audio",
    label: "Audio",
    description: "MP3, WAV, M4A va cac file am thanh",
    accept: "audio/*",
  },
  {
    value: "docs",
    label: "Tai lieu",
    description: "PDF, DOCX, XLSX, PPTX, TXT, ZIP...",
    accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip",
  },
] as const;

type UploadFolder = (typeof UPLOAD_FOLDER_OPTIONS)[number]["value"];

function getUploadFolderOption(folder: UploadFolder) {
  return (
    UPLOAD_FOLDER_OPTIONS.find((option) => option.value === folder) ??
    UPLOAD_FOLDER_OPTIONS[0]
  );
}

export function TeacherUploadPanel() {
  const singleInputRef = useRef<HTMLInputElement | null>(null);
  const multipleInputRef = useRef<HTMLInputElement | null>(null);
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [multipleFiles, setMultipleFiles] = useState<File[]>([]);
  const [singleFolder, setSingleFolder] = useState<UploadFolder>("images");
  const [multipleFolder, setMultipleFolder] = useState<UploadFolder>("docs");
  const [isUploadingSingle, setIsUploadingSingle] = useState(false);
  const [isUploadingMultiple, setIsUploadingMultiple] = useState(false);
  const [results, setResults] = useState<UploadFileItem[]>([]);

  const recentResults = useMemo(() => results.slice().reverse(), [results]);
  const singleFolderOption = getUploadFolderOption(singleFolder);
  const multipleFolderOption = getUploadFolderOption(multipleFolder);

  async function handleSingleUpload() {
    if (!singleFile) {
      toast.error("Hay chon file de upload");
      return;
    }

    setIsUploadingSingle(true);

    const formData = new FormData();
    formData.set("file", singleFile);
    formData.set("folder", singleFolder);

    try {
      const response = await uploadTeacherSingleFile(formData);
      setResults((current) => [...current, response.data]);
      setSingleFile(null);
      if (singleInputRef.current) {
        singleInputRef.current.value = "";
      }
      toast.success("Upload file thanh cong");
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error("Khong the upload file");
      }
    } finally {
      setIsUploadingSingle(false);
    }
  }

  async function handleMultipleUpload() {
    if (!multipleFiles.length) {
      toast.error("Hay chon it nhat 1 file");
      return;
    }

    setIsUploadingMultiple(true);

    const formData = new FormData();
    multipleFiles.forEach((file) => {
      formData.append("files", file);
    });
    formData.set("folder", multipleFolder);

    try {
      const response = await uploadTeacherMultipleFiles(formData);
      setResults((current) => [...current, ...response.data]);
      setMultipleFiles([]);
      if (multipleInputRef.current) {
        multipleInputRef.current.value = "";
      }
      toast.success("Upload nhieu file thanh cong");
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error("Khong the upload nhieu file");
      }
    } finally {
      setIsUploadingMultiple(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.6fr_0.4fr]">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload 1 file</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="single-upload-folder">Loai upload</Label>
              <Select
                value={singleFolder}
                onValueChange={(value) => {
                  setSingleFolder(value as UploadFolder);
                  setSingleFile(null);
                  if (singleInputRef.current) {
                    singleInputRef.current.value = "";
                  }
                }}
              >
                <SelectTrigger id="single-upload-folder">
                  <SelectValue placeholder="Chon loai file" />
                </SelectTrigger>
                <SelectContent>
                  {UPLOAD_FOLDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {`${singleFolderOption.description}. Luu vao /uploads/${singleFolder}.`}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="single-upload-file">File</Label>
              <Input
                ref={singleInputRef}
                id="single-upload-file"
                type="file"
                accept={singleFolderOption.accept}
                onChange={(event) => setSingleFile(event.target.files?.[0] ?? null)}
              />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {singleFile ? `Da chon: ${singleFile.name}` : "Chua chon file."}
              </p>
            </div>
            <Button onClick={handleSingleUpload} disabled={isUploadingSingle}>
              {isUploadingSingle ? "Dang upload..." : "Upload single"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload nhieu file</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="multiple-upload-folder">Loai upload</Label>
              <Select
                value={multipleFolder}
                onValueChange={(value) => {
                  setMultipleFolder(value as UploadFolder);
                  setMultipleFiles([]);
                  if (multipleInputRef.current) {
                    multipleInputRef.current.value = "";
                  }
                }}
              >
                <SelectTrigger id="multiple-upload-folder">
                  <SelectValue placeholder="Chon loai file" />
                </SelectTrigger>
                <SelectContent>
                  {UPLOAD_FOLDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {`${multipleFolderOption.description}. Luu vao /uploads/${multipleFolder}.`}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="multiple-upload-file">Files</Label>
              <Input
                ref={multipleInputRef}
                id="multiple-upload-file"
                type="file"
                multiple
                accept={multipleFolderOption.accept}
                onChange={(event) =>
                  setMultipleFiles(Array.from(event.target.files ?? []))
                }
              />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {multipleFiles.length
                  ? `Da chon ${multipleFiles.length} file.`
                  : "Chua chon file nao."}
              </p>
            </div>
            <Button onClick={handleMultipleUpload} disabled={isUploadingMultiple}>
              {isUploadingMultiple ? "Dang upload..." : "Upload multiple"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>URL vua upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentResults.length ? (
            recentResults.map((item) => (
              <div
                key={`${item.fileName}-${item.url}`}
                className="rounded-[1.25rem] border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4"
              >
                <p className="font-medium">{item.originalName}</p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {item.mimeType} • {item.size} bytes
                </p>
                <pre className="mt-3 overflow-x-auto rounded-[1rem] bg-[#221d19] p-3 text-xs text-[#f8f1e5]">
                  {item.url}
                </pre>
              </div>
            ))
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              URL file vua upload se hien o day de ban dung lai trong course,
              lesson, question hoac vocabulary.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
