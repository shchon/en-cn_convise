"use client";

import { useState } from "react";

interface ResultViewProps {
  outputText: string;
}

export default function ResultView({ outputText }: ResultViewProps) {
  const [copied, setCopied] = useState(false);

  const download = () => {
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!outputText) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">结果</h3>
        <p className="text-sm text-gray-400 text-center py-8">
          点击"开始排版"后结果会显示在这里
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">结果</h3>

      <pre className="whitespace-pre-wrap text-sm bg-gray-50 rounded-md p-3 max-h-96 overflow-y-auto border border-gray-200">
        {outputText}
      </pre>

      <div className="flex gap-3 mt-3">
        <button
          onClick={download}
          className="flex-1 py-2 text-sm font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          下载 .txt
        </button>
        <button
          onClick={copy}
          className="flex-1 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          {copied ? "已复制" : "复制"}
        </button>
      </div>
    </div>
  );
}
