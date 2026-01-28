// prisma.config.ts
export default {
  datasource: {
    provider: 'postgresql', // 或你使用的数据库类型
    url: process.env.DATABASE_URL,
  },
  generator: {
    provider: 'prisma-client-js',
  },
};
