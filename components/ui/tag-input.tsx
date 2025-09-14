"use client"

import React, { useState, useRef, KeyboardEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TagInputProps {
  value?: string[]
  onChange?: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
  className?: string
  disabled?: boolean
  maxTags?: number
}

export function TagInput({
  value = [],
  onChange,
  suggestions = [],
  placeholder = "Add tags...",
  className,
  disabled = false,
  maxTags
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (
      trimmedTag &&
      !value.includes(trimmedTag) &&
      (!maxTags || value.length < maxTags)
    ) {
      const newTags = [...value, trimmedTag]
      onChange?.(newTags)
      setInputValue("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = value.filter((tag) => tag !== tagToRemove)
    onChange?.(newTags)
  }

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Enter":
      case ",":
        e.preventDefault()
        if (inputValue.trim()) {
          addTag(inputValue.trim())
        }
        break
      case "Backspace":
        if (!inputValue && value.length > 0) {
          removeTag(value[value.length - 1])
        }
        break
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        className="min-h-[2.5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap gap-1">
          {/* Render existing tags */}
          {value.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 pr-1 text-xs"
            >
              <span>{tag}</span>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    removeTag(tag)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
          
          {/* Input for new tags */}
          {(!maxTags || value.length < maxTags) && !disabled && (
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={value.length === 0 ? placeholder : ""}
              className="flex-1 border-0 p-0 h-6 min-w-[120px] bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          )}
        </div>
      </div>
      
      {/* Helper text */}
      <div className="mt-1 text-xs text-muted-foreground">
        {maxTags ? `${value.length}/${maxTags} tags` : `${value.length} tags`} • 
        Press Enter or comma to add tags
      </div>
    </div>
  )
}
