import { Plus, Edit2, Trash2, Pen } from "lucide-react";
import { ReactNode, useState } from "react";
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
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));

    if (dragIndex === dropIndex) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    onReorderItems(newItems);
  };

  return (
    <div className={`h-full flex flex-col border border-border/30 bg-white/40 dark:bg-black/10 backdrop-blur-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-[1.75rem] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-border/60 ${hideAddButton ? "p-3 pb-4" : "p-5"}`}>
      <div className={`flex items-center gap-3 px-1 ${hideAddButton ? "mb-3" : "mb-5"}`}>
        {icon && <span className="text-muted-foreground/80 transition-colors" style={{ color: sectionTitleColor || undefined }}>{icon}</span>}
        <h3 className="text-[14px] uppercase tracking-widest text-muted-foreground/90 transition-colors" style={{ color: sectionTitleColor || undefined }}>{title}</h3>
      </div>
      <div className={`flex-1 pr-1 ${hideAddButton ? "space-y-2 overflow-visible" : "space-y-3 overflow-auto"}`} style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}>
        {items.map((item, index) => (
          <Card
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            className={`group relative cursor-grab active:cursor-grabbing border-2 rounded-2xl transition-all duration-300 overflow-visible hover:-translate-y-1 hover:shadow-xl ${
              hideAddButton ? "p-3" : "p-4"
            } ${
              dragOverIndex === index 
                ? "border-primary scale-[1.03] ring-2 ring-primary/20" 
                : "border-black/5 dark:border-white/5 shadow-sm"
            }`}
            style={{ backgroundColor: item.color, color: item.textColor || "#000000" }}
            onClick={() => onEditItem(item)}
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-40 object-cover rounded-xl mb-3 shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-transform duration-300 group-hover:scale-[1.01]"
              />
            )}
            <div className={`text-[16px] whitespace-normal break-words leading-tight tracking-tight ${
              item.description ? (hideAddButton ? "mb-1.5" : "mb-2") : ""
            }`}>{item.title}</div>
            {item.description && (
              <div className="text-[12px] whitespace-pre-wrap break-words leading-relaxed opacity-75">{item.description}</div>
            )}
            
            {/* Quick edit / delete toolbar on hover */}
            <div 
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1.5 bg-black/10 dark:bg-black/40 backdrop-blur-md rounded-full p-1 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                title={t("editItem") || "Edit"}
                className="cursor-pointer rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors p-1"
                onClick={() => onEditItem(item)}
              >
                <Pen className="h-3.5 w-3.5" style={{ color: item.textColor || "#000000" }} />
              </button>
              <button 
                title={t("delete") || "Delete"}
                className="cursor-pointer rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors p-1"
                onClick={() => {
                  const confirmed = window.confirm(t("confirmDelete") || "Are you sure?");
                  if (confirmed) onDeleteItem(item.id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" style={{ color: item.textColor || "#000000" }} />
              </button>
            </div>
          </Card>
        ))}
        {!hideAddButton && (
          <Button
            variant="ghost"
            style={{ color: sectionTitleColor || undefined, borderColor: sectionTitleColor ? `${sectionTitleColor}30` : undefined }}
            className="w-full border border-dashed hover:border-border/80 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-2xl py-6 transition-colors shadow-none hover:shadow-sm"
            onClick={onAddItem}
          >
            <Plus className="h-5 w-5 mr-2 opacity-70" />
            <span className="font-bold opacity-80">{t("addItem")}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

