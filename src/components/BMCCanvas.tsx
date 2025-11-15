import { useState, useRef } from "react";
import { BMCSection, BMCItem } from "./BMCSection";
import { ItemDialog } from "./ItemDialog";
import { User, Activity, Star, Heart, Users, UserPlus, Tag, Wallet, Globe } from "lucide-react";
import { useI18n } from "@/i18n/i18n";

// Inline editable title component — accepts props so parent can control value
// Added titleColor prop to EditableTitle
const EditableTitle = ({
  title: propTitle,
  onTitleChange,
  titleColor,
}: {
  title?: string;
  onTitleChange?: (t: string) => void;
  titleColor?: string;
}) => {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const startEdit = () => {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const finishEdit = () => setEditing(false);

  const finishAndSave = (value: string) => {
    if (onTitleChange) onTitleChange(value);
    finishEdit();
  };

  const title = propTitle ?? t("clickToEditTitle");

  return (
    <div className="absolute top-5 left-6 z-20 p-5">
      {editing ? (
        <input
          ref={inputRef}
          defaultValue={title}
          onBlur={(e) => finishAndSave(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              finishAndSave((e.target as HTMLInputElement).value);
            }
          }}
          className="sm:w-[50vw] w-full bg-transparent border-none outline-none text-2xl md:text-3xl lg:text-4xl font-bold text-muted-foreground"
          style={{ color: titleColor || undefined }}
        />
      ) : (
        <h1
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-muted-foreground cursor-text max-w-[90vw]"
          onClick={startEdit}
          style={{ color: titleColor || undefined }}
        >
          {title}
        </h1>
      )}
    </div>
  );
};

interface BMCData {
  [key: string]: BMCItem[];
}

interface BMCCanvasProps {
  data: BMCData;
  onDataChange: (data: BMCData) => void;
  canvasColor: string;
  defaultItemColor: string;
  hideAddButton?: boolean;
  title?: string;
  onTitleChange?: (title: string) => void;
  titleColor?: string;
  sectionTitleColor?: string;
}

export const BMCCanvas = ({ data, onDataChange, canvasColor, defaultItemColor, hideAddButton = false, title, onTitleChange, titleColor, sectionTitleColor }: BMCCanvasProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<BMCItem | null>(null);
  const { t } = useI18n();

  const sections = [
    { id: "keyPartnerships", title: t("sec_keyPartnerships"), icon: <User className="h-5 w-5" /> },
    { id: "keyActivities", title: t("sec_keyActivities"), icon: <Activity className="h-5 w-5" /> },
    { id: "valueProposition", title: t("sec_valueProposition"), icon: <Star className="h-5 w-5" /> },
    { id: "customerRelationships", title: t("sec_customerRelationships"), icon: <Heart className="h-5 w-5" /> },
    { id: "customers", title: t("sec_customers"), icon: <Users className="h-5 w-5" /> },
    { id: "keyResources", title: t("sec_keyResources"), icon: <UserPlus className="h-5 w-5" /> },
    { id: "budgetCost", title: t("sec_budgetCost"), icon: <Tag className="h-5 w-5" /> },
    { id: "distributionChannels", title: t("sec_distributionChannels"), icon: <Globe className="h-5 w-5" /> },
    { id: "revenueStreams", title: t("sec_revenueStreams"), icon: <Wallet className="h-5 w-5" /> },
  ];

  const handleAddItem = (sectionId: string) => {
    setCurrentSection(sectionId); 
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEditItem = (sectionId: string, item: BMCItem) => {
    setCurrentSection(sectionId);
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    const newData = {
      ...data,
      [sectionId]: data[sectionId]?.filter((item) => item.id !== itemId) || [],
    };
    onDataChange(newData);
  };

  const handleReorderItems = (sectionId: string, items: BMCItem[]) => {
    const newData = {
      ...data,
      [sectionId]: items,
    };
    onDataChange(newData);
  };

  const handleSaveItem = (itemData: Partial<BMCItem>) => {
    if (!currentSection) return;

    const newData = { ...data };
    if (!newData[currentSection]) {
      newData[currentSection] = [];
    }

    if (editingItem) {
      // Edit existing item
      newData[currentSection] = newData[currentSection].map((item) =>
        item.id === editingItem.id ? { ...item, ...itemData } : item
      );
    } else {
      // Add new item
      const newItem: BMCItem = {
        id: Date.now().toString(),
        title: itemData.title || "",
        description: itemData.description || "",
        imageUrl: itemData.imageUrl,
          color: itemData.color || defaultItemColor,
          textColor: itemData.textColor || "#000000",
      };
      newData[currentSection].push(newItem);
    }

    onDataChange(newData);
  };

  return (
    <>
      <div
        style={{ backgroundColor: canvasColor }}
        className="pt-28 relative grid grid-cols-1 md:grid-cols-2a md:grid-cols-5 md:grid-rows-3 gap-4 sm:px-6 px-3 pb-6 rounded-xl shadow-lg"
      >
        {/* Editable canvas title (click to edit) - fixed top-left H1 */}
        <EditableTitle title={title} onTitleChange={onTitleChange} titleColor={titleColor} />
        {/* Left tall: 5. Key Partnerships (col1, row 1-2) */}
        <div className="col-span-1 md:col-start-1 md:row-start-1 md:row-span-2 min-h-[250px] md:min-h-[520px]">
          <BMCSection
            title={sections[0].title}
            icon={sections[0].icon}
            items={data[sections[0].id] || []}
            onAddItem={() => handleAddItem(sections[0].id)}
            onEditItem={(item) => handleEditItem(sections[0].id, item)}
            onDeleteItem={(id) => handleDeleteItem(sections[0].id, id)}
            onReorderItems={(items) => handleReorderItems(sections[0].id, items)}
            defaultColor={defaultItemColor}
            hideAddButton={hideAddButton}
            sectionTitleColor={sectionTitleColor}
          />
        </div>
        {/* Col 2 top: 6. Key Activities */}
        <div className="col-span-1 md:col-start-2 md:row-start-1 min-h-[200px] md:min-h-[250px]">
          <BMCSection
            title={sections[1].title}
            icon={sections[1].icon}
            items={data[sections[1].id] || []}
            onAddItem={() => handleAddItem(sections[1].id)}
            onEditItem={(item) => handleEditItem(sections[1].id, item)}
            onDeleteItem={(id) => handleDeleteItem(sections[1].id, id)}
            onReorderItems={(items) => handleReorderItems(sections[1].id, items)}
            defaultColor={defaultItemColor}
            hideAddButton={hideAddButton}
            sectionTitleColor={sectionTitleColor}
          />
        </div>

        {/* Col 2 bottom: 7. Key Resources */}
        <div className="col-span-1 md:col-start-2 md:row-start-2 min-h-[200px] md:min-h-[250px]">
          <BMCSection
            title={sections[5].title}
            icon={sections[5].icon}
            items={data[sections[5].id] || []}
            onAddItem={() => handleAddItem(sections[5].id)}
            onEditItem={(item) => handleEditItem(sections[5].id, item)}
            onDeleteItem={(id) => handleDeleteItem(sections[5].id, id)}
            onReorderItems={(items) => handleReorderItems(sections[5].id, items)}
            defaultColor={defaultItemColor}
            hideAddButton={hideAddButton}
            sectionTitleColor={sectionTitleColor}
          />
        </div>

        {/* Center tall: 1. Value Proposition (col3, rows 1-2) */}
        <div className="col-span-1 md:col-start-3 md:row-start-1 md:row-span-2 min-h-[250px] md:min-h-[520px]">
          <BMCSection
            title={sections[2].title}
            icon={sections[2].icon}
            items={data[sections[2].id] || []}
            onAddItem={() => handleAddItem(sections[2].id)}
            onEditItem={(item) => handleEditItem(sections[2].id, item)}
            onDeleteItem={(id) => handleDeleteItem(sections[2].id, id)}
            onReorderItems={(items) => handleReorderItems(sections[2].id, items)}
            defaultColor={defaultItemColor}
            hideAddButton={hideAddButton}
            sectionTitleColor={sectionTitleColor}
          />
        </div>

        {/* Col 4 top: 3. Customer Relationships */}
        <div className="col-span-1 md:col-start-4 md:row-start-1 min-h-[200px] md:min-h-[250px]">
          <BMCSection
            title={sections[3].title}
            icon={sections[3].icon}
            items={data[sections[3].id] || []}
            onAddItem={() => handleAddItem(sections[3].id)}
            onEditItem={(item) => handleEditItem(sections[3].id, item)}
            onDeleteItem={(id) => handleDeleteItem(sections[3].id, id)}
            onReorderItems={(items) => handleReorderItems(sections[3].id, items)}
            defaultColor={defaultItemColor}
            hideAddButton={hideAddButton}
            sectionTitleColor={sectionTitleColor}
          />
        </div>

        {/* Col 4 bottom: 4. Distribution Channels */}
        <div className="col-span-1 md:col-start-4 md:row-start-2 min-h-[200px] md:min-h-[250px]">
          <BMCSection
            title={sections[7].title}
            icon={sections[7].icon}
            items={data[sections[7].id] || []}
            onAddItem={() => handleAddItem(sections[7].id)}
            onEditItem={(item) => handleEditItem(sections[7].id, item)}
            onDeleteItem={(id) => handleDeleteItem(sections[7].id, id)}
            onReorderItems={(items) => handleReorderItems(sections[7].id, items)}
            defaultColor={defaultItemColor}
            hideAddButton={hideAddButton}
            sectionTitleColor={sectionTitleColor}
          />
        </div>

        {/* Right tall: 2. Customers (col5, rows 1-2) */}
        <div className="col-span-1 md:col-start-5 md:row-start-1 md:row-span-2 min-h-[250px] md:min-h-[520px]">
          <BMCSection
            title={sections[4].title}
            icon={sections[4].icon}
            items={data[sections[4].id] || []}
            onAddItem={() => handleAddItem(sections[4].id)}
            onEditItem={(item) => handleEditItem(sections[4].id, item)}
            onDeleteItem={(id) => handleDeleteItem(sections[4].id, id)}
            onReorderItems={(items) => handleReorderItems(sections[4].id, items)}
            defaultColor={defaultItemColor}
            hideAddButton={hideAddButton}
            sectionTitleColor={sectionTitleColor}
          />
        </div>

        {/* Bottom left: 8. Budget Cost (col1-2) */}
        <div className="col-span-1 md:col-span-2 md:col-start-1 md:row-start-3 min-h-[160px] md:min-h-[200px]">
          <BMCSection
            title={sections[6].title}
            icon={sections[6].icon}
            items={data[sections[6].id] || []}
            onAddItem={() => handleAddItem(sections[6].id)}
            onEditItem={(item) => handleEditItem(sections[6].id, item)}
            onDeleteItem={(id) => handleDeleteItem(sections[6].id, id)}
            onReorderItems={(items) => handleReorderItems(sections[6].id, items)}
            defaultColor={defaultItemColor}
            hideAddButton={hideAddButton}
            sectionTitleColor={sectionTitleColor}
          />
        </div>

        {/* Bottom right: 9. Revenue Streams (col3-5) */}
        <div className="col-span-1 md:col-span-3 md:col-start-3 md:row-start-3 min-h-[160px] md:min-h-[200px]">
          <BMCSection
            title={sections[8].title}
            icon={sections[8].icon}
            items={data[sections[8].id] || []}
            onAddItem={() => handleAddItem(sections[8].id)}
            onEditItem={(item) => handleEditItem(sections[8].id, item)}
            onDeleteItem={(id) => handleDeleteItem(sections[8].id, id)}
            onReorderItems={(items) => handleReorderItems(sections[8].id, items)}
            defaultColor={defaultItemColor}
            hideAddButton={hideAddButton}
            sectionTitleColor={sectionTitleColor}
          />
        </div>
      </div>

      <ItemDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveItem}
        onDelete={(id: string) => {
          if (!currentSection) return;
          handleDeleteItem(currentSection, id);
        }}
        item={editingItem}
        defaultColor={defaultItemColor}
      />
    </>
  );
};
