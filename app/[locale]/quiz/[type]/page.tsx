
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

const questions: any = {
  personality: [
    {
      q: "You prefer to spend time:",
      options: [
        { text: "Alone", value: "I" },
        { text: "With others", value: "E" }
      ]
    },
    {
      q: "You make decisions based on:",
      options: [
        { text: "Logic", value: "T" },
        { text: "Feelings", value: "F" }
      ]
    }
  ],

  wealth: [
    {
      q: "Your attitude to money:",
      options: [
        { text: "Save carefully", value: "S" },
        { text: "Spend freely", value: "R" }
      ]
    },
    {
      q: "You prefer:",
      options: [
        { text: "Stable job", value: "S" },
        { text: "Risky opportunities", value: "R" }
      ]
    }
  ],

  love: [
    {
      q: "In relationships you are:",
      options: [
        { text: "Loyal", value: "L" },
        { text: "Passionate", value: "P" }
      ]
    },
    {
      q: "You value:",
      options: [
        { text: "Security", value: "S" },
        { text: "Excitement", value: "E" }
      ]
    }
  ]
};

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState("");

  const qs = questions[type] || [];

  const handleAnswer = (val: string) => {
    const next = [...answers, val];
    setAnswers(next);

    if (step + 1 < qs.length) {
      setStep(step + 1);
    } else {
      generateResult(next);
    }
  };

  const generateResult = (ans: string[]) => {
    if (type === "wealth") {
      setResult("You have strong wealth potential, but a key decision will shape your future.");
    } else if (type === "love") {
      setResult("You are emotionally deep and value meaningful connections.");
    } else {
      setResult("You are a balanced and thoughtful personality.");
    }
  };

  // ✅ 结果页
  if (result) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Your Result</h2>
        <p className="mb-6">{result}</p >

        {/* 👉 引流到算命 */}
        <button
          onClick={() => router.push("/")}
          className="w-full py-4 bg-[#0f3d2e] text-white rounded-xl font-bold"
        >
          🔮 Unlock Full AI Destiny Reading
        </button>
      </div>
    );
  }

  // ✅ 问题页
  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-6">
        {qs[step]?.q}
      </h2>

      <div className="space-y-4">
        {qs[step]?.options.map((o: any) => (
          <button
            key={o.text}
            onClick={() => handleAnswer(o.value)}
            className="w-full p-4 bg-white rounded-xl shadow hover:shadow-md"
          >
            {o.text}
          </button>
        ))}
      </div>
    </div>
  );
}