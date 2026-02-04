// lib/paddle.ts
export const openPaddleCheckout = (
  email: string,
  moduleType: string,
  inputSnapshot: any
  
) => {
  const paddle = (window as any).Paddle;
  if (!paddle) return;

  paddle.Initialize({ token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN });

  paddle.Checkout.open({
    items: [{ priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_NAMING!, quantity: 1 }],
    customer: { email },
    customData: {
      module: moduleType,
      user_email: email,
      input_snapshot: inputSnapshot
    }
  });
};