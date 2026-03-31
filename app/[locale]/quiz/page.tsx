
import { Link } from "@/i18n/navigation";

export default function QuizHome() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      
      <h1 className="text-3xl font-bold mb-8 text-center">
        Free AI Tests
      </h1>

      <div className="grid gap-6">

        <Link href="/quiz/personality" className="p-6 bg-white rounded-2xl shadow hover:shadow-lg">
          🧠 Personality Test
        </Link>

        <Link href="/quiz/wealth" className="p-6 bg-white rounded-2xl shadow hover:shadow-lg">
          💰 Wealth Test
        </Link>

        <Link href="/quiz/love" className="p-6 bg-white rounded-2xl shadow hover:shadow-lg">
          ❤️ Love Test
        </Link>

      </div>

    </main>
  );
}