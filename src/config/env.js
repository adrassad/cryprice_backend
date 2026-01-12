import 'dotenv/config';

export const ENV = {
  PORT: Number(process.env.PORT ?? 3000),
  RPC_URL: process.env.RPC_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  BOT_TOKEN: process.env.BOT_TOKEN,
  AAVE_ADDRESSES_PROVIDER: process.env.AAVE_ADDRESSES_PROVIDER
};
