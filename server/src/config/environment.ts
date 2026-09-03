import dotenv from 'dotenv';

dotenv.config();

const defaultAllowedOrigins = ['http://localhost:4200','https://al-project-fe.vercel.app'];

const parseClientUrls = () => {
  const raw = process.env.CLIENT_URL || '';

  return raw
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)
    .concat(defaultAllowedOrigins)
    .filter((value, index, self) => self.indexOf(value) === index);
};

export const config = {
  port: process.env.PORT || 8500,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrls: parseClientUrls(),
  isDevelopment: process.env.NODE_ENV !== 'production',
};
