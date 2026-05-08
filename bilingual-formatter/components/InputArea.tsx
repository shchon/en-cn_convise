"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";

interface InputAreaProps {
  inputText: string;
  setInputText: (v: string) => void;
  onFormat: () => void;
  isProcessing: boolean;
}

export default function InputArea({
  inputText,
  setInputText,
  onFormat,
  isProcessing,
}: InputAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputText(content);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    setFileName("");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">输入文本</h3>

      <textarea
        value={inputText}
        onChange={handleTextChange}
        placeholder="在此粘贴双语文本……"
        rows={14}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
      />

      <div className="text-xs text-gray-400 text-center my-2">或</div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-md p-3 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".txt"
          onChange={handleFileChange}
          className="hidden"
        />
        {fileName ? (
          <span className="text-sm text-blue-600">{fileName}</span>
        ) : (
          <span className="text-sm text-gray-500">
            点击选择或拖拽上传 .txt 文件
          </span>
        )}
      </div>

      <button
        onClick={onFormat}
        disabled={isProcessing || !inputText.trim()}
        className="w-full mt-4 py-2 text-sm font-medium bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? "排版中……" : "开始排版"}
      </button>
    </div>
  );
}
