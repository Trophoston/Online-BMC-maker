import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, Upload, Save, Palette, FileJson } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/i18n";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColorPickerWithHistory } from "./ColorPickerWithHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ToolbarProps {
  onExportJSON: () => void;
  onImportJSON: (data: any) => void;
  onShareLink?: () => Promise<string | void>;
  onExportPDF: () => void;
  onExportPNG: () => void;
  onDownloadTemplate?: () => void;
  onCopyTemplate?: () => void;
  canvasColor: string;
  onCanvasColorChange: (color: string) => void;
  itemColor: string;
  onItemColorChange: (color: string) => void;
  textColor?: string;
  onTextColorChange?: (color: string) => void;
  titleColor?: string;
  onTitleColorChange?: (color: string) => void;
  sectionTitleColor?: string;
  onSectionTitleColorChange?: (color: string) => void;
  onApplyThemeToItems?: (themeColors: { item: string, text: string }) => void;
}

export const Toolbar = ({
  onExportJSON,
  onImportJSON,
  onShareLink,
  onExportPDF,
  onExportPNG,
  onDownloadTemplate,
  onCopyTemplate,
  canvasColor,
  onCanvasColorChange,
  itemColor,
  onItemColorChange,
  textColor,
  onTextColorChange,
  titleColor,
  onTitleColorChange,
  sectionTitleColor,
  onSectionTitleColorChange,
  onApplyThemeToItems,
}: ToolbarProps) => {
  const [showColors, setShowColors] = useState(false);
  const { lang, setLang, t } = useI18n();

  const applyTheme = (theme: string) => {
    const themes: any = {
      default: { canvas: "#f5f3ed", item: "#9dc8ac", title: "#1f2937", section: "#374151", text: "#000000" },
      dark: { canvas: "#0f172a", item: "#1e293b", title: "#f8fafc", section: "#ffffff", text: "#ffffff" },
      pastel: { canvas: "#fdf6e3", item: "#ffb3ba", title: "#6d6875", section: "#b5838d", text: "#333333" },
      contrast: { canvas: "#000000", item: "#ffffff", title: "#ffffff", section: "#ffffff", text: "#1a1a1a" },
      minimal: { canvas: "#f8f9fa", item: "#ffffff", title: "#212529", section: "#adb5bd", text: "#212529" },
      cool: { canvas: "#f0f9ff", item: "#bae6fd", title: "#0369a1", section: "#0ea5e9", text: "#082f49" },
      warm: { canvas: "#fff7ed", item: "#ffedd5", title: "#9a3412", section: "#ea580c", text: "#431407" }
    };
    const tConfig = themes[theme] || themes.default;
    onCanvasColorChange(tConfig.canvas);
    onItemColorChange(tConfig.item);
    if (onTextColorChange) onTextColorChange(tConfig.text);
    if (onTitleColorChange) onTitleColorChange(tConfig.title);
    if (onSectionTitleColorChange) onSectionTitleColorChange(tConfig.section);
    if (onApplyThemeToItems) onApplyThemeToItems({ item: tConfig.item, text: tConfig.text });
  };

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
    <div className="flex flex-[1] items-center justify-between w-full p-4 bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-border/40">
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-xl shadow-sm bg-white/80 hover:bg-white border-border/50">
              {/* share icon here */}
              <Upload className="h-4 w-4 mr-2" />
              {t("Share") || "Share / Download"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 rounded-2xl p-2 shadow-xl bg-white/90 backdrop-blur-3xl border-border/40">
            {onShareLink && (
              <DropdownMenuItem
                className="cursor-pointer rounded-xl font-medium py-2"
                onClick={async () => {
                  try {
                    const url = await onShareLink();
                    if (url && typeof url === "string") {
                      if ((navigator as any).share) {
                        try {
                          await (navigator as any).share({ title: t("title"), url });
                        } catch (err) {}
                      }
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                <Upload className="h-4 w-4 mr-2 opacity-70" />
                {t("shareLink")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="cursor-pointer rounded-xl font-medium py-2" onClick={onExportPNG}>
              <Download className="h-4 w-4 mr-2 text-blue-500" />
              {t("saveAsPNG")}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-xl font-medium py-2" onClick={onExportPDF}>
              <Save className="h-4 w-4 mr-2 text-rose-500" />
              {t("saveAsPDF")}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-xl font-medium py-2" onClick={onExportJSON}>
              <FileJson className="h-4 w-4 mr-2 text-amber-500" />
              {t("exportJSON")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" onClick={handleImport} className="rounded-xl shadow-sm bg-white/80 hover:bg-white border-border/50">
          <Download className="h-4 w-4 mr-2 rotate-180" />
          {t("importJSON")}
        </Button>

        {(onDownloadTemplate || onCopyTemplate) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="rounded-xl shadow-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-100">
                <FileJson className="h-4 w-4 mr-2" />
                LLM Template
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-2xl p-2 shadow-xl bg-white/90 backdrop-blur-3xl border-border/40">
              {onDownloadTemplate && (
                <DropdownMenuItem className="cursor-pointer rounded-xl font-medium py-2" onClick={onDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2 text-indigo-500" />
                  Download Template
                </DropdownMenuItem>
              )}
              {onCopyTemplate && (
                <DropdownMenuItem className="cursor-pointer rounded-xl font-medium py-2" onClick={onCopyTemplate}>
                  <FileJson className="h-4 w-4 mr-2 text-indigo-500" />
                  Copy JSON Template
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <div className="h-6 w-px bg-border/40 mx-2 hidden sm:block" />

      <Popover open={showColors} onOpenChange={setShowColors}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-xl shadow-sm bg-white/80 hover:bg-white border-border/50">
            <Palette className="h-4 w-4 mr-2" />
            {t("colors")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] rounded-3xl p-4 shadow-2xl bg-white/95 backdrop-blur-3xl border-border/40">
          <Tabs defaultValue="canvas" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4 rounded-xl bg-muted/50 p-1">
              <TabsTrigger value="canvas" className="rounded-lg text-xs">Canvas</TabsTrigger>
              <TabsTrigger value="item" className="rounded-lg text-xs">Item</TabsTrigger>
              <TabsTrigger value="text" className="rounded-lg text-xs">Text</TabsTrigger>
            </TabsList>
            
            <TabsContent value="canvas" className="space-y-4 animate-in fade-in-50 duration-200">
              <div>
                <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Canvas Background</Label>
                <ColorPickerWithHistory color={canvasColor} onChange={onCanvasColorChange} />
              </div>
            </TabsContent>

            <TabsContent value="item" className="space-y-4 animate-in fade-in-50 duration-200">
              <div>
                <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Default Item Bg</Label>
                <ColorPickerWithHistory color={itemColor} onChange={onItemColorChange} />
              </div>
              <div>
                <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Default Item Text</Label>
                <ColorPickerWithHistory color={textColor || "#000000"} onChange={(c) => onTextColorChange?.(c)} />
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4 animate-in fade-in-50 duration-200">
              <div>
                <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Main Title</Label>
                <ColorPickerWithHistory color={titleColor || "#000000"} onChange={(c) => onTitleColorChange?.(c)} />
              </div>
              <div>
                <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Section Labels</Label>
                <ColorPickerWithHistory color={sectionTitleColor || "#000000"} onChange={(c) => onSectionTitleColorChange?.(c)} />
              </div>
            </TabsContent>
          </Tabs>
          <p className="pt-3 md:hidden block">{t("colorPickerScrollHint")}</p>
        </PopoverContent>
      </Popover>

      <div className="h-6 w-px bg-border/40 mx-2 hidden sm:block" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-xl shadow-sm bg-white/80 hover:bg-white border-border/50">
            <Palette className="h-4 w-4 mr-2" />
            Theme
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rounded-2xl shadow-xl w-36">
          {["default", "dark", "pastel", "contrast", "minimal", "cool", "warm"].map(thm => (
            <DropdownMenuItem key={thm} className="cursor-pointer font-medium py-2 rounded-xl capitalize" onClick={() => applyTheme(thm)}>
              {thm}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-6 w-px bg-border/40 mx-2 hidden sm:block" />

      {/* Language switch */}
      <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl">
        <button
          aria-label="lang-en"
          onClick={() => setLang("en")}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${lang === "en" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          EN
        </button>
        <button
          aria-label="lang-th"
          onClick={() => setLang("th")}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${lang === "th" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          TH
        </button>
      </div>
      </div>

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
