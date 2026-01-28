export const ADMIN_CONFIG = {
  testEmails: [
    "syf4706@163.com", // 以后想换邮箱，只改这里
  ],
  testProductId: "PRI_XXXXX_0_DOLLAR_ID", // Paddle 后台 0 元产品 ID
  vipPassword: "791208",
};

export const isAdminEmail = (email: string): boolean => {
  if (!email) return false;
  return ADMIN_CONFIG.testEmails.includes(email.trim().toLowerCase());
};