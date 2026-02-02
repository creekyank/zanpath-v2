import { NextResponse } from 'next/server';
import { db } from "@/lib/db"; 
import { isAdminEmail } from "@/config/admin";
import { OpenAI } from "openai";

export const maxDuration = 60; // Vercel Pro 支援 60s
export const runtime = 'nodejs';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/**
 * 第一階段：Groq 視覺描述 (Llama 3.2 Vision 或相似模型)
 */
async function getImageDescription(imageBase64: string, preferences?: string) {
  if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");

  const visionPrompt = `
    你是一位專業的視覺觀察員。請仔細觀察這張圖片，提供詳細的「客觀特徵描述」。
    【用戶要求重點】：${preferences || "全面觀察"}
    1. 人臉：描述三停比例、眉眼鼻、唇齒下巴、神態氣韻。
    2. 空間：描述格局、材質、光影、色彩配置。
    直接用中文條列式回答事實，不要進行預測分析。
  `;

  const response = await groq.chat.completions.create({
    model: "llama-3.2-11b-vision-preview", // 確保使用正確的 Groq 視覺模型名稱
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: visionPrompt },
          { 
            type: "image_url", 
            image_url: { url: `data:image/jpeg;base64,${imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64}` } 
          }
        ],
      },
    ],
  });

  return response.choices[0]?.message?.content || "";
}

export async function POST(req: Request) {
  try {
    const { prompt, email, source, image, preferences, moduleType } = await req.json();
    const userEmail = email?.toLowerCase().trim();

    // 1. 核心權限檢查：只允許管理員或已支付對應模塊的用戶
    if (source !== "vip_debug" && !isAdminEmail(userEmail)) {
      const activeOrder = await db.order.findFirst({
        where: { 
          email: userEmail, 
          status: 'paid',
          moduleType: moduleType // 🟢 這裡使用前端傳入的明確模塊名
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!activeOrder) {
        return NextResponse.json({ error: "Unauthorized: No paid order found" }, { status: 403 });
      }
      
      // 💡 可以在這裡從 activeOrder.inputData 提取數據，確保數據一致性
      console.log(`✅ 驗證通過：用戶 ${userEmail} 已支付 ${moduleType}`);
    }

    let visualData = "";

    // 2. 執行視覺分析 (如果是面相/風水模塊)
    if (image) {
      console.log("📸 Groq Vision Scanning...");
      try {
        visualData = await getImageDescription(image, preferences);
        console.log("✅ Visual Data Acquired");
      } catch (e: any) {
        console.error("❌ Groq Vision Failed:", e.message);
        visualData = "視覺掃描暫時不可用，請根據用戶提供的原始描述進行分析。";
      }
    }

    // 3. 執行 DeepSeek 深度解讀
    console.log("🧠 DeepSeek Reasoning...");
    
    // 替換 Prompt 中的佔位符
    let finalProcessedPrompt = prompt
      .replace(/\${visualData}/g, visualData)
      .replace(/\${preferences}/g, preferences || "無")
      .replace(/\${visualInputData}/g, visualData);

    const brainPrompt = `
      【背景視覺事實】：${visualData}
      【用戶備註】：${preferences || "無"}
      
      【解讀指令】：
      ${finalProcessedPrompt}
    `;

    const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        // 🚀 建議：如果是複雜命理分析，使用 deepseek-reasoner (R1) 效果會更深層
        model: "deepseek-chat", 
        messages: [
          { role: "system", content: "你是一位精通東西方文化的命理與空間分析大師，善於從視覺細節中洞察運勢。" },
          { role: "user", content: brainPrompt }
        ],
        stream: true, // 開啟流式輸出
        temperature: 0.7
      })
    });

    if (!dsRes.ok) throw new Error(`DeepSeek API Error: ${dsRes.status}`);

    // 4. 返回流式數據給前端，讓文字逐字顯示
    return new Response(dsRes.body, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (err: any) {
    console.error("🔥 Pipeline Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}