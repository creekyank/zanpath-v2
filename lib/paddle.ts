/**
 * lib/paddle.ts
 * 通用 Paddle 支付跳轉函數
 */

export const openPaddleCheckout = (email: string, moduleName: string, locale: string) => {
  // 1. 安全檢查：確保在瀏覽器環境且 Paddle 腳本已加載
  if (typeof window !== "undefined" && (window as any).Paddle) {
    const paddle = (window as any).Paddle;

    // 2. 確保初始化
    // 即使在 PaddleInitializer.tsx 已經初始化過，這裡再跑一次 Initialize 是安全的，
    // 重點在於重新綁定 eventCallback 以確保當前頁面能接收到成功通知。
    paddle.Initialize({
      token: "test_1cce9b0416afc993cad22170058", // 你的 Sandbox Token
      environment: "sandbox",
      eventCallback: (data: any) => {
        if (data.name === "checkout.completed") {
          console.log("Paddle Checkout Completed");
          // 發送全局自定義事件，方便各個 Page.tsx 監聽並自動觸發 AI 生成
          window.dispatchEvent(
            new CustomEvent("paddle-payment-success", {
              detail: { email, moduleName },
            })
          );
        }
      },
    });

    // 3. 處理語言 Fallback (Paddle 僅支持部分語言)
    const supportedLocales = ["en", "es", "fr", "de", "it", "pl", "pt"];
    const paddleLocale = supportedLocales.includes(locale) ? locale : "en";

    // 4. 執行打開 Checkout
    // 使用 setTimeout 確保 Initialize 邏輯在執行隊列中完成
    setTimeout(() => {
      try {
        paddle.Checkout.open({
          settings: {
            displayMode: "overlay",
            theme: "light",
            locale: paddleLocale,
            allowLogout: false,
          },
          items: [
            {
              // 替換為你 Paddle 儀表板中的真實 Price ID
              priceId: "pri_01kg9bxak39g4gt49k5cm1976c",
              quantity: 1,
            },
          ],
          customer: {
            email: email,
          },
          customData: {
            module: moduleName,
            user_email: email,
          },
        });
      } catch (err) {
        console.error("Paddle Open Error:", err);
        alert(locale === "es" ? "Error al abrir el pago." : "Failed to open checkout.");
      }
    }, 50);
  } else {
    // 5. 腳本未加載的補救與提示
    const errorMsg = 
      locale === "es" 
        ? "El sistema de pago aún se está cargando. Si tiene un bloqueador de anuncios, desactívelo y vuelva a intentarlo." 
        : "Payment system is still loading. If you use an ad-blocker, please disable it and try again.";
    
    alert(errorMsg);
    console.error("Paddle.js is not loaded on window.");
  }
};