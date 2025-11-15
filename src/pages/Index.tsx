import { useState, useRef, useEffect } from "react";
import { BMCCanvas } from "@/components/BMCCanvas";
import { Toolbar } from "@/components/Toolbar";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { useI18n } from "@/i18n/i18n";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const { t } = useI18n();
  const [bmcData, setBmcData] = useState({});
  const [canvasTitle, setCanvasTitle] = useState<string>(t("clickToEditTitle"));
  const [canvasColor, setCanvasColor] = useState("#f5f3ed");
  const [defaultItemColor, setDefaultItemColor] = useState("#9dc8ac");
  const [titleColor, setTitleColor] = useState<string>("#1f2937");
  const [sectionTitleColor, setSectionTitleColor] = useState<string>("#374151");
  const [hideAddButton, setHideAddButton] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ data: bmcData, canvasColor, defaultItemColor, title: canvasTitle }, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bmc-canvas.json";
    link.click();
    URL.revokeObjectURL(url);

    toast.success(t("canvasExportedJSON"));
  };

  // Create a hidden desktop-styled clone of the canvas so exports on mobile
  // capture the desktop (lg) layout regardless of current viewport.
  const createDesktopClone = (el: HTMLDivElement) => {
    const clone = el.cloneNode(true) as HTMLDivElement;

    // Remove responsive prefixes so Tailwind utility classes apply as desktop styles
    const stripPrefixes = (cls = "") => cls.replace(/\b(?:sm:|md:|lg:|xl:|2xl:)/g, "");

    // Clean classes for root and children
    clone.className = stripPrefixes(clone.className) + " grid-cols-5 grid-rows-3";
    clone.querySelectorAll("*").forEach((n) => {
      if (n instanceof HTMLElement) {
        n.className = stripPrefixes(n.className);
      }
    });

    // Force desktop width and make it offscreen so it doesn't flash
    clone.style.position = "fixed";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.width = "1200px";
    clone.style.paddingBottom = "40px";

    document.body.appendChild(clone);
    return clone;
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
    if (data.data) {
      setBmcData(data.data);
      if (data.canvasColor) setCanvasColor(data.canvasColor);
      if (data.defaultItemColor) setDefaultItemColor(data.defaultItemColor);
      if (data.title) setCanvasTitle(data.title);

      toast.success(t("canvasImported"));
    }
  };

  // On mount, check for shared `bmc` query param and load it if present
  useEffect(() => {
    try {
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
          if (data.title) setCanvasTitle(data.title);

          const id = `toast-shared-load-${Date.now()}`;
          let successMsg = t("sharedCanvasLoaded");
          if (data.imagesRemoved) {
            successMsg = t("shareLinkCopiedImagesRemoved");
          }
          toast.success(successMsg, { id });
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

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

      const payload = { data: cleanedData, canvasColor, defaultItemColor, title: canvasTitle, imagesRemoved };
      const json = JSON.stringify(payload);
      // base64 encode the json safely
      const base64 = typeof window === "undefined" ? Buffer.from(json).toString("base64") : btoa(unescape(encodeURIComponent(json)));
      const url = `${window.location.origin}${window.location.pathname}?bmc=${encodeURIComponent(base64)}`;

      await navigator.clipboard.writeText(url);



      // Note: toolbar will show the simple "Share link copied" toast; only surface the images-removed
      // condition as a success so it's shown alongside the copy confirmation.
      if (imagesRemoved) {
        toast.success(t("shareLinkCopiedImagesRemoved"));
      } else {
        return url;
      }


    } catch (err) {
      console.error(err);
      const id = `toast-share-fail-${Date.now()}`;
      toast.error(t("failedShare"));
    }
  };

  const handleExportPDF = async () => {
    if (!canvasRef.current) return;

    setHideAddButton(true);
    const loadingId = toast.loading(t("generatingPDF"));

    // Wait for state to update
    await new Promise((resolve) => setTimeout(resolve, 100));

    // If on a small viewport, render a desktop clone to capture the PC layout
    const targetEl = window.innerWidth < 1024 ? createDesktopClone(canvasRef.current as HTMLDivElement) : (canvasRef.current as HTMLDivElement);

    // Wait for fonts/images/layout to settle on the target before capturing
    await waitForRender(targetEl as HTMLElement);

    const canvas = await html2canvas(targetEl, {
      scale: 2,
      backgroundColor: canvasColor,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("bmc-canvas.pdf");
    // remove clone if we created one
    if (targetEl !== canvasRef.current && targetEl instanceof HTMLElement) {
      targetEl.remove();
    }
    setHideAddButton(false);
    toast.success(t("canvasExportedPDF") ?? "Canvas exported as PDF", { id: loadingId });
  };

  const handleExportPNG = async () => {
    if (!canvasRef.current) return;

    setHideAddButton(true);
    const loadingId = toast.loading(t("generatingPNG"));

    // Wait for state to update
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Use a desktop clone on small viewports so saved image matches PC layout
    const targetEl = window.innerWidth < 1024 ? createDesktopClone(canvasRef.current as HTMLDivElement) : (canvasRef.current as HTMLDivElement);

    // Wait for fonts/images/layout to settle on the target before capturing
    await waitForRender(targetEl as HTMLElement);

    const canvas = await html2canvas(targetEl, {
      scale: 2,
      backgroundColor: canvasColor,
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "bmc-canvas.png";
        link.click();
        URL.revokeObjectURL(url);
        // remove clone if created
        if (targetEl !== canvasRef.current && targetEl instanceof HTMLElement) {
          targetEl.remove();
        }
        setHideAddButton(false);
        toast.success(t("canvasExportedPNG") ?? "Canvas exported as PNG", { id: loadingId });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">


        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-foreground mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Toolbar
          onExportJSON={handleExportJSON}
          onImportJSON={handleImportJSON}
          onShareLink={handleShareLink}
          onExportPDF={handleExportPDF}
          onExportPNG={handleExportPNG}
          canvasColor={canvasColor}
          onCanvasColorChange={setCanvasColor}
          itemColor={defaultItemColor}
          onItemColorChange={setDefaultItemColor}
          titleColor={titleColor}
          onTitleColorChange={setTitleColor}
          sectionTitleColor={sectionTitleColor}
          onSectionTitleColorChange={setSectionTitleColor}
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
              setBmcData({});
              setCanvasTitle(t("clickToEditTitle"));
              setCanvasColor("#f5f3ed");
              setDefaultItemColor("#9dc8ac");
              toast.success(t("canvasCleared"));
            }}
          >
            {t("clear")}
          </Button>
        </div>

        <div ref={canvasRef}>
          <BMCCanvas
            data={bmcData}
            onDataChange={setBmcData}
            canvasColor={canvasColor}
            defaultItemColor={defaultItemColor}
            hideAddButton={hideAddButton}
            title={canvasTitle}
            onTitleChange={setCanvasTitle}
            titleColor={titleColor}
            sectionTitleColor={sectionTitleColor}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
