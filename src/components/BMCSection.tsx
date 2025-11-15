import { Plus, Edit2, Trash2 } from "lucide-react";
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
  hideAddButton = false
  , icon
  , sectionTitleColor
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
    <div className="h-full flex flex-col border-2 border-border bg-card rounded-lg p-4">
        <div className="flex items-center gap-3 mb-5">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <h3 className="font-semibold text-sm text-muted-foreground" style={{ color: sectionTitleColor || undefined }}>{title}</h3>
      </div>
      <div className="flex-1 space-y-2 overflow-auto">
        {items.map((item, index) => (
          <Card 
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className="p-3 pb-3 group relative cursor-move hover:shadow-md transition-all overflow-visible"
            style={{ backgroundColor: item.color, color: item.textColor || "#000000" }}
            onClick={() => onEditItem(item)}
          >
            {item.imageUrl && (
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="w-full h-20 object-cover rounded mb-2"
              />
            )}
            <div className="font-medium text-sm mb-2 whitespace-normal break-words">{item.title}</div>
            {item.description && (
              <div className="text-xs opacity-80 whitespace-pre-wrap break-words mb-2">{item.description}</div>
            )}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                size="icon"
                variant="secondary"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditItem(item);
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteItem(item.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
        {!hideAddButton && (
          <Button
            variant="outline"
            className="w-full border-dashed hover:bg-accent/50"
            onClick={onAddItem}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("addItem")}
          </Button>
        )}
      </div>
    </div>
  );
};
