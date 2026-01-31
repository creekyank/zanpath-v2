export const openPaddleCheckout = (email: string, moduleName: string, locale: string) => {
  const paddle = (window as any).Paddle;

  if (paddle) {
    paddle.Checkout.open({
      settings: {
        displayMode: "overlay",
        theme: "light",
        locale: locale === "zh" ? "en" : locale,
      },
      items: [{ priceId: "pri_01kg9bxak39g4gt49k5cm1976c", quantity: 1 }],
      customer: { email },
      customData: { module: moduleName, user_email: email },
    });
  } else {
    alert("Payment system is still loading, please wait 2 seconds and try again.");
  }
};