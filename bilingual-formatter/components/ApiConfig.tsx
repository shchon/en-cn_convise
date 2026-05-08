"use client";

import { useEffect, useState } from "react";

interface ApiConfigProps {
  apiUrl: string;
  setApiUrl: (v: string) => void;
  apiKey: string;
  setApiKey: (v: string) => void;
  model: string;
  setModel: (v: string) => void;
}

export default function ApiConfig({
  apiUrl,
  setApiUrl,
  apiKey,
  setApiKey,
  model,
  setModel,
}: ApiConfigProps) {
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);

  useEffect(() => {
    setApiUrl(localStorage.getItem("apiUrl") || "");
    setApiKey(localStorage.getItem("apiKey") || "");
    setModel(localStorage.getItem("model") || "");
  }, [setApiUrl, setApiKey, setModel]);

  const save = () => {
    localStorage.setItem("apiUrl", apiUrl);
    localStorage.setItem("apiKey", apiKey);
    localStorage.setItem("model", model);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiUrl, apiKey, model }),
      });
      const data = await res.json();
      setTestResult({ ok: data.success, msg: data.message || data.error });
    } catch {
      setTestResult({ ok: false, msg: "网络请求失败" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">API 配置</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">API 地址</label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://your-proxy.com/v1"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-xxx"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">模型名</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="gpt-4o"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {testResult && (
          <div
            className={`text-xs px-3 py-2 rounded-md ${
              testResult.ok
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {testResult.msg}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={save}
            className="flex-1 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {saved ? "已保存" : "保存配置"}
          </button>
          <button
            onClick={testConnection}
            disabled={testing}
            className="flex-1 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {testing ? "测试中…" : "测试连接"}
          </button>
        </div>
      </div>
    </div>
  );
}
