"use client";

import { useState } from "react";
import InputArea from "@/components/InputArea";
import ApiConfig from "@/components/ApiConfig";
import ResultView from "@/components/ResultView";

const BATCH_SIZE = 5;

interface Pair {
  en: string;
  zh: string;
}

function splitIntoPairs(text: string): Pair[] {
  const lines = text.split("\n").filter((l) => l.trim());
  const halfLen = Math.floor(lines.length / 2);
  const pairs: Pair[] = [];
  for (let i = 0; i < halfLen; i++) {
    pairs.push({ en: lines[i], zh: lines[i + halfLen] });
  }
  for (let i = halfLen; i < lines.length - halfLen; i++) {
    pairs.push({ en: "", zh: lines[halfLen + i] });
  }
  return pairs;
}

function pairsToText(pairs: Pair[]): string {
  return pairs.map((p) => p.en + "\n" + p.zh).join("\n\n");
}

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");

  const handleFormat = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    setError("");
    setOutputText("");
    setProgress("");

    try {
      const pairs = splitIntoPairs(inputText);

      if (pairs.length === 0) {
        setError("未能识别出有效的段落对");
        setIsProcessing(false);
        return;
      }

      const totalBatches = Math.ceil(pairs.length / BATCH_SIZE);
      const results: string[] = [];

      for (let i = 0; i < totalBatches; i++) {
        setProgress(`处理中… ${i + 1}/${totalBatches}`);

        const chunk = pairs.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
        const chunkText = pairsToText(chunk);

        const res = await fetch("/api/format", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: chunkText,
            apiUrl,
            apiKey,
            model,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "请求失败");
          setIsProcessing(false);
          return;
        }

        results.push(data.result);
      }

      setOutputText(results.join("\n\n"));
      setProgress(`完成，共处理 ${totalBatches} 批`);
    } catch {
      setError("请求失败，请检查网络连接或 API 配置");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800">双语文本排版工具</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            将段落级双语文本转换为逐句对齐格式
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <InputArea
              inputText={inputText}
              setInputText={setInputText}
              onFormat={handleFormat}
              isProcessing={isProcessing}
            />

            {progress && !error && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                {progress}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <ResultView outputText={outputText} />
          </div>

          <div className="lg:col-span-1">
            <ApiConfig
              apiUrl={apiUrl}
              setApiUrl={setApiUrl}
              apiKey={apiKey}
              setApiKey={setApiKey}
              model={model}
              setModel={setModel}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
