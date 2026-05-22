import { useState, useRef, useEffect } from "react";
import { BMCCanvas } from "@/components/BMCCanvas";
import { ImportDialog } from "@/components/ImportDialog";
import { Toolbar } from "@/components/Toolbar";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { useI18n } from "@/i18n/i18n";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const { t } = useI18n();

  // Try to load draft from localStorage if not loading a shared URL
  const draftData = (() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    if (params.get("bmc")) return null;
    try {
      const draft = localStorage.getItem("bmc_draft");
      return draft ? JSON.parse(draft) : null;
    } catch (e) {
      return null;
    }
  })();

  const [bmcData, setBmcData] = useState(draftData?.data || {});
  const [canvasTitle, setCanvasTitle] = useState<string>(draftData?.title || "");
  const [canvasColor, setCanvasColor] = useState(draftData?.canvasColor || "#f5f3ed");
  const [defaultItemColor, setDefaultItemColor] = useState(draftData?.defaultItemColor || "#4285F4");
  const [defaultTextColor, setDefaultTextColor] = useState(draftData?.defaultTextColor || "#000000");
  const [titleColor, setTitleColor] = useState<string>(draftData?.titleColor || "#1f2937");
  const [sectionTitleColor, setSectionTitleColor] = useState<string>(draftData?.sectionTitleColor || "#374151");
  const [hideAddButton, setHideAddButton] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Save draft to localStorage whenever relevant state changes
  useEffect(() => {
    try {
      const draft = {
        data: bmcData,
        title: canvasTitle,
        canvasColor,
        defaultItemColor,
        defaultTextColor,
        titleColor,
        sectionTitleColor
      };
      localStorage.setItem("bmc_draft", JSON.stringify(draft));
    } catch (e) {
      console.error("Failed to save draft to localStorage", e);
    }
  }, [bmcData, canvasTitle, canvasColor, defaultItemColor, defaultTextColor, titleColor, sectionTitleColor]);

  // AlertDialog state management
  const [alertConfig, setAlertConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    cancelLabel?: string;
    actionLabel?: string;
    secondaryActionLabel?: string;
    onAction: () => void;
    onSecondaryAction?: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onAction: () => {},
  });

  const showAlert = (config: Omit<typeof alertConfig, "open">) => {
    setAlertConfig({ ...config, open: true });
  };

  const downloadFile = (blob: Blob, filename: string, toastMsg: string) => {
    const performDownload = () => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(toastMsg);
      localStorage.setItem(`downloaded_${filename}`, "true");
    };

    if (localStorage.getItem(`downloaded_${filename}`)) {
      showAlert({
        title: t("alert_dl_title"),
        description: t("alert_dl_desc").replace("{{filename}}", filename),
        actionLabel: t("alert_dl_action"),
        onAction: performDownload,
      });
    } else {
      performDownload();
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ data: bmcData, canvasColor, defaultItemColor, defaultTextColor, title: canvasTitle, titleColor, sectionTitleColor }, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    downloadFile(dataBlob, "bmc-canvas.json", t("canvasExportedJSON"));
  };

  const llmTemplateInstructions = `{
  "description": "Generate a Business Model Canvas JSON using the exact top-level structure below.",
  "title": "Your Generated Business Name",
  "canvasColor": "#f5f3ed",
  "defaultItemColor": "#9dc8ac",
  "titleColor": "#1f2937",
  "sectionTitleColor": "#374151",
  "data": {
    "keyPartnerships": [],
    "keyActivities": [],
    "valueProposition": [],
    "customerRelationships": [],
    "customers": [],
    "keyResources": [],
    "budgetCost": [],
    "distributionChannels": [],
    "revenueStreams": []
  },
  "note": "Fill each array in 'data' with items like: { \\"id\\": \\"1\\", \\"title\\": \\"Item Name\\", \\"description\\": \\"Details\\", \\"color\\": \\"#9dc8ac\\", \\"textColor\\": \\"#000000\\" }."
}`;

  const handleDownloadTemplate = () => {
    const dataBlob = new Blob([llmTemplateInstructions], { type: "application/json" });
    downloadFile(dataBlob, "llm-bmc-template.json", "LLM Template JSON downloaded");
  };

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(llmTemplateInstructions);
      toast.success("LLM Template JSON copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy LLM Template");
    }
  };

  // Wait for fonts, images, and layout to settle on an element before capturing.
  const waitForRender = async (el: HTMLElement) => {
    try {
      if ((document as any).fonts && (document as any).fonts.ready) {
        await (document as any).fonts.ready;
      }
    } catch (e) {
      // ignore
    }

    // Wait for images inside element to load
    const imgs = Array.from(el.querySelectorAll("img")) as HTMLImageElement[];
    if (imgs.length) {
      await new Promise((resolve) => {
        let remaining = imgs.length;
        imgs.forEach((img) => {
          if (img.complete) {
            remaining -= 1;
            if (remaining === 0) resolve(null);
          } else {
            const onFinish = () => {
              img.removeEventListener("load", onFinish);
              img.removeEventListener("error", onFinish);
              remaining -= 1;
              if (remaining === 0) resolve(null);
            };
            img.addEventListener("load", onFinish);
            img.addEventListener("error", onFinish);
          }
        });
        if (imgs.length === 0) resolve(null);
      });
    }

    // wait a couple animation frames to let layout settle
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    // small timeout to be extra-safe
    await new Promise((r) => setTimeout(r, 30));
  };

  const handleImportJSON = (data: any) => {
    if (!data.data) return;

    const applyImport = () => {
      setBmcData(data.data);
      if (data.canvasColor) setCanvasColor(data.canvasColor);
      if (data.defaultItemColor) setDefaultItemColor(data.defaultItemColor);
      if (data.defaultTextColor) setDefaultTextColor(data.defaultTextColor);
      if (data.title) setCanvasTitle(data.title);
      if (data.titleColor) setTitleColor(data.titleColor);
      if (data.sectionTitleColor) setSectionTitleColor(data.sectionTitleColor);
      toast.success(t("canvasImported"));
    };

    showAlert({
      title: t("alert_import_title"),
      description: t("alert_import_desc"),
      actionLabel: t("alert_import_replace"),
      secondaryActionLabel: t("alert_import_newtab"),
      onAction: applyImport,
      onSecondaryAction: () => {
        const json = JSON.stringify(data);
        const base64 = typeof window === "undefined" ? Buffer.from(json).toString("base64") : btoa(unescape(encodeURIComponent(json)));
        const url = `${window.location.origin}${window.location.pathname}?bmc=${encodeURIComponent(base64)}`;
        window.open(url, "_blank");
      }
    });
  };

  // On mount, check for shared `bmc` query param and load it if present
  useEffect(() => {
    try {
      const hasSeenPopup = localStorage.getItem("bmcUpdatePopupSeen_v3");
      if (!hasSeenPopup) {
        setShowUpdatePopup(true);
      }

      const params = new URLSearchParams(window.location.search);
      const encoded = params.get("bmc");
      if (encoded) {
        // decode base64 payload
        let json = "";
        try {
          const decoded = atob(decodeURIComponent(encoded));
          // decoded is UTF-8 percent-encoded sometimes; attempt to decode
          json = decodeURIComponent(escape(decoded));
        } catch (e) {
          try {
            // fallback simpler decode
            json = decodeURIComponent(escape(atob(encoded)));
          } catch (err) {
            json = atob(encoded);
          }
        }

        const data = JSON.parse(json);
        if (data) {
          if (data.data) setBmcData(data.data);
          if (data.canvasColor) setCanvasColor(data.canvasColor);
          if (data.defaultItemColor) setDefaultItemColor(data.defaultItemColor);
          if (data.defaultTextColor) setDefaultTextColor(data.defaultTextColor);
          if (data.title) setCanvasTitle(data.title);
          if (data.titleColor) setTitleColor(data.titleColor);
          if (data.sectionTitleColor) setSectionTitleColor(data.sectionTitleColor);

          const id = `toast-shared-load-${Date.now()}`;
          let successMsg = t("sharedCanvasLoaded");
          if (data.imagesRemoved) {
            successMsg = t("sharedCanvasLoadedImagesRemoved");
          }
          toast.success(successMsg, { id });
        }
        return; // stop: we loaded from shared link
      }
      // Draft is autosaved to localStorage
    } catch (e) {
      // ignore
    }
  }, []);

  // No autosave: users are warned on load that data won't persist if they leave the page.

  const handleShareLink = async () => {
    try {
      // Prepare payload but strip out image URLs to keep the link small
      let imagesRemoved = false;
      const cleanedData: any = {};
      Object.keys(bmcData).forEach((sectionId) => {
        const items = (bmcData as any)[sectionId] || [];
        cleanedData[sectionId] = items.map((it: any) => {
          if (it.imageUrl) imagesRemoved = true;
          const { imageUrl, ...rest } = it;
          return rest;
        });
      });
      const payload = { data: cleanedData, canvasColor, defaultItemColor, defaultTextColor, title: canvasTitle, titleColor, sectionTitleColor, imagesRemoved };
      const json = JSON.stringify(payload);
      // base64 encode the json safely
      const base64 = typeof window === "undefined" ? Buffer.from(json).toString("base64") : btoa(unescape(encodeURIComponent(json)));
      const url = `${window.location.origin}${window.location.pathname}?bmc=${encodeURIComponent(base64)}`;

      // Prefer native share on supporting mobile browsers
      if ((navigator as any).share) {
        try {
          await (navigator as any).share({ title: canvasTitle || t("title"), text: canvasTitle || "", url });
          // show a small confirmation; clipboard is optional since native share delivered the link
          console.log('url', url);

          if (imagesRemoved) {
            toast.success(t("shareLinkCopiedImagesRemoved"));
          } else {
            toast.success(t("shareLinkCopied"));
          }
          return url;
        } catch (err) {
          // share rejected / failed (user cancelled or platform error) — fall back to clipboard below
        }
      }

      // Fallback: copy to clipboard and return URL
      await navigator.clipboard.writeText(url);
      console.log('url', url);
      if (url.includes("imagesRemoved=true")) {
        toast.success(t("shareLinkCopiedImagesRemoved"));
      } else {
        toast.success(t("shareLinkCopied"));
      }
      return url;


    } catch (err) {
      console.error(err);
      const id = `toast-share-fail-${Date.now()}`;
      toast.error(t("failedShare"));
    }
  };

  const handleApplyThemeToItems = (themeColors: { item: string, text: string }) => {
    const performThemeApply = () => {
      const newData = { ...bmcData } as any;
      Object.keys(newData).forEach((section) => {
        if (Array.isArray(newData[section])) {
          newData[section] = newData[section].map((item: any) => ({
            ...item,
            color: themeColors.item,
            textColor: themeColors.text
          }));
        }
      });
      setBmcData(newData);
      toast.success("Theme applied to all items");
    };

    showAlert({
      title: t("alert_theme_title"),
      description: t("alert_theme_desc"),
      actionLabel: t("alert_theme_action"),
      onAction: performThemeApply,
    });
  };

  const handleExportPDF = async () => {
    if (!canvasRef.current) return;

    setHideAddButton(true);
    const loadingId = toast.loading(t("generatingPDF"));

    // Wait for state to update
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const targetEl = canvasRef.current;
      await waitForRender(targetEl);

      const canvas = await html2canvas(targetEl, {
        scale: 2,
        windowWidth: 1400,
        backgroundColor: canvasColor,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      const pdfBlob = pdf.output("blob");
      
      downloadFile(pdfBlob, "bmc-canvas.pdf", t("canvasExportedPDF") || "Canvas exported as PDF");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF");
    } finally {
      setHideAddButton(false);
      toast.dismiss(loadingId);
    }
  };

  const handleExportPNG = async () => {
    if (!canvasRef.current) return;

    setHideAddButton(true);
    const loadingId = toast.loading(t("generatingPNG"));

    // Wait for state to update
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const targetEl = canvasRef.current;
      await waitForRender(targetEl);

      const canvas = await html2canvas(targetEl, {
        scale: 2,
        windowWidth: 1400,
        backgroundColor: canvasColor,
      });

      await new Promise<void>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            downloadFile(blob, "bmc-canvas.png", t("canvasExportedPNG") || "Canvas exported as PNG");
            resolve();
          } else {
            reject(new Error("Failed to generate PNG blob"));
          }
        });
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PNG");
    } finally {
      setHideAddButton(false);
      toast.dismiss(loadingId);
    }
  };

  return (
    <div className="min-h-screen bg-background sm:p-8 py-8 px-2">
      <div className="max-w-[1800px] mx-auto space-y-6">


        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-foreground mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Toolbar
          onExportJSON={handleExportJSON}
          onImportClick={() => setIsImportOpen(true)}
          onShareLink={handleShareLink}
          onExportPDF={handleExportPDF}
          onExportPNG={handleExportPNG}
          onDownloadTemplate={handleDownloadTemplate}
          onCopyTemplate={handleCopyTemplate}
          canvasColor={canvasColor}
          onCanvasColorChange={setCanvasColor}
          itemColor={defaultItemColor}
          onItemColorChange={setDefaultItemColor}
          textColor={defaultTextColor}
          onTextColorChange={setDefaultTextColor}
          titleColor={titleColor}
          onTitleColorChange={setTitleColor}
          sectionTitleColor={sectionTitleColor}
          onSectionTitleColorChange={setSectionTitleColor}
          onApplyThemeToItems={handleApplyThemeToItems}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => {
              const url = `${window.location.origin}${window.location.pathname}`;
              window.open(url, "_blank");
              toast.success(t("openedNewCanvas"));
            }}
          ><Plus className="h-4 w-4 " />
            {t("newCanvas")}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              showAlert({
                title: t("clear") || "Clear Canvas",
                description: t("confirmDelete") || "Are you sure you want to clear the canvas?",
                actionLabel: t("clear") || "Clear",
                onAction: () => {
                  setBmcData({});
                  setCanvasTitle("");
                  try {
                    localStorage.removeItem("bmc_draft");
                  } catch (e) {}
                  const params = new URLSearchParams(window.location.search);
                  if (params.get("bmc")) {
                    window.history.replaceState({}, document.title, window.location.pathname);
                  }
                  toast.success(t("canvasCleared"));
                }
              });
            }}
          >
            {t("clear")}
          </Button>
        </div>

        <div 
          ref={canvasRef}
          className={`rounded-[2.5rem] transition-all duration-100 ${hideAddButton ? "shadow-[0_12px_40px_rgba(0,0,0,0.08)]" : "overflow-hidden"}`}
          style={{
            padding: hideAddButton ? "24px" : "0px",
            width: hideAddButton ? "1400px" : "100%",
            backgroundColor: hideAddButton ? canvasColor : "transparent"
          }}
        >
          <BMCCanvas
            data={bmcData}
            onDataChange={setBmcData}
            canvasColor={canvasColor}
            defaultItemColor={defaultItemColor}
            defaultTextColor={defaultTextColor}
            hideAddButton={hideAddButton}
            title={canvasTitle}
            onTitleChange={setCanvasTitle}
            titleColor={titleColor}
            sectionTitleColor={sectionTitleColor}
          />
          <div className="mt-4 text-right px-8 pb-4">
             <a 
              href="https://github.com/trophoston" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[11px] font-medium opacity-40 hover:opacity-80 transition-opacity"
              style={{ color: sectionTitleColor || 'inherit' }}
            >
              {t("credit_text")}
            </a>
          </div>
        </div>
      </div>

      <AlertDialog open={showUpdatePopup} onOpenChange={setShowUpdatePopup}>
        <AlertDialogContent className="rounded-3xl border border-border/40 shadow-xl max-w-sm sm:max-w-md bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-center text-foreground">Welcome to the New Update!</AlertDialogTitle>
            <AlertDialogDescription className="text-sm mt-3 text-center text-muted-foreground leading-relaxed whitespace-pre-wrap">
              • Apple-style Alert System
              • Fresh Apple Bento-style UI
              • LLM Integration Templates
              • Beautiful PDF/PNG Exports
              • Unified Share Menu
              • Custom Themes & Color History
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 sm:justify-center">
            <AlertDialogAction onClick={() => {
                localStorage.setItem("bmcUpdatePopupSeen_v3_alert", "true");
                setShowUpdatePopup(false);
              }}
              className="rounded-xl px-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Get Started
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={alertConfig.open} onOpenChange={(o) => setAlertConfig(prev => ({ ...prev, open: o }))}>
        <AlertDialogContent className="rounded-[2rem] border border-border/40 shadow-2xl max-w-[400px] p-8 bg-white/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold tracking-tight text-center">{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base mt-2 text-muted-foreground leading-relaxed">
              {alertConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 mt-6">
             <AlertDialogAction 
              onClick={alertConfig.onAction}
              className="rounded-2xl py-6 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {alertConfig.actionLabel || "Continue"}
            </AlertDialogAction>
            
            {alertConfig.secondaryActionLabel && (
               <Button 
                variant="outline" 
                onClick={() => {
                  alertConfig.onSecondaryAction?.();
                  setAlertConfig(prev => ({ ...prev, open: false }));
                }}
                className="rounded-2xl py-6 text-base font-medium border-border/60 hover:bg-accent/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {alertConfig.secondaryActionLabel}
              </Button>
            )}

            <Button 
              variant="ghost" 
              onClick={() => setAlertConfig(prev => ({ ...prev, open: false }))}
              className="rounded-2xl py-6 text-base font-medium text-muted-foreground hover:text-foreground transition-all"
            >
              {alertConfig.cancelLabel || "Cancel"}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <ImportDialog open={isImportOpen} onClose={() => setIsImportOpen(false)} onImport={handleImportJSON} />
    </div>
  );
};

export default Index;
