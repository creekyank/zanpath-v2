"use client"; // 声明为客户端组件

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
    params.set("page", "1"); // 搜索时重置到第一页

    // 使用 router.push 实现平滑跳转，或者 window.location.href 强制刷新
    router.push(`?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-10 max-w-md mx-auto">
      <input
        name="q"
        defaultValue={searchParams.get("q") || ""}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#0f3d2e] outline-none transition-all"
      />
    </form>
  );
}