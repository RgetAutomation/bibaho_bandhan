"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Ensure theme is resolved after hydration
    if (resolvedTheme) {
      setIsDark(resolvedTheme === "dark");
    }
  }, [resolvedTheme]);

  return (
    <div className="flex items-center bg-card space-x-2 border rounded-full p-2">
      <Sun
        className="h-4 w-4 cursor-pointer"
        onClick={() => setTheme("light")}
      />
      <Switch
        checked={isDark}
        onCheckedChange={() =>
          setTheme(resolvedTheme === "light" ? "dark" : "light")
        }
        className="cursor-pointer"
      />
      <Moon
        className="h-4 w-4 cursor-pointer"
        onClick={() => setTheme("dark")}
      />
      <Label htmlFor="dark-mode" className="sr-only">
        Toggle dark mode
      </Label>
    </div>
  );
}
