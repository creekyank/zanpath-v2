import { NextResponse } from 'next/server';
import { db } from "@/lib/db"; 
import { isAdminEmail } from "@/config/admin";
import { OpenAI } from "openai";

export const maxDuration = 60;
export const runtime = 'nodejs';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/**
 * 第一階段：Groq 視覺描述
 */
async function getImageDescription(imageBase64: string, preferences?: string) {
  if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");

  const visionPrompt = `
    你是一位專業的視覺觀察員。請仔細觀察這張圖片，並為後續的文化專家分析提供詳細的「客觀特徵描述」。
    
    【重要：用戶特別要求的觀察重點】：
    ${preferences || "無特定重點，請進行全面觀察"}

    觀察指南：
    1. 如果是人臉：
       - 描述「三停」比例（上停額頭、中停眉眼鼻、下停嘴唇下巴）。
       - 描述細節：眉毛濃淡與形狀、眼睛神采、鼻樑與鼻翼特徵、唇形厚薄、下巴與腮骨。
       - 捕捉神態氣韻（如平靜、自信、威嚴或憂慮）。
    2. 如果是室內空間：
       - 描述整體格局、家具材質與擺放、主色調、明暗光影、是否有植物或特定裝飾物。

    要求：請直接用「中文」條列式回答，只描述視覺事實，不要進行預測或命理分析。
  `;

  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct", 
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: visionPrompt },
          { 
            type: "image_url", 
            image_url: { 
              url: `data:image/jpeg;base64,${imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64}` 
            } 
          }
        ],
      },
    ],
  });

  return response.choices[0]?.message?.content || "";
}

export async function POST(req: Request) {
  try {
    const { prompt, email, source, image, preferences } = await req.json();
    const userEmail = email?.toLowerCase().trim();

    // 1. 權限檢查
    if (source !== "vip_debug" && !isAdminEmail(userEmail)) {
      const hasPaid = await db.order.findFirst({
        where: { email: userEmail, status: 'paid' },
      });
      if (!hasPaid) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let visualData = "";

    // 2. 執行視覺分析
    if (image) {
      console.log("📸 Groq Vision Scanning...");
      try {
        // 將 preferences 傳入，讓 Groq 知道要「盯着哪裡看」
        visualData = await getImageDescription(image, preferences);
        console.log("✅ Visual Data Acquired");
      } catch (e: any) {
        console.error("❌ Groq Vision Failed:", e.message);
        visualData = "視覺掃描暫時不可用，請根據用戶提供的描述進行分析。";
      }
    }

    // 3. 執行 DeepSeek 深度解讀
    console.log("🧠 DeepSeek Reasoning...");
    
    let finalProcessedPrompt = prompt
    .replace("${spaceDescription}", visualData)
    .replace("${visualInputData}", visualData)
    .replace("${preferences}", preferences || "無特別說明").replace("\${preferences}", preferences || "無特別說明");
  
  // 2. 構建發送給 DeepSeek 的最終指令
  const brainPrompt = `
    你現在收到了以下背景數據：
    - 視覺掃描事實：${visualData}
    - 用戶特別囑咐：${preferences || "無"}
  
    請嚴格按照下列指令與格式輸出報告：
    ${finalProcessedPrompt}
  `;

    const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        // 建議針對複雜解讀使用 deepseek-reasoner (R1)，效果會更具大師感
        model: "deepseek-chat", 
        messages: [{ role: "user", content: brainPrompt }],
        stream: true
      })
    });

    if (!dsRes.ok) throw new Error(`DeepSeek API Error: ${dsRes.status}`);

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