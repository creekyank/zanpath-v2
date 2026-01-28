export {};

declare global {
  interface Window {
    Paddle?: {
      Checkout: {
        open: (options: any) => void;
      };
      Setup?: (options: any) => void;
    };
  }
}
