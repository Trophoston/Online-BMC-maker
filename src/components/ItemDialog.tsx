import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/i18n/i18n";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Link as LinkIcon, Clipboard } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { BMCItem } from "./BMCSection";

interface ItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: Partial<BMCItem>) => void;
  onDelete?: (id: string) => void;
  item?: BMCItem | null;
  defaultColor: string;
}

export const ItemDialog = ({ open, onClose, onSave, onDelete, item, defaultColor }: ItemDialogProps) => {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [color, setColor] = useState(defaultColor);
  const [textColor, setTextColor] = useState("#000000");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form when item changes or dialog opens
  useEffect(() => {
    if (open) {
      setTitle(item?.title || "");
      setDescription(item?.description || "");
      setImageUrl(item?.imageUrl || "");
      setColor(item?.color || "#6aaf8c");
      setTextColor(item?.textColor || "#fff");
    }
  }, [open, item, defaultColor]);

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
    setTextColor("#000000");
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>{item ? t("editItem") : t("addNewItem")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4" style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}>
          <div>
            <Label htmlFor="title">{t("field_title")}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("placeholder_title")}
            />
          </div>

          <div>
            <Label htmlFor="description">{t("field_description")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("placeholder_description")}
              rows={3}
            />
          </div>

          <div>
            <Label>Image</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {t("uploadFile")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                {t("urlLabel")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePaste}
              >
                <Clipboard className="h-4 w-4 mr-2" />
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
                className="mt-2"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={t("enterImageUrl")}
              />
            )}
            {imageUrl && (
              <div className="mt-2">
                <img src={imageUrl} alt="Preview" className="w-full h-80 object-cover rounded" />
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
            <div>
              <Label>{t("backgroundColor")}</Label>
              <div className="mt-2">
                <HexColorPicker color={color} onChange={setColor} />
              </div>
            </div>
            <div>
              <Label>{t("textColor")}</Label>
              <div className="mt-2">
                <HexColorPicker color={textColor} onChange={setTextColor} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-4">
            {item && (
              <Button
                variant="destructive"
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
            <Button variant="outline" onClick={handleClose}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSave} disabled={!title}>
              {t("save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
