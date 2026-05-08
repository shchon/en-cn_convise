import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { apiUrl, apiKey, model } = await request.json();

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
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 5,
        temperature: 0,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message: string;
      try {
        const err = JSON.parse(errorText);
        message = err.error?.message || `连接失败 (${response.status})`;
      } catch {
        message = `连接失败 (${response.status}): ${errorText.slice(0, 200)}`;
      }
      return NextResponse.json({ success: false, message }, { status: 200 });
    }

    return NextResponse.json({ success: true, message: "连接成功" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "未知错误";
    return NextResponse.json({ success: false, message: `连接失败: ${msg}` }, { status: 200 });
  }
}
