import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { birthData } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;

    // 这里是直接呼叫 DeepSeek 的服务器
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { 
            role: "system", 
            content: "You are a professional Bazi (Eastern Astrology) master. Based on the user's birth data, provide an insightful, encouraging, and professional 150-word destiny overview in English." 
          },
          { 
            role: "user", 
            content: `My birth info is: ${birthData}. Please give me a reading.` 
          }
        ],
        stream: false
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    return NextResponse.json({ result: data.choices[0].message.content });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Failed to connect to the cosmos" }, { status: 500 });
  }
}