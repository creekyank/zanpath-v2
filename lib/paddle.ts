// 修改後的 lib/paddle.ts
export const openPaddleCheckout = (
  email: string, 
  moduleName: string, 
  inputSnapshot: any, // 🟢 新增：傳入當前表單快照
  onSuccess: () => void // 🟢 新增：支付成功回調
) => {
  const paddle = (window as any).Paddle;
  if (!paddle) return;

  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  const priceMap: Record<string, string | undefined> = {
    naming: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_NAMING,
    // ... 其他 id
  };

  const priceId = priceMap[moduleName];
  if (!token || !priceId) return;

  if (!(window as any).__paddle_inited) {
    paddle.Initialize({ token });
    (window as any).__paddle_inited = true;
  }

  paddle.Checkout.open({
    settings: {
      displayMode: "overlay",
      theme: "light",
      locale: "en",
    },
    items: [{ priceId, quantity: 1 }],
    customer: { email },
    customData: { 
      module: moduleName,
      user_email: email,
      input_snapshot: inputSnapshot // 🟢 傳給 Webhook 存入資料庫
    },
    // 🟢 監聽支付成功事件
    eventCallback: (event: any) => {
      if (event.name === "checkout.completed") {
        onSuccess(); 
      }
    }
  });
};