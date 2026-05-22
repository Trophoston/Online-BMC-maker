import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/i18n/i18n";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Link as LinkIcon, Clipboard, Trash2 } from "lucide-react";
import { ColorPickerWithHistory } from "./ColorPickerWithHistory";
import { BMCItem } from "./BMCSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: Partial<BMCItem>) => void;
  onDelete?: (id: string) => void;
  item?: BMCItem | null;
  defaultColor: string;
  defaultTextColor?: string;
  sectionTitle?: string | null;
}

export const ItemDialog = ({ open, onClose, onSave, onDelete, item, defaultColor, defaultTextColor = "#000000", sectionTitle }: ItemDialogProps) => {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [color, setColor] = useState(defaultColor);
  const [textColor, setTextColor] = useState(defaultTextColor);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form when item changes or dialog opens
  useEffect(() => {
    if (open) {
      setTitle(item?.title || "");
      setDescription(item?.description || "");
      setImageUrl(item?.imageUrl || "");
      setColor(item?.color || defaultColor);
      setTextColor(item?.textColor || defaultTextColor);
    }
  }, [open, item, defaultColor, defaultTextColor]);

  const handleSave = () => {
    onSave({
      id: item?.id,
      title,
      description,
      imageUrl: imageUrl || undefined,
      color,
      textColor,
    });
    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setImageUrl("");
    setColor(defaultColor);
    setTextColor(defaultTextColor);
    setShowUrlInput(false);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onload = (e) => {
              setImageUrl(e.target?.result as string);
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
    } catch (err) {
      console.error('Failed to paste image:', err);
    }
  };

  const presetColors = [
    { name: "Yellow", bg: "#fef9c3", text: "#854d0e" },
    { name: "Blue", bg: "#e0f2fe", text: "#0369a1" },
    { name: "Green", bg: "#dcfce7", text: "#166534" },
    { name: "Pink", bg: "#ffe4e6", text: "#9f1239" },
    { name: "Purple", bg: "#f3e8ff", text: "#6b21a8" },
    { name: "Orange", bg: "#ffedd5", text: "#9a3412" },
    { name: "White", bg: "#ffffff", text: "#1f2937" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8 border-0 shadow-2xl bg-white/95 backdrop-blur-xl dark:bg-zinc-950/95">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-black tracking-tight">
            {item ? t("editItem") : t("addNewItem")}
          </DialogTitle>
          {sectionTitle && (
            <p className="text-xs font-bold text-muted-foreground mt-1 bg-black/5 dark:bg-white/5 w-fit px-3 py-1.5 rounded-full uppercase tracking-wider">
              {sectionTitle}
            </p>
          )}
        </DialogHeader>
        <div className="space-y-6 mt-2" style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}>
          <div>
            <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("field_title")}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("placeholder_title")}
              className="mt-1.5 rounded-2xl border-border/60 focus-visible:ring-primary"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("field_description")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("placeholder_description")}
              rows={3}
              className="mt-1.5 rounded-2xl border-border/60 focus-visible:ring-primary resize-none"
            />
          </div>

          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Image Attachment</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl border-border/60 hover:bg-accent/40 text-xs font-semibold"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5 mr-2 opacity-70" />
                {t("uploadFile")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl border-border/60 hover:bg-accent/40 text-xs font-semibold"
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                <LinkIcon className="h-3.5 w-3.5 mr-2 opacity-70" />
                {t("urlLabel")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl border-border/60 hover:bg-accent/40 text-xs font-semibold"
                onClick={handlePaste}
              >
                <Clipboard className="h-3.5 w-3.5 mr-2 opacity-70" />
                {t("pasteLabel")}
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            {showUrlInput && (
              <Input
                className="mt-3 rounded-xl border-border/60 focus-visible:ring-primary text-xs"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={t("enterImageUrl")}
              />
            )}
            {imageUrl && (
              <div className="mt-3 relative group rounded-2xl overflow-hidden border border-border/40 shadow-md max-w-sm">
                <img src={imageUrl} alt="Preview" className="w-full h-44 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="rounded-xl text-xs font-semibold shadow-lg"
                    onClick={() => setImageUrl("")}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Image
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("colors") || "Colors"}</Label>
            <Tabs defaultValue="presets" className="w-full">
              <TabsList className="grid grid-cols-2 rounded-xl bg-muted/60 p-1 mb-4 max-w-[280px]">
                <TabsTrigger value="presets" className="rounded-lg text-xs font-semibold">Presets</TabsTrigger>
                <TabsTrigger value="custom" className="rounded-lg text-xs font-semibold">Custom</TabsTrigger>
              </TabsList>
              
              <TabsContent value="presets" className="space-y-2 animate-in fade-in-50 duration-200">
                <div className="flex flex-wrap gap-3">
                  {presetColors.map((p) => {
                    const isSelected = color.toLowerCase() === p.bg.toLowerCase();
                    return (
                      <button
                        key={p.bg}
                        type="button"
                        className={`flex items-center justify-center w-11 h-11 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 shadow-sm ${
                          isSelected ? "border-primary ring-2 ring-primary/20 scale-[1.05]" : "border-black/5 dark:border-white/5"
                        }`}
                        style={{ backgroundColor: p.bg }}
                        onClick={() => {
                          setColor(p.bg);
                          setTextColor(p.text);
                        }}
                        title={p.name}
                      >
                        {isSelected && (
                          <span 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: p.text }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">{t("backgroundColor")}</Label>
                    <div className="mt-1">
                      <ColorPickerWithHistory color={color} onChange={setColor} />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">{t("textColor")}</Label>
                    <div className="mt-1">
                      <ColorPickerWithHistory color={textColor} onChange={setTextColor} />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-border/20">
            {item && (
              <Button
                variant="destructive"
                className="rounded-2xl flex-1 sm:flex-none py-5 px-6 font-bold"
                onClick={() => {
                  const confirmed = window.confirm(t("confirmDelete") || "Are you sure?");
                  if (confirmed) {
                    onDelete?.(item.id);
                    handleClose();
                  }
                }}
              >
                {t("delete")}
              </Button>
            )}
            <Button variant="outline" className="rounded-2xl flex-1 sm:flex-none py-5 px-6 font-bold border-border/60" onClick={handleClose}>
              {t("cancel")}
            </Button>
            <Button className="rounded-2xl flex-1 sm:flex-none py-5 px-6 font-bold" onClick={handleSave} disabled={!title}>
              {t("save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
