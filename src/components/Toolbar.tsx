import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, Upload, Save, Palette, FileJson } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import { Label } from "@/components/ui/label";

interface ToolbarProps {
  onExportJSON: () => void;
  onImportJSON: (data: any) => void;
  onShareLink?: () => Promise<string | void>;
  onExportPDF: () => void;
  onExportPNG: () => void;
  canvasColor: string;
  onCanvasColorChange: (color: string) => void;
  itemColor: string;
  onItemColorChange: (color: string) => void;
}

export const Toolbar = ({
  onExportJSON,
  onImportJSON,
  onShareLink,
  onExportPDF,
  onExportPNG,
  canvasColor,
  onCanvasColorChange,
  itemColor,
  onItemColorChange,
}: ToolbarProps) => {
  const [showColors, setShowColors] = useState(false);

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            onImportJSON(data);
          } catch (error) {
            console.error("Failed to parse JSON:", error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-card rounded-lg shadow-md border border-border">
      <Button variant="outline" size="sm" onClick={onExportJSON}>
        <FileJson className="h-4 w-4 mr-2" />
        Export JSON
      </Button>
      {onShareLink && (
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              const url = await onShareLink();
              if (url && typeof url === "string") {
                toast.success("Share link copied");
              }
            } catch (e) {
              console.error(e);
            }
          }}
        >
          <Upload className="h-4 w-4 mr-2" />
          Share Link
        </Button>
      )}

      <Button variant="outline" size="sm" onClick={handleImport}>
        <Upload className="h-4 w-4 mr-2" />
        Import JSON
      </Button>

      <div className="h-8 w-px bg-border" />

      <Button variant="outline" size="sm" onClick={onExportPDF}>
        <Save className="h-4 w-4 mr-2" />
        Save as PDF
      </Button>

      <Button variant="outline" size="sm" onClick={onExportPNG}>
        <Download className="h-4 w-4 mr-2" />
        Save as PNG
      </Button>

      <div className="h-8 w-px bg-border" />

      <Popover open={showColors} onOpenChange={setShowColors}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Canvas Color</Label>
              <HexColorPicker color={canvasColor} onChange={onCanvasColorChange} />
            </div>
            <div>
              <Label className="mb-2 block">Default Item Color</Label>
              <HexColorPicker color={itemColor} onChange={onItemColorChange} />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="h-8 w-px bg-border" />

      {/* credit link to github */}

      <Button
        onClick={() => {
          const url = `https://github.com/trophoston/bmc-canvas`;
        }}
        variant="link"
        size="sm"
      >
        Created by
        trophoston
      </Button>

    </div>
  );
};
