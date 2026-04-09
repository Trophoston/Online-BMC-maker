import { color } from "html2canvas/dist/types/css/types/color";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Lang = "en" | "th";

const STORAGE_KEY = "bmc_lang";

const translations: Record<Lang, Record<string, string>> = {
  en: {
    title: "BMC MAKER",
    subtitle: "Create and export your Business Model Canvas",
    exportJSON: "Export JSON",
    importJSON: "Import JSON",
    shareLink: "Share Link",
    saveAsPDF: "Save as PDF",
    saveAsPNG: "Save as PNG",
    colors: "Colors",
    canvasColor: "Canvas Color",
    itemColor: "Default Item Color",
    titleColor: "Canvas Title Color",
    sectionTitleColor: "Section Title Color",
    createdBy: "Created by",
    newCanvas: "New Canvas",
    clear: "Clear",
    canvasExportedJSON: "Canvas exported as JSON",
    canvasExportedPDF: "Canvas exported as PDF",
    canvasExportedPNG: "Canvas exported as PNG",
    canvasImported: "Canvas imported successfully",
    sharedCanvasLoaded: "Shared canvas loaded", 
    sharedCanvasLoadedImagesRemoved: "Shared canvas loaded - images were removed from the shared link to keep the URL short.", 
    shareLinkCopied: "Share link successfully",
    shareLinkCopiedImagesRemoved: "Share link successfully — images were removed from the shared link to keep the URL short.",
    failedShare: "Failed to create share link",
    canvasCleared: "Canvas cleared",
    noPersistenceWarning: "Note: this site will not save your work if you leave the page.",
    generatingPDF: "Generating PDF...",
    generatingPNG: "Generating PNG...",
    openedNewCanvas: "Opened new canvas in a new tab",
    clickToEditTitle: "Click to edit title",
    sec_keyPartnerships: "5. Key Partnerships",
    sec_keyActivities: "6. Key Activities",
    sec_valueProposition: "1. Value Proposition",
    sec_customerRelationships: "3. Customer Relationships",
    sec_customers: "2. Customers",
    sec_keyResources: "7. Key Resources",
    sec_budgetCost: "8. Budget Cost",
    sec_distributionChannels: "4. Distribution Channels",
    sec_revenueStreams: "9. Revenue Streams",
    addItem: "Add Item",
    editItem: "Edit Item",
    addNewItem: "Add New Item",
    field_title: "Title",
    field_description: "Description",
    placeholder_title: "Enter title...",
    placeholder_description: "Enter description...",
    uploadFile: "Upload File",
    urlLabel: "URL",
    pasteLabel: "Paste",
    enterImageUrl: "Enter image URL...",
    backgroundColor: "Background Color",
    textColor: "Text Color",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this item?",
    // if this color setting is not applied correctly try scroll down
    colorPickerScrollHint: "if this color setting is not applied correctly try scroll down",
    alert_theme_title: "Apply Theme to Items?",
    alert_theme_desc: "This will overwrite the individual colors of all current items to match the theme. This action cannot be undone.",
    alert_theme_action: "Apply to All",
    alert_import_title: "Import Canvas?",
    alert_import_desc: "How would you like to open this Business Model Canvas? You can replace your current one or open it in a new tab to keep both.",
    alert_import_replace: "Replace Current",
    alert_import_newtab: "Open in New Tab",
    alert_dl_title: "Download Again?",
    alert_dl_desc: "You have already downloaded \"{{filename}}\". Do you want to download it again?",
    alert_dl_action: "Download Again",
    credit_text: "Created with Online BMC Maker by trophoston",
  },
  th: {
    title: "สร้าง BMC",
    subtitle: "สร้างและส่งออก Business Model Canvas ของคุณ",
    exportJSON: "ส่งออก JSON",
    importJSON: "นำเข้า JSON",
    shareLink: "แชร์",
    saveAsPDF: "บันทึกเป็น PDF",
    saveAsPNG: "บันทึกเป็น PNG",
    colors: "สี",
    canvasColor: "สีพื้นหลัง",
    itemColor: "สีไอเท็มเริ่มต้น",
    titleColor: "สีหัวเรื่องแคนวาส",
    sectionTitleColor: "สีหัวเรื่องส่วน",
    createdBy: "สร้างโดย",
    newCanvas: "แผ่นใหม่",
    clear: "ล้าง",
    canvasExportedJSON: "ส่งออกแคนวาสเป็น JSON แล้ว",
    canvasExportedPDF: "ส่งออกแคนวาสเป็น PDF แล้ว",
    canvasExportedPNG: "ส่งออกแคนวาสเป็น PNG แล้ว",
    canvasImported: "นำเข้าแคนวาสเรียบร้อยแล้ว",
    sharedCanvasLoaded: "โหลดแคนวาสที่แชร์แล้ว",
    sharedCanvasLoadedImagesRemoved: "โหลดแคนวาสที่แชร์แล้ว — รูปภาพถูกตัดออกเพื่อให้ลิงก์สั้นลง.",
    shareLinkCopied: "แชร์แล้ว",
    shareLinkCopiedImagesRemoved: "แชร์แล้ว — รูปภาพถูกตัดออกเพื่อให้ลิงก์สั้นลง",
    failedShare: "สร้างลิงก์แชร์ไม่สำเร็จ",
    canvasCleared: "ล้างแคนวาสเรียบร้อยแล้ว",
    noPersistenceWarning: "หมายเหตุ: เว็บไซต์นี้จะไม่บันทึกงานของคุณหากคุณออกจากหน้า",
    generatingPDF: "กำลังสร้าง PDF...",
    generatingPNG: "กำลังสร้าง PNG...",
    openedNewCanvas: "เปิดแผ่นใหม่ในแท็บใหม่แล้ว",
    clickToEditTitle: "คลิกเพื่อแก้ไขชื่อ",
    sec_keyPartnerships: "5. หุ้นส่วนสำคัญ",
    sec_keyActivities: "6. กิจกรรมหลัก",
    sec_valueProposition: "1. ข้อเสนอคุณค่า",
    sec_customerRelationships: "3. ความสัมพันธ์กับลูกค้า",
    sec_customers: "2. ลูกค้า",
    sec_keyResources: "7. ทรัพยากรหลัก",
    sec_budgetCost: "8. ต้นทุน",
    sec_distributionChannels: "4. ช่องทางจัดจำหน่าย",
    sec_revenueStreams: "9. กระแสรายได้",
    addItem: "เพิ่มไอเท็ม",
    editItem: "แก้ไขไอเท็ม",
    addNewItem: "เพิ่มไอเท็มใหม่",
    field_title: "หัวข้อ",
    field_description: "คำอธิบาย",
    placeholder_title: "กรอกหัวข้อ...",
    placeholder_description: "กรอกคำอธิบาย...",
    uploadFile: "อัปโหลดไฟล์",
    urlLabel: "URL",
    pasteLabel: "วาง",
    enterImageUrl: "กรอก URL รูปภาพ...",
    backgroundColor: "สีพื้นหลัง",
    textColor: "สีข้อความ",
    cancel: "ยกเลิก",
    save: "บันทึก",
    delete: "ลบ",
    confirmDelete: "คุณแน่ใจหรือไม่ว่าต้องการลบไอเท็มนี้?",
    colorPickerScrollHint: "หากหน้าการตั้งค่าสีนี้ผิดปกติ ลองเลื่อนลง",
    alert_theme_title: "ใช้ธีมกับไอเท็มทั้งหมด?",
    alert_theme_desc: "การดำเนินการนี้จะเปลี่ยนสีของไอเท็มทั้งหมดให้ตรงกับธีม ซึ่งไม่สามารถย้อนกลับได้",
    alert_theme_action: "ใช้กับทั้งหมด",
    alert_import_title: "นำเข้าแคนวาส?",
    alert_import_desc: "คุณต้องการเปิด Business Model Canvas นี้อย่างไร? คุณสามารถแทนที่อันปัจจุบัน หรือเปิดในแท็บใหม่เพื่อเก็บไว้ทั้งสองอย่าง",
    alert_import_replace: "แทนที่อันปัจจุบัน",
    alert_import_newtab: "เปิดในแท็บใหม่",
    alert_dl_title: "ดาวน์โหลดอีกครั้ง?",
    alert_dl_desc: "คุณได้ดาวน์โหลด \"{{filename}}\" ไปแล้ว คุณต้องการดาวน์โหลดอีกครั้งหรือไม่?",
    alert_dl_action: "ดาวน์โหลดอีกครั้ง",
    credit_text: "สร้างโดย Online BMC Maker โดย trophoston",
  },
};

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangRaw] = useState<Lang>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "th") return "th";
    } catch (e) {
      // ignore
    }
    return "en";
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      // ignore
    }
  }, [lang]);

  const setLang = (l: Lang) => setLangRaw(l);

  const t = useMemo(() => {
    return (key: string) => {
      return translations[lang][key] ?? key;
    };
  }, [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};

export default I18nProvider;
