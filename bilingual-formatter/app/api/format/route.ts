import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/components/PromptTemplates";

export async function POST(request: NextRequest) {
  try {
    const { text, apiUrl, apiKey, model } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "请输入要排版的文本" }, { status: 400 });
    }
    if (!apiUrl) {
      return NextResponse.json({ error: "请填写 API 地址" }, { status: 400 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: "请填写 API Key" }, { status: 400 });
    }
    if (!model) {
      return NextResponse.json({ error: "请填写模型名" }, { status: 400 });
    }

    const baseUrl = apiUrl.replace(/\/+$/, "");
    const endpoint = `${baseUrl}/chat/completions`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(text) },
        ],
        temperature: 0,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message: string;
      try {
        const err = JSON.parse(errorText);
        message = err.error?.message || `API 请求失败 (${response.status})`;
      } catch {
        message = `API 请求失败 (${response.status}): ${errorText.slice(0, 200)}`;
      }
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "未知错误";
    return NextResponse.json({ error: `请求失败: ${message}` }, { status: 500 });
  }
}
