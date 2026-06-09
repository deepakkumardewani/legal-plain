"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ClearHistoryButtonProps {
  onClear: () => Promise<void>;
}

export function ClearHistoryButton({ onClear }: ClearHistoryButtonProps) {
  const [open, setOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function handleConfirm() {
    setClearing(true);
    try {
      await onClear();
      setOpen(false);
    } finally {
      setClearing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-sm text-[#9a9080] underline-offset-2 transition-colors duration-150 hover:text-[#c0392b]">
          Clear all
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear all history?</DialogTitle>
          <DialogDescription>
            This will permanently delete all saved analyses. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={clearing}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={clearing}
            className="bg-[#c0392b] text-white hover:bg-[#a93226]"
          >
            {clearing ? "Clearing…" : "Clear all"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
