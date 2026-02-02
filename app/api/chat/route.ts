import { NextResponse } from 'next/server';
import { db } from "@/lib/db"; 
import { isAdminEmail } from "@/config/admin";
import { OpenAI } from "openai";
import { generateFingerprint } from "@/lib/fingerprint"; // 引入你剛剛創建的函數

export const maxDuration = 60; 
export const runtime = 'nodejs';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function getImageDescription(imageBase64: string, preferences?: string) {
  if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");
  const visionPrompt = `你是一位專業的視覺觀察員。請仔細觀察這張圖片，提供詳細的「客觀特徵描述」。【用戶要求重點】：${preferences || "全面觀察"} 1. 人臉：描述三停比例、眉眼鼻、唇齒下巴、神態氣韻。 2. 空間：描述格局、材質、光影、色彩配置。直接用中文條列式回答事實，不要進行預測分析。`;
  const response = await groq.chat.completions.create({
    model: "llama-3.2-11b-vision-preview",
    messages: [{ role: "user", content: [{ type: "text", text: visionPrompt }, { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64}` } }] }],
  });
  return response.choices[0]?.message?.content || "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, email, source, image, preferences, moduleType, inputSnapshot } = body;
    const userEmail = email?.toLowerCase().trim();

    if (!userEmail || !moduleType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // --- 🟢 第一步：生成本次請求的指紋 ---
    const currentFingerprint = generateFingerprint(userEmail, moduleType, inputSnapshot, image);

    // --- 🟢 第二步：權限檢查與邏輯判定 ---
    let targetOrderId: string | null = null;

    if (source !== "vip_debug" && !isAdminEmail(userEmail)) {
      // 1. 檢查是否有完全匹配的已完成訂單（找回模式）
      const existingCompletedOrder = await db.order.findFirst({
        where: { fingerprint: currentFingerprint, status: 'paid', isUsed: true },
        include: { result: true }
      });

      if (existingCompletedOrder?.result?.isComplete) {
        console.log("♻️ 檢測到完全匹配的指紋，返回舊結果");
        return NextResponse.json({ 
          isRecovery: true, 
          content: existingCompletedOrder.result.content 
        });
      }

      // 2. 檢查是否有「已支付但未使用」的訂單權益
      const availableOrder = await db.order.findFirst({
        where: { email: userEmail, status: 'paid', isUsed: false, moduleType: moduleType },
        orderBy: { createdAt: 'asc' }
      });

      if (!availableOrder) {
        console.warn("❌ 無可用支付權益:", { userEmail, moduleType });
        return NextResponse.json({ error: "NEED_PAYMENT", message: "請先支付以獲取測算權限" }, { status: 403 });
      }

      // --- 🟢 第三步：鎖定訂單 (Transaction) ---
      // 在 AI 開始工作前，立刻把這筆錢鎖定到這個輸入指紋上
      await db.order.update({
        where: { id: availableOrder.id },
        data: { 
          isUsed: true, 
          fingerprint: currentFingerprint,
          inputData: inputSnapshot // 備份當前輸入數據
        }
      });
      
      targetOrderId = availableOrder.id;
      console.log(`🔒 訂單 ${targetOrderId} 已鎖定指紋並標記為已使用`);
    }

    // --- 🟢 第四步：執行 AI 流程 (視覺 + 文本) ---
    let visualData = "";
    if (image) {
      visualData = await getImageDescription(image, preferences);
    }

    let finalProcessedPrompt = prompt
      .replace(/\${visualData}/g, visualData)
      .replace(/\${preferences}/g, preferences || "無")
      .replace(/\${visualInputData}/g, visualData);

    const brainPrompt = `【背景視覺事實】：${visualData}\n【用戶備註】：${preferences || "無"}\n\n【解讀指令】：\n${finalProcessedPrompt}`;

    const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat", 
        messages: [
          { role: "system", content: "你是一位精通東西方文化的命理與空間分析大師，善於從視覺細節中洞察運勢。" },
          { role: "user", content: brainPrompt }
        ],
        stream: true,
        temperature: 0.7
      })
    });

    if (!dsRes.ok) throw new Error(`DeepSeek API Error: ${dsRes.status}`);

    // --- 🟢 第五步：返回流式響應 ---
    // 注意：這裡將訂單 ID 通過 Header 傳給前端，方便前端最後保存結果時關聯
    return new Response(dsRes.body, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Order-Id': targetOrderId || '', // 可選：傳回訂單ID
      }
    });

  } catch (err: any) {
    console.error("🔥 Pipeline Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}