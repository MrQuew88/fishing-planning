"use client";

import { useState, useCallback } from "react";

interface Props {
  value: string;
  onSave: (value: string) => void | Promise<void>;
  placeholder?: string;
  type?: "text" | "number";
  label?: string;
  className?: string;
}

export default function EditableField({
  value: initialValue,
  onSave,
  placeholder = "",
  type = "text",
  label,
  className = "",
}: Props) {
  const [value, setValue] = useState(initialValue);

  const handleBlur = useCallback(() => {
    if (value !== initialValue) {
      onSave(value);
    }
  }, [value, initialValue, onSave]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {label && (
        <label className="text-lg text-white/70 font-medium w-28 shrink-0">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors min-h-[48px]"
      />
    </div>
  );
}
