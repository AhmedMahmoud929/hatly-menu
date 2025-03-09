"use client";

import type React from "react";
import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  initialTags?: string[];
  syncTags: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
}

export function TagInput({
  initialTags = [],
  syncTags,
  placeholder = "Type and press comma to add tags...",
  className,
  maxTags = 10,
  ...props
}: TagInputProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize tags from props
  useEffect(() => {
    if (initialTags && initialTags.length > 0) {
      setTags(initialTags);
    }
  }, [initialTags]);

  const handleTagChange = (newTags: string[]) => {
    setTags(newTags);
    // syncTags(newTags);
  };

  const handleInputChange = (value: string) => {
    console.log(value);
    // Always update the input value first
    setInputValue(value);

    // Then check if we need to create a tag
    if (value.endsWith(", ")) {
      const newTag = value.replace(/,\s*$/, "").trim();
      if (newTag && !tags.includes(newTag) && tags.length < maxTags) {
        handleTagChange([...tags, newTag]);
        setInputValue("");
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Add tag on Enter key
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim()) && tags.length < maxTags) {
        handleTagChange([...tags, inputValue.trim()]);
        setInputValue("");
      }
    }

    // Remove the last tag on Backspace if input is empty
    if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      e.preventDefault();
      const newTags = [...tags];
      const lastTag = newTags.pop();
      setInputValue(lastTag?.slice(0, -1) || "");
      handleTagChange(newTags);
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleTagChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5 p-2 bg-background border rounded-md min-h-10 focus-within:ring-1 focus-within:ring-ring",
        className
      )}
      onClick={handleContainerClick}
    >
      {tags.map((tag, index) => (
        <div
          key={`${tag}-${index}`}
          className="flex items-center gap-1 bg-muted text-muted-foreground h-8 px-2 py-1 rounded-md text-sm"
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            className="text-muted-foreground hover:text-foreground focus:outline-none"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <textarea
        ref={inputRef}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        rows={3}
        className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px] p-1"
        // {...props}
      />
    </div>
  );
}
