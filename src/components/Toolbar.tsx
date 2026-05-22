import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Upload, 
  Save, 
  Palette, 
  FileJson, 
  Globe, 
  Sparkles, 
  Share2, 
  Github, 
  SlidersHorizontal,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/i18n";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColorPickerWithHistory } from "./ColorPickerWithHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ToolbarProps {
  onExportJSON: () => void;
  onImportClick: () => void;
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

const THEMES: Record<string, { canvas: string, item: string, title: string, section: string, text: string }> = {
  default: { canvas: "#f5f3ed", item: "#9dc8ac", title: "#1f2937", section: "#374151", text: "#000000" },
  dark: { canvas: "#0f172a", item: "#1e293b", title: "#f8fafc", section: "#ffffff", text: "#ffffff" },
  pastel: { canvas: "#fdf6e3", item: "#ffb3ba", title: "#6d6875", section: "#b5838d", text: "#333333" },
  contrast: { canvas: "#000000", item: "#ffffff", title: "#ffffff", section: "#ffffff", text: "#1a1a1a" },
  minimal: { canvas: "#f8f9fa", item: "#ffffff", title: "#212529", section: "#adb5bd", text: "#212529" },
  cool: { canvas: "#f0f9ff", item: "#bae6fd", title: "#0369a1", section: "#0ea5e9", text: "#082f49" },
  warm: { canvas: "#fff7ed", item: "#ffedd5", title: "#9a3412", section: "#ea580c", text: "#431407" }
};

export const Toolbar = ({
  onExportJSON,
  onImportClick,
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
    const tConfig = THEMES[theme] || THEMES.default;
    onCanvasColorChange(tConfig.canvas);
    onItemColorChange(tConfig.item);
    if (onTextColorChange) onTextColorChange(tConfig.text);
    if (onTitleColorChange) onTitleColorChange(tConfig.title);
    if (onSectionTitleColorChange) onSectionTitleColorChange(tConfig.section);
    if (onApplyThemeToItems) onApplyThemeToItems({ item: tConfig.item, text: tConfig.text });
  };

  return (
    <div className="w-full p-2 bg-white/50 dark:bg-zinc-950/40 backdrop-blur-2xl rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between transition-all duration-300">
      
      {/* Left / Main Bento grid of controls */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* Bento Box 1: Style & Theme */}
        <div className="flex items-center gap-1.5 p-1 bg-white/95 dark:bg-zinc-900/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-2xl border border-zinc-200/30 dark:border-zinc-800/30">
          <span className="text-[10px] font-black tracking-wider text-muted-foreground uppercase pl-2 pr-1 select-none hidden sm:inline-block">Theme</span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 px-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold gap-2 text-zinc-700 dark:text-zinc-300"
              >
                <Palette className="h-3.5 w-3.5 text-indigo-500" />
                <span>{t("Theme") || "Themes"}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-2xl shadow-xl w-48 p-1.5 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-border/40">
              {Object.keys(THEMES).map((thm) => (
                <DropdownMenuItem 
                  key={thm} 
                  className="cursor-pointer font-semibold py-2 px-2.5 rounded-xl flex items-center justify-between gap-3 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors" 
                  onClick={() => applyTheme(thm)}
                >
                  <span className="capitalize">{thm}</span>
                  <div className="flex items-center -space-x-1.5 ml-auto">
                    <span 
                      className="w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-950 shadow-sm" 
                      style={{ backgroundColor: THEMES[thm].canvas }} 
                      title="Canvas" 
                    />
                    <span 
                      className="w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-950 shadow-sm" 
                      style={{ backgroundColor: THEMES[thm].item }} 
                      title="Item bg" 
                    />
                    <span 
                      className="w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-950 shadow-sm" 
                      style={{ backgroundColor: THEMES[thm].section }} 
                      title="Section Text" 
                    />
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover open={showColors} onOpenChange={setShowColors}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 px-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold gap-2 text-zinc-700 dark:text-zinc-300"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-sky-500" />
                <span>{t("colors")}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[290px] rounded-3xl p-4 shadow-2xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl border-border/40">
              <Tabs defaultValue="canvas" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1">
                  <TabsTrigger value="canvas" className="rounded-lg text-xs font-bold">Canvas</TabsTrigger>
                  <TabsTrigger value="item" className="rounded-lg text-xs font-bold">Item</TabsTrigger>
                  <TabsTrigger value="text" className="rounded-lg text-xs font-bold">Text</TabsTrigger>
                </TabsList>
                
                <TabsContent value="canvas" className="space-y-4 animate-in fade-in-50 duration-200">
                  <div>
                    <Label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-muted-foreground">Canvas Background</Label>
                    <ColorPickerWithHistory color={canvasColor} onChange={onCanvasColorChange} />
                  </div>
                </TabsContent>

                <TabsContent value="item" className="space-y-4 animate-in fade-in-50 duration-200">
                  <div>
                    <Label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-muted-foreground">Default Item Bg</Label>
                    <ColorPickerWithHistory color={itemColor} onChange={onItemColorChange} />
                  </div>
                  <div>
                    <Label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-muted-foreground">Default Item Text</Label>
                    <ColorPickerWithHistory color={textColor || "#000000"} onChange={(c) => onTextColorChange?.(c)} />
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-4 animate-in fade-in-50 duration-200">
                  <div>
                    <Label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-muted-foreground">Main Title</Label>
                    <ColorPickerWithHistory color={titleColor || "#000000"} onChange={(c) => onTitleColorChange?.(c)} />
                  </div>
                  <div>
                    <Label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-muted-foreground">Section Labels</Label>
                    <ColorPickerWithHistory color={sectionTitleColor || "#000000"} onChange={(c) => onSectionTitleColorChange?.(c)} />
                  </div>
                </TabsContent>
              </Tabs>
              <p className="pt-3 text-[10px] text-muted-foreground text-center">{t("colorPickerScrollHint")}</p>
            </PopoverContent>
          </Popover>
        </div>

        {/* Bento Box 2: Data & Sharing */}
        <div className="flex items-center gap-1.5 p-1 bg-white/95 dark:bg-zinc-900/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-2xl border border-zinc-200/30 dark:border-zinc-800/30">
          <span className="text-[10px] font-black tracking-wider text-muted-foreground uppercase pl-2 pr-1 select-none hidden sm:inline-block">Export</span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 px-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold gap-2 text-zinc-700 dark:text-zinc-300"
              >
                <Share2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>{t("Share") || "Share / Download"}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-2xl p-1.5 shadow-xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl border-border/40">
              {onShareLink && (
                <DropdownMenuItem
                  className="cursor-pointer rounded-xl font-semibold py-2 px-2.5 text-xs flex items-center text-zinc-700 dark:text-zinc-300"
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
              <DropdownMenuItem 
                className="cursor-pointer rounded-xl font-semibold py-2 px-2.5 text-xs flex items-center text-zinc-700 dark:text-zinc-300" 
                onClick={onExportPNG}
              >
                <Download className="h-4 w-4 mr-2 text-blue-500" />
                {t("saveAsPNG")}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer rounded-xl font-semibold py-2 px-2.5 text-xs flex items-center text-zinc-700 dark:text-zinc-300" 
                onClick={onExportPDF}
              >
                <Save className="h-4 w-4 mr-2 text-rose-500" />
                {t("saveAsPDF")}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer rounded-xl font-semibold py-2 px-2.5 text-xs flex items-center text-zinc-700 dark:text-zinc-300" 
                onClick={onExportJSON}
              >
                <FileJson className="h-4 w-4 mr-2 text-amber-500" />
                {t("exportJSON")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onImportClick} 
            className="h-9 px-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold gap-2 text-zinc-700 dark:text-zinc-300"
          >
            <Download className="h-3.5 w-3.5 rotate-180 text-orange-500" />
            <span>{t("importJSON")}</span>
          </Button>
        </div>

        {/* Bento Box 3: LLM Assist */}
        {(onDownloadTemplate || onCopyTemplate) && (
          <div className="flex items-center gap-1.5 p-1 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-[0_2px_8px_rgba(99,102,241,0.05)] rounded-2xl border border-indigo-100/40 dark:border-indigo-900/30">
            <span className="text-[10px] font-black tracking-wider text-indigo-600 dark:text-indigo-400 uppercase pl-2 pr-1 select-none hidden sm:inline-block">AI Tools</span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 px-3 rounded-xl hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 text-xs font-bold gap-2 text-indigo-700 dark:text-indigo-300"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  <span>LLM Template</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-2xl p-1.5 shadow-xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl border-border/40">
                {onDownloadTemplate && (
                  <DropdownMenuItem 
                    className="cursor-pointer rounded-xl font-semibold py-2 px-2.5 text-xs flex items-center text-zinc-700 dark:text-zinc-300" 
                    onClick={onDownloadTemplate}
                  >
                    <Download className="h-4 w-4 mr-2 text-indigo-500" />
                    Download Template
                  </DropdownMenuItem>
                )}
                {onCopyTemplate && (
                  <DropdownMenuItem 
                    className="cursor-pointer rounded-xl font-semibold py-2 px-2.5 text-xs flex items-center text-zinc-700 dark:text-zinc-300" 
                    onClick={onCopyTemplate}
                  >
                    <FileJson className="h-4 w-4 mr-2 text-indigo-500" />
                    Copy JSON Template
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

      </div>

      {/* Right / Preferences & Credits Bento grid */}
      <div className="flex items-center justify-between lg:justify-end gap-3 flex-wrap">
        
        {/* Bento Box 4: Language Switcher */}
        <div className="flex items-center p-1 bg-white/95 dark:bg-zinc-900/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-2xl border border-zinc-200/30 dark:border-zinc-800/30">
          <Globe className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 ml-2 mr-1" />
          <div className="flex items-center gap-1">
            <button
              aria-label="lang-en"
              onClick={() => setLang("en")}
              className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                lang === "en" 
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              aria-label="lang-th"
              onClick={() => setLang("th")}
              className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                lang === "th" 
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              TH
            </button>
          </div>
        </div>

        {/* Bento Box 5: Credits Link */}
        <div className="flex items-center px-3 py-1 bg-white/95 dark:bg-zinc-900/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-2xl border border-zinc-200/30 dark:border-zinc-800/30 h-9">
          <Button
            onClick={() => {
              const url = `https://github.com/trophoston`;
              window.open(url, "_blank");
            }}
            variant="link"
            size="sm"
            className="h-auto p-0 font-bold hover:no-underline text-xs flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <Github className="h-3.5 w-3.5" />
            <span>{t("createdBy")} trophoston</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Button>
        </div>

      </div>

    </div>
  );
};

