import { Plus, Edit2, Trash2, MoveVertical, Pen } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n/i18n";

export interface BMCItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  color: string;
  textColor?: string;
}

interface BMCSectionProps {
  title: string;
  items: BMCItem[];
  onAddItem: () => void;
  onEditItem: (item: BMCItem) => void;
  onDeleteItem: (id: string) => void;
  onReorderItems: (items: BMCItem[]) => void;
  defaultColor: string;
  hideAddButton?: boolean;
  icon?: ReactNode;
  sectionTitleColor?: string;
}

export const BMCSection = ({
  title,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onReorderItems,
  defaultColor,
  hideAddButton = false,
  icon,
  sectionTitleColor
}: BMCSectionProps) => {
  const { t } = useI18n();
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));

    if (dragIndex === dropIndex) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    onReorderItems(newItems);
  };

  return (
    <div className="h-full flex flex-col border border-border/40 bg-card/60 backdrop-blur-3xl shadow-sm rounded-3xl p-5 transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-5 px-1">
        {icon && <span className="text-muted-foreground/80" style={{ color: sectionTitleColor || undefined }}>{icon}</span>}
        <h3 className="font-semibold text-sm tracking-tight text-muted-foreground/90" style={{ color: sectionTitleColor || undefined }}>{title}</h3>
      </div>
      <div className="flex-1 space-y-3 overflow-auto pr-1" style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}>
        {items.map((item, index) => (
          <Card
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className="p-4 group relative cursor-grab active:cursor-grabbing shadow-sm border-0 rounded-2xl transition-all duration-300 overflow-visible hover:-translate-y-1 hover:shadow-lg"
            style={{ backgroundColor: item.color, color: item.textColor || "#000000" }}
            onClick={() => onEditItem(item)}
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-40 object-cover rounded-xl mb-3 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
              />
            )}
            <div className="font-semibold text-[15px] mb-2 whitespace-normal break-words leading-tight">{item.title}</div>
            {item.description && (
              <div className="text-[13px] opacity-80 whitespace-pre-wrap break-words leading-relaxed">{item.description}</div>
            )}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 bg-black/5 backdrop-blur-md rounded-full p-1">
              <div className="flex flex-row cursor-pointer rounded-full hover:bg-black/10 transition-colors p-1">
                <Pen className="h-[14px] w-[14px]" />
              </div>
            </div>
          </Card>
        ))}
        {!hideAddButton && (
          <Button
            variant="ghost"
            style={{ color: sectionTitleColor || undefined, borderColor: sectionTitleColor ? `${sectionTitleColor}40` : undefined }}
            className="w-full border border-dashed hover:border-border/80 hover:bg-accent/40 rounded-2xl py-6 transition-colors"
            onClick={onAddItem}
          >
            <Plus className="h-5 w-5 mr-2 opacity-70" />
            <span className="font-medium opacity-80">{t("addItem")}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

