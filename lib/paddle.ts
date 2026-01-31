export const openPaddleCheckout = (email: string, moduleName: string, locale: string) => {
  if (typeof window === "undefined") return;
  const paddle = (window as any).Paddle;

  // 如果 paddle 還是沒加載，說明被防火牆攔截了
  if (!paddle) {
    alert("Payment system blocked by your browser or network. Please try disabling VPN/Ad-blockers.");
    return;
  }

  // 確保初始化
  paddle.Initialize({
    token: "test_1cce9b0416afc993cad22170058",
    environment: "sandbox",
  });

  const supportedLocales = ["en", "es", "fr", "de", "it"];
  const paddleLocale = supportedLocales.includes(locale) ? locale : "en";

  paddle.Checkout.open({
    settings: {
      displayMode: "overlay",
      theme: "light",
      locale: paddleLocale,
    },
    items: [{ priceId: "pri_01kg9bxak39g4gt49k5cm1976c", quantity: 1 }],
    customer: { email },
    customData: { module: moduleName, user_email: email },
  });
};