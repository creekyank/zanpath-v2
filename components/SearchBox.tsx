"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBox({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q")?.toString() || "";

    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    params.set("page", "1"); 

    router.push(`?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-10 max-w-md mx-auto relative group">
      <div className="relative flex items-center">
        <input
          name="q"
          defaultValue={searchParams.get("q") || ""}
          placeholder={placeholder}
          // pr-12 给右侧留出按钮空间
          className="w-full px-5 py-3 pr-12 border border-gray-200 rounded-2xl focus:border-[#0f3d2e] focus:ring-1 focus:ring-[#0f3d2e] outline-none transition-all shadow-sm bg-white"
        />
        
        {/* 放大镜按钮 */}
        <button
          type="submit"
          className="absolute right-2 p-2 text-gray-400 hover:text-[#0f3d2e] active:scale-90 transition-all"
          aria-label="Search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}