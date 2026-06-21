"use client";

import { useProfileCopyStore } from "@/hooks/useProfileCopyStore";
import { useProfileEditStore } from "@/hooks/useProfileEditStore";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import React, { createContext, useContext } from "react";

import { SectionHistory } from "./sectionHistoryClient";
import { ProfileEditHistoryItem } from "@/action/adminProfileEdit";

// Context to let FieldRow know which section it belongs to
const SectionContext = createContext<string | undefined>(undefined);

// ─── Section ────────────────────────────────────────────────────────────────

export function Section({
  title,
  children,
  full,
  className = "",
  groupKeys = [],
  sectionName,
  currentValues = {},
  history = [],
}: {
  title: string;
  children: React.ReactNode;
  full?: boolean;
  className?: string;
  groupKeys?: string[];
  /** Unique name used to identify this section in edit mode */
  sectionName?: string;
  /** Current plain-string values keyed by field name, passed from page.tsx */
  currentValues?: Record<string, string | null | undefined>;
  history?: ProfileEditHistoryItem[];
}) {
  const { isMarkingMode, selectedFields, selectMultiple, deselectMultiple } =
    useProfileCopyStore();
  const { isEditingMode, editingSection, openSection, setDraftValues } =
    useProfileEditStore();

  const allSelected =
    groupKeys.length > 0 && groupKeys.every((k) => selectedFields.includes(k));

  const handleGroupToggle = (checked: boolean) => {
    if (checked) selectMultiple(groupKeys);
    else deselectMultiple(groupKeys);
  };

  const isThisSectionEditing = editingSection === (sectionName ?? title);

  const handleEditSection = () => {
    const name = sectionName ?? title;
    // Pre-fill drafts with current values
    const drafts: Record<string, string> = {};
    for (const [k, v] of Object.entries(currentValues)) {
      drafts[k] = v ?? "";
    }
    setDraftValues(drafts);
    openSection(name);
  };

  return (
    <div
      className={cn(
        "bg-card flex flex-col gap-2 rounded-2xl border p-3 sm:gap-3 sm:p-4 md:gap-4 md:p-5",
        full && "lg:col-span-2",
        isThisSectionEditing && "ring-2 ring-blue-500/60",
        className
      )}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 p-1 sm:p-2 md:p-3 relative">
        {isMarkingMode && groupKeys.length > 0 && (
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => handleGroupToggle(!!checked)}
          />
        )}
        <h1 className="text-lg font-semibold flex-1">{title}</h1>

        <div className="flex items-center gap-2">
          {history && history.length > 0 && (
            <SectionHistory history={history} />
          )}

          {/* Edit section button — only in edit mode and when no other section is currently being edited */}
          {isEditingMode && sectionName && !editingSection && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              onClick={handleEditSection}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}
          {isThisSectionEditing && (
            <span className="text-xs font-medium text-blue-500 px-2 py-0.5 rounded-full bg-blue-500/10">
              Editing
            </span>
          )}
        </div>
      </div>

      {/* Fields */}
      <SectionContext.Provider value={sectionName ?? title}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
      </SectionContext.Provider>
    </div>
  );
}

// ─── FieldRow (read-only) ────────────────────────────────────────────────────

export function FieldRow({
  label,
  value,
  copyKey,
  editKey,
  options,
}: {
  label: string;
  value: React.ReactNode;
  copyKey?: string;
  editKey?: string;
  options?: string[];
}) {
  const sectionContextName = useContext(SectionContext);
  const { isMarkingMode, selectedFields, toggleField } = useProfileCopyStore();
  const { editingSection, draftValues, setDraftField } = useProfileEditStore();

  const isChecked = copyKey ? selectedFields.includes(copyKey) : false;

  const isEmpty = (v: unknown) =>
    v === null || v === undefined || (typeof v === "string" && v.trim() === "");

  // If this field belongs to the currently editing section and has an editKey
  if (editKey && editingSection && editingSection === sectionContextName) {
    return (
      <EditableFieldRow
        label={label}
        fieldKey={editKey}
        value={draftValues[editKey] ?? (typeof value === "string" ? value : "")}
        onChange={(val) => setDraftField(editKey, val)}
        options={options}
      />
    );
  }

  return (
    <div
      className={cn(
        "bg-card hover:bg-muted-foreground/10 relative flex flex-col gap-1 rounded-xl border p-3 transition-colors",
        isMarkingMode && copyKey && "cursor-pointer",
        isMarkingMode && isChecked && "border-rose-500 ring-1 ring-rose-500/50"
      )}
      onClick={() => {
        if (isMarkingMode && copyKey) toggleField(copyKey);
      }}
    >
      {isMarkingMode && copyKey && (
        <div className="absolute top-3 right-3 pointer-events-none">
          <Checkbox checked={isChecked} />
        </div>
      )}
      <span className="text-muted-foreground text-xs tracking-wide uppercase">
        {label}
      </span>
      <div className="text-sm">
        {isEmpty(value) ? (
          <span className="text-muted-foreground italic">—</span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

// ─── EditableFieldRow ────────────────────────────────────────────────────────

function EditableFieldRow({
  label,
  fieldKey,
  value,
  onChange,
  options,
}: {
  label: string;
  fieldKey: string;
  value: string;
  onChange: (val: string) => void;
  options?: string[];
}) {
  const finalOptions = options ? [...options] : [];
  if (options && value && !finalOptions.includes(value)) {
    finalOptions.unshift(value);
  }

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-blue-400/50 bg-blue-500/5 p-3 transition-colors">
      <label
        htmlFor={fieldKey}
        className="text-muted-foreground text-xs tracking-wide uppercase"
      >
        {label}
      </label>
      {options && options.length > 0 ? (
        <Select value={value || undefined} onValueChange={onChange}>
          <SelectTrigger className="w-full h-8 text-sm border-0 bg-transparent p-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 shadow-none">
            <SelectValue placeholder={`Select ${label.toLowerCase()}...`} />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 text-zinc-50 border-zinc-800">
            {finalOptions.map((opt) => (
              <SelectItem 
                key={opt} 
                value={opt} 
                className="focus:bg-zinc-800 focus:text-zinc-50 cursor-pointer"
              >
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={fieldKey}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-sm border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      )}
    </div>
  );
}
