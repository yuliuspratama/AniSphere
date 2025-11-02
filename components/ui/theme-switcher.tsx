"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Palette, Moon, Sun } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const themes = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
  { value: "blue", label: "Biru", icon: Palette },
  { value: "blue-dark", label: "Biru Gelap", icon: Palette },
  { value: "green", label: "Hijau", icon: Palette },
  { value: "green-dark", label: "Hijau Gelap", icon: Palette },
  { value: "purple", label: "Ungu", icon: Palette },
  { value: "purple-dark", label: "Ungu Gelap", icon: Palette },
  { value: "orange", label: "Oranye", icon: Palette },
  { value: "orange-dark", label: "Oranye Gelap", icon: Palette },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
        <span className="text-muted-foreground">Memuat...</span>
      </div>
    );
  }

  const currentTheme = themes.find((t) => t.value === theme) || themes[0];
  const Icon = currentTheme.icon;

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-full">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <SelectValue placeholder="Pilih tema" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {themes.map((themeOption) => {
          const ThemeIcon = themeOption.icon;
          return (
            <SelectItem key={themeOption.value} value={themeOption.value}>
              <div className="flex items-center gap-2">
                <ThemeIcon className="h-4 w-4" />
                <span>{themeOption.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

