import React, { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/components/ui/input";

const getHistory = (): string[] => {
  try {
    const data = localStorage.getItem("bmcColorHistory");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveHistory = (history: string[]) => {
  try {
    localStorage.setItem("bmcColorHistory", JSON.stringify(history));
  } catch (e) {}
};

interface Props {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPickerWithHistory: React.FC<Props> = ({ color, onChange }) => {
  const [history, setHistory] = useState<string[]>(getHistory());
  const [inputValue, setInputValue] = useState(color.replace("#", ""));

  useEffect(() => {
    setInputValue(color.replace("#", ""));
  }, [color]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setHistory((prev) => {
        if (prev[0] === color) return prev;
        const newHistory = [color, ...prev.filter(c => c.toLowerCase() !== color.toLowerCase())].slice(0, 7);
        saveHistory(newHistory);
        return newHistory;
      });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [color]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
    setInputValue(val);
    if (val.length === 3 || val.length === 6) {
      onChange("#" + val);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-[200px]">
      <HexColorPicker color={color} onChange={onChange} />
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground font-medium">#</span>
        <Input 
          className="h-8 uppercase" 
          value={inputValue} 
          onChange={handleInputChange}
          maxLength={6}
          onBlur={() => {
            if (inputValue.length < 3) {
              setInputValue(color.replace("#", ""));
            }
          }}
        />
      </div>
      {history.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {history.map((hColor) => (
            <button
              key={hColor}
              className="w-6 h-6 rounded-md shadow-sm border border-black/10 cursor-pointer transition-transform hover:scale-110"
              style={{ backgroundColor: hColor }}
              onClick={() => onChange(hColor)}
              title={hColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};
