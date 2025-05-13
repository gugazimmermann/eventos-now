import { createHmac } from 'crypto';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

const requiredEnvVars = {
  AWS_REGION: process.env.AWS_REGION,
  AWS_COGNITO_CLIENT_ID: process.env.AWS_COGNITO_CLIENT_ID,
  AWS_COGNITO_CLIENT_SECRET: process.env.AWS_COGNITO_CLIENT_SECRET,
} as const;

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const env = {
  AWS_REGION: requiredEnvVars.AWS_REGION as string,
  AWS_COGNITO_CLIENT_ID: requiredEnvVars.AWS_COGNITO_CLIENT_ID as string,
  AWS_COGNITO_CLIENT_SECRET: requiredEnvVars.AWS_COGNITO_CLIENT_SECRET as string,
};

export function calculateSecretHash(username: string): string {
  const message = username + env.AWS_COGNITO_CLIENT_ID;
  const hmac = createHmac('SHA256', env.AWS_COGNITO_CLIENT_SECRET);
  hmac.update(message);
  return hmac.digest('base64');
}

export const cognitoClient = new CognitoIdentityProviderClient({
  region: env.AWS_REGION,
});
