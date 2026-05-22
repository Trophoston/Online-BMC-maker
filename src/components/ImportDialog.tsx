import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Clipboard, FileJson, AlertCircle } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { toast } from "sonner";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
}

export const ImportDialog = ({ open, onClose, onImport }: ImportDialogProps) => {
  const { t } = useI18n();
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleClose = () => {
    setJsonText("");
    setError(null);
    onClose();
  };

  const processJsonString = (str: string) => {
    try {
      setError(null);
      const parsed = JSON.parse(str);
      
      // Basic validation: must be an object and have either `data` or standard fields
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid JSON: Root element must be an object.");
      }
      if (!parsed.data && !parsed.keyPartnerships && !parsed.valueProposition) {
        throw new Error("Invalid canvas structure. Missing core BMC data.");
      }
      
      // If the user imports a raw data object directly without the outer envelope (title, canvasColor, etc.)
      // we wrap it in the expected format
      const normalizedData = parsed.data ? parsed : { data: parsed };

      onImport(normalizedData);
      handleClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to parse JSON. Please check the format.");
      toast.error("Invalid JSON data");
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setJsonText(text);
        setError(null);
        toast.success("JSON pasted from clipboard");
      }
    } catch (err) {
      toast.error("Could not read clipboard. Please paste manually (Ctrl+V or Cmd+V).");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      processJsonString(content);
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".json")) {
      readFile(file);
    } else {
      toast.error("Please drop a valid .json file");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl w-[90vw] rounded-[2.5rem] p-8 border-0 shadow-2xl bg-white/95 backdrop-blur-xl dark:bg-zinc-950/95">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
            <FileJson className="h-6 w-6 text-orange-500" />
            {t("importJSON") || "Import Canvas"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="file" className="w-full mt-2">
          <TabsList className="grid grid-cols-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1 mb-6 max-w-[320px]">
            <TabsTrigger value="file" className="rounded-lg text-xs font-bold">Upload File</TabsTrigger>
            <TabsTrigger value="paste" className="rounded-lg text-xs font-bold">Paste JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 ${
                dragOver 
                  ? "border-primary bg-primary/5 dark:bg-primary/10 scale-[1.02]" 
                  : "border-border/60"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-orange-500 mb-1">
                <Upload className="h-5 w-5" />
              </div>
              <div className="font-bold text-sm text-center">
                Drag and drop your .json file here
              </div>
              <div className="text-xs text-muted-foreground text-center">
                or click to browse from your computer
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </TabsContent>

          <TabsContent value="paste" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="paste-textarea" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Paste JSON Data
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-xl text-xs font-bold px-3 gap-1.5 border-border/60 hover:bg-accent/40"
                  onClick={handlePaste}
                >
                  <Clipboard className="h-3.5 w-3.5" />
                  Paste clipboard
                </Button>
              </div>
              <Textarea
                id="paste-textarea"
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setError(null);
                }}
                placeholder='{"title": "My Canvas", "data": { ... }}'
                rows={8}
                className="font-mono text-xs rounded-2xl border-border/60 focus-visible:ring-primary resize-none mt-1"
              />
            </div>

            {error && (
              <div className="flex gap-2 p-3.5 rounded-2xl bg-destructive/10 text-destructive text-xs font-semibold items-start leading-relaxed border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="break-words">{error}</span>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-border/20">
              <Button variant="outline" className="rounded-2xl py-5 px-6 font-bold border-border/60" onClick={handleClose}>
                {t("cancel")}
              </Button>
              <Button 
                className="rounded-2xl py-5 px-6 font-bold" 
                onClick={() => processJsonString(jsonText)}
                disabled={!jsonText.trim()}
              >
                {t("importJSON") || "Import"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
