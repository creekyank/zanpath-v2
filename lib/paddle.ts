/**
 * lib/paddle.ts
 * 通用 Paddle 支付跳轉函數
 */

export const openPaddleCheckout = (email: string, moduleName: string, locale: string) => {
  if (typeof window === "undefined") return;

  const paddle = (window as any).Paddle;

  // 1. 檢查 Paddle 是否存在，如果不存在，可能是被攔截或還沒加載完
  if (!paddle) {
    const errorMsg = 
      locale === "es" 
        ? "El sistema de pago no está disponible. Por favor, desactive el bloqueador de anuncios o use otro navegador." 
        : "Payment system is not available. Please disable ad-blocker or try a different browser.";
    
    alert(errorMsg);
    console.error("Paddle.js is missing from window. (Check for 403 Forbidden in Network tab)");
    return;
  }

  // 2. 確保初始化
  // 即使已經初始化過，這裡再次調用會更新 eventCallback
  paddle.Initialize({
    token: "test_1cce9b0416afc993cad22170058", 
    environment: "sandbox",
    eventCallback: (data: any) => {
      if (data.name === "checkout.completed") {
        console.log("Paddle Checkout Completed");
        window.dispatchEvent(
          new CustomEvent("paddle-payment-success", {
            detail: { email, moduleName },
          })
        );
      }
    },
  });

  // 3. 語言處理
  const supportedLocales = ["en", "es", "fr", "de", "it", "pl", "pt"];
  const paddleLocale = supportedLocales.includes(locale) ? locale : "en";

  // 4. 打開 Checkout (增加 try-catch 保護)
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
    console.error("Paddle Checkout Open failed:", err);
    // 🟠 如果是因為沒初始化成功，這裡做最後一次嘗試
    alert(locale === "es" ? "Reintentando conexión..." : "Retrying connection...");
  }
};