"use client";

import { useState } from "react";
import { createClient } from '@supabase/supabase-js';
import { jsPDF } from "jspdf";
import emailjs from '@emailjs/browser';

export default function Home() {
  const [formData, setFormData] = useState({ name: "", year: "", month: "", day: "", hour: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  // --- 1. 发送邮件函数 (修复了变量传递问题) ---
  const sendEmail = async (englishText: string) => {
    const serviceId = "service_8z2vdct"; 
    const templateId = "template_he0ybxv";
    const publicKey = "zbTR4SBh6xMI5yDRK";

    const templateParams = {
      user_name: formData.name,
      user_email: formData.email,
      user_birth_data: `${formData.year}-${formData.month}-${formData.day}`,
      report_content: englishText, // 这里使用的是传入的参数
    };

    try {
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      console.log("Email sent successfully!");
    } catch (error) {
      console.error("Email failed:", error);
    }
  };

  // --- 2. 下载 PDF 函数 (纯英文版) ---
  const downloadEnglishPDF = () => {
    const doc = new jsPDF();
    const separator = "---ENGLISH_SECTION---";
    const parts = result.split(separator);
    const englishText = parts.length > 1 ? parts[1].trim() : result;

    doc.setFont("helvetica", "bold");
    doc.text("Astrology Analysis Report", 10, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Name: ${formData.name}`, 10, 30);
    
    const splitText = doc.splitTextToSize(englishText, 180);
    doc.text(splitText, 10, 40);
    doc.save(`Report_${formData.name}.pdf`);
  };

  // --- 3. 提交表单逻辑 ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult("");

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const systemPrompt = `Analyze destiny based on Bazi. 
      Format: Chinese analysis first, then insert separator ---ENGLISH_SECTION--- then English analysis. 
      Make the English part very professional.`;

      const aiResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `Name: ${formData.name}, Time: ${formData.year}-${formData.month}-${formData.day} ${formData.hour}:00` }]
        })
      });

      const aiData = await aiResponse.json();
      const fullContent = aiData.choices[0].message.content;
      
      // 提取英文部分
      const englishPart = fullContent.split("---ENGLISH_SECTION---")[1] || "Full report provided below.";

      // 保存到数据库
      await supabase.from('predictions').insert([{ 
        name: formData.name, 
        email: formData.email, 
        result: fullContent 
      }]);

      setResult(fullContent);

      // 执行发送邮件
      await sendEmail(englishPart);
      
      alert("✅ Report generated and sent to your email!");

    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] py-12 px-4 flex flex-col items-center font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-md w-full max-w-2xl text-center mb-8 border-b-4 border-[#004d40]">
        <h1 className="text-3xl font-bold text-[#004d40]">ZenPath AI</h1>
        <p className="text-gray-500 mt-2">Personalized Astrology Analysis</p>
      </div>

      {!result && !loading && (
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Name" className="p-4 bg-gray-50 rounded-2xl outline-none" 
                onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <input type="email" placeholder="Email" className="p-4 bg-gray-50 rounded-2xl outline-none" 
                onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <input type="number" placeholder="Year" className="p-4 bg-gray-50 rounded-2xl outline-none" onChange={(e) => setFormData({...formData, year: e.target.value})} required />
              <input type="number" placeholder="Month" className="p-4 bg-gray-50 rounded-2xl outline-none" onChange={(e) => setFormData({...formData, month: e.target.value})} required />
              <input type="number" placeholder="Day" className="p-4 bg-gray-50 rounded-2xl outline-none" onChange={(e) => setFormData({...formData, day: e.target.value})} required />
              <input type="number" placeholder="Hour" className="p-4 bg-gray-50 rounded-2xl outline-none" onChange={(e) => setFormData({...formData, hour: e.target.value})} required />
            </div>
            <button type="submit" className="w-full bg-[#004d40] text-white font-bold py-5 rounded-2xl hover:bg-[#00332c] transition-all shadow-lg">
              Get Analysis Report
            </button>
          </form>
        </div>
      )}

      {loading && (
        <div className="mt-12 text-center p-12 bg-white rounded-3xl shadow-xl w-full max-w-2xl">
          <div className="text-5xl mb-4 animate-spin inline-block">🔮</div>
          <h2 className="text-xl font-bold text-[#004d40]">Consulting the Stars...</h2>
          <p className="text-gray-500 mt-2">Writing your bilingual report, please wait (30s).</p>
        </div>
      )}

      {result && !loading && (
        <div className="w-full max-w-4xl bg-white p-10 rounded-3xl shadow-2xl border-t-8 border-[#004d40] mt-4">
          <div className="flex justify-between items-center mb-8 border-b pb-6">
            <h2 className="text-[#004d40] font-bold text-2xl">Analysis Result</h2>
            <button onClick={downloadEnglishPDF} className="bg-[#c6a355] text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-[#b08d44]">
              📥 Download English PDF
            </button>
          </div>
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg">
            {/* 上线时若想隐藏中文，可改用 {result.split("---ENGLISH_SECTION---")[1]} */}
            {result}
          </div>
        </div>
      )}

      <footer className="mt-12 text-gray-400 text-sm">
        AI Analysis will be sent to your email automatically.
      </footer>
    </div>
  );
}