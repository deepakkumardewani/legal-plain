"use client";

import { useState } from "react";
import { Download, Share2, FileText, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadMarkdown } from "@/lib/exportMarkdown";
import type { AnalysisResult } from "@/lib/types";
import { ShareLinkModal } from "./ShareLinkModal";

interface ExportMenuProps {
  analysis: AnalysisResult;
}

export function ExportMenu({ analysis }: ExportMenuProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleMarkdownExport = () => {
    downloadMarkdown(analysis);
  };

  const handlePdfExport = async () => {
    setPdfLoading(true);
    try {
      const { downloadPdf } = await import("@/lib/exportPdf");
      await downloadPdf(analysis);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-[#e6dccd] bg-[#fffdf8] text-[#0e0f16] hover:bg-[#f5f0e8]"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleMarkdownExport} className="gap-2 cursor-pointer">
              <FileText className="h-4 w-4" />
              Download Markdown
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handlePdfExport}
              disabled={pdfLoading}
              className="gap-2 cursor-pointer"
            >
              <FileType className="h-4 w-4" />
              {pdfLoading ? "Generating PDF…" : "Download PDF"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShareOpen(true)} className="gap-2 cursor-pointer">
              <Share2 className="h-4 w-4" />
              Share link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ShareLinkModal analysis={analysis} open={shareOpen} onOpenChange={setShareOpen} />
    </>
  );
}
