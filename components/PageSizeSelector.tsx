"use client"; // 关键：声明这是客户端组件

export default function PageSizeSelector({ initialSize }: { initialSize: number }) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value;
    const params = new URLSearchParams(window.location.search);
    params.set("ps", size);
    params.set("page", "1"); // 切换数量时重置到第一页
    window.location.href = `?${params.toString()}`;
  };

  return (
    <div className="flex items-center gap-3 text-sm text-[#4a7c6d] bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
      <span className="font-medium">Show</span>
      <select
        value={initialSize}
        onChange={handleChange} // 这里可以使用 onChange 了
        className="bg-transparent border-none outline-none font-bold text-[#0f3d2e] cursor-pointer focus:ring-0"
      >
        {[5, 10, 20, 50, 100].map((size) => (
          <option key={size} value={size}>
            {size} articles
          </option>
        ))}
      </select>
      <span className="opacity-60">per page</span>
    </div>
  );
}