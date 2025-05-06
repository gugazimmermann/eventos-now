import { createHmac } from "crypto";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

const requiredEnvVars = {
  AWS_REGION: process.env.AWS_REGION,
  COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
  COGNITO_CLIENT_SECRET: process.env.COGNITO_CLIENT_SECRET,
} as const;

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const env = {
  AWS_REGION: requiredEnvVars.AWS_REGION as string,
  COGNITO_CLIENT_ID: requiredEnvVars.COGNITO_CLIENT_ID as string,
  COGNITO_CLIENT_SECRET: requiredEnvVars.COGNITO_CLIENT_SECRET as string,
};

export function calculateSecretHash(username: string): string {
  const message = username + env.COGNITO_CLIENT_ID;
  const hmac = createHmac('SHA256', env.COGNITO_CLIENT_SECRET);
  hmac.update(message);
  return hmac.digest('base64');
}

export const cognitoClient = new CognitoIdentityProviderClient({
  region: env.AWS_REGION,
}); 