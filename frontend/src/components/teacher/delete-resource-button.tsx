"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApiRequestError } from "@/lib/api/client";

type DeleteResourceButtonProps = {
  label: string;
  description: string;
  onDelete: () => Promise<unknown>;
  redirectTo?: string;
};

export function DeleteResourceButton({
  label,
  description,
  onDelete,
  redirectTo,
}: DeleteResourceButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    setIsPending(true);

    try {
      await onDelete();
      toast.success(`${label} đã được xóa`);

      if (redirectTo) {
        router.push(redirectTo);
      }

      router.refresh();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error(`Không thể xóa ${label.toLowerCase()}`);
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4" />
          Xóa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa {label.toLowerCase()}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Hủy</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Đang xóa..." : "Xác nhận xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
