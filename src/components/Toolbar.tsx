import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, Upload, Save, Palette, FileJson } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/i18n";

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
  titleColor?: string;
  onTitleColorChange?: (color: string) => void;
  sectionTitleColor?: string;
  onSectionTitleColorChange?: (color: string) => void;
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
  titleColor,
  onTitleColorChange,
  sectionTitleColor,
  onSectionTitleColorChange,
}: ToolbarProps) => {
  const [showColors, setShowColors] = useState(false);
  const { lang, setLang, t } = useI18n();

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
        {t("exportJSON")}
      </Button>
      {onShareLink && (
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              const url = await onShareLink();
              if (url && typeof url === "string") {
                if ((navigator as any).share) {
                  try {
                    await (navigator as any).share({ title: t("title"), url });
                    // navigator.share may not give feedback; show a confirmation
                    // if have cut image 
                    if (url.includes("imagesRemoved=true")) {
                      toast.success(t("shareLinkCopiedImagesRemoved"));
                    }else{
                      return t("shareLinkCopied");
                    }
                  } catch (err) {
                    
                  }
                } else {
                }
              }
            } catch (e) {
              console.error(e);
            }
          }}
        >
          <Upload className="h-4 w-4 mr-2" />
          {t("shareLink")}
        </Button>
      )}

      <Button variant="outline" size="sm" onClick={handleImport}>
        <Upload className="h-4 w-4 mr-2" />
        {t("importJSON")}
      </Button>

      <div className="h-8 w-px bg-border" />

      <Button variant="outline" size="sm" onClick={onExportPDF}>
        <Save className="h-4 w-4 mr-2" />
        {t("saveAsPDF")}
      </Button>

      <Button variant="outline" size="sm" onClick={onExportPNG}>
        <Download className="h-4 w-4 mr-2" />
        {t("saveAsPNG")}
      </Button>

      <div className="h-8  bg-border" />

      <Popover open={showColors} onOpenChange={setShowColors}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Palette className="h-4 w-4 mr-2" />
            {t("colors")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="md:w-full sm:w-[100vw]">
          <div className="flex gap-5 items-center justify-evenly flex-wrap">
            <div>
              <Label className="mb-2 block">{t("canvasColor")}</Label>
              <HexColorPicker color={canvasColor} onChange={onCanvasColorChange} />
            </div>
            {/* <div>
              <Label className="mb-2 block">{t("itemColor")}</Label>
              <HexColorPicker color={itemColor} onChange={onItemColorChange} />
            </div> */}
            <div>
              <Label className="mb-2 block">{t("titleColor")}</Label>
              <HexColorPicker color={titleColor || "#000000"} onChange={(c) => onTitleColorChange?.(c)} />
            </div>
            <div>
              <Label className="mb-2 block">{t("sectionTitleColor")}</Label>
              <HexColorPicker color={sectionTitleColor || "#000000"} onChange={(c) => onSectionTitleColorChange?.(c)} />
            </div>
          </div>

          <p className="pt-3 md:hidden block">{t("colorPickerScrollHint")}</p>
        </PopoverContent>
      </Popover>

      <div className="h-8 w-px bg-border" />

      {/* Language switch */}
      <div className="flex items-center gap-2">
        <button
          aria-label="lang-en"
          onClick={() => setLang("en")}
          className={`px-2 py-1 rounded ${lang === "en" ? "bg-accent text-white" : "bg-transparent"}`}
        >
          EN
        </button>
        <button
          aria-label="lang-th"
          onClick={() => setLang("th")}
          className={`px-2 py-1 rounded ${lang === "th" ? "bg-accent text-white" : "bg-transparent"}`}
        >
          TH
        </button>
      </div>

      <div className="h-8 w-px bg-border" />

      {/* credit link to github */}

      <Button
        onClick={() => {
          const url = `https://github.com/trophoston`;
          window.open(url, "_blank");
        }}
        variant="link"
        size="sm"
      >
        {t("createdBy")} trophoston
      </Button>

    </div>
  );
};
