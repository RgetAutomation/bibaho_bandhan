// components/MessageInput.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Send, SmilePlus } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { Input } from "./ui/input";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onInputChange: (value: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onInputChange,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
      onInputChange("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    onInputChange(e.target.value);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [message]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col p-4 border-t">
      <div className="flex gap-2 items-center relative">
        <Button
          type="button"
          variant={"outline"}
          size={"icon"}
          className="rounded-full"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <SmilePlus />
        </Button>
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute left-0 bottom-16 z-10">
            <EmojiPicker
              onEmojiClick={(emoji) => {
                setMessage((prev) => prev + emoji.emoji);
                setShowEmojiPicker(false);
              }}
            />
          </div>
        )}
        <Input
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          placeholder={"Type a message..."}
          className="flex-1 rounded-full px-4 py-2 bg-zinc-100 dark:bg-zinc-800 outline-none"
          maxLength={1000}
        />

        <Button
          type="submit"
          disabled={!message.trim()}
          className="rounded-full bg-primary text-white disabled:opacity-50"
          size={"icon"}
        >
          <Send />
        </Button>
      </div>

      {/* <div className="text-xs text-gray-500 mt-1 text-right">
        {message.length}/1000
      </div> */}
    </form>
  );
};
