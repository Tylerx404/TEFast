"use client";

import { useMemo, useState } from "react";
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

export function TeacherUploadPanel() {
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [multipleFiles, setMultipleFiles] = useState<File[]>([]);
  const [singleFolder, setSingleFolder] = useState("images");
  const [multipleFolder, setMultipleFolder] = useState("docs");
  const [isUploadingSingle, setIsUploadingSingle] = useState(false);
  const [isUploadingMultiple, setIsUploadingMultiple] = useState(false);
  const [results, setResults] = useState<UploadFileItem[]>([]);

  const recentResults = useMemo(() => results.slice().reverse(), [results]);

  async function handleSingleUpload() {
    if (!singleFile) {
      toast.error("Hãy chọn file để upload");
      return;
    }

    setIsUploadingSingle(true);

    const formData = new FormData();
    formData.set("file", singleFile);
    formData.set("folder", singleFolder);

    try {
      const response = await uploadTeacherSingleFile(formData);
      setResults((current) => [...current, response.data]);
      toast.success("Upload file thành công");
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error("Không thể upload file");
      }
    } finally {
      setIsUploadingSingle(false);
    }
  }

  async function handleMultipleUpload() {
    if (!multipleFiles.length) {
      toast.error("Hãy chọn ít nhất 1 file");
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
      toast.success("Upload nhiều file thành công");
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error("Không thể upload nhiều file");
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
            <Input
              value={singleFolder}
              onChange={(event) => setSingleFolder(event.target.value)}
              placeholder="images"
            />
            <Input
              type="file"
              onChange={(event) => setSingleFile(event.target.files?.[0] ?? null)}
            />
            <Button onClick={handleSingleUpload} disabled={isUploadingSingle}>
              {isUploadingSingle ? "Đang upload..." : "Upload single"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upload nhiều file</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Input
              value={multipleFolder}
              onChange={(event) => setMultipleFolder(event.target.value)}
              placeholder="docs"
            />
            <Input
              type="file"
              multiple
              onChange={(event) =>
                setMultipleFiles(Array.from(event.target.files ?? []))
              }
            />
            <Button onClick={handleMultipleUpload} disabled={isUploadingMultiple}>
              {isUploadingMultiple ? "Đang upload..." : "Upload multiple"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>URL vừa upload</CardTitle>
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
              URL file vừa upload sẽ hiện ở đây để bạn dùng lại trong course, lesson,
              question hoặc vocabulary.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
