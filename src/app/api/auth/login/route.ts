import { NextResponse } from 'next/server';
import { InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { calculateSecretHash, cognitoClient } from '@/lib/cognito';
import { cognitoErrorMap } from '@/utils/cognitoErrorMessages';
import { loginSchema } from '@/schemas/auth/login';
import { authLogger } from '@/lib/logger';

export async function POST(request: Request) {
  const data = await request.json();

  authLogger.info('Login request received', { data });

  const parseResult = loginSchema.safeParse(data);
  if (!parseResult.success) {
    authLogger.warn('Login validation error', { issues: parseResult.error.issues });
    return NextResponse.json(
      {
        success: false,
        error: 'Erro de validação',
        issues: parseResult.error.issues,
      },
      { status: 400 }
    );
  }

  try {
    const loginCommand = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.AWS_COGNITO_CLIENT_ID!,
      AuthParameters: {
        USERNAME: data.email,
        PASSWORD: data.password,
        SECRET_HASH: calculateSecretHash(data.email),
      },
    });

    let authResult;
    try {
      authResult = await cognitoClient.send(loginCommand);
    } catch (cognitoError: unknown) {
      interface CognitoError {
        name?: string;
        message?: string;
        $metadata?: { httpStatusCode?: number };
        stack?: string;
        [key: string]: unknown;
      }
      const err = cognitoError as CognitoError;
      authLogger.error('Error logging in to Cognito', {
        name: err?.name,
        message: err?.message,
        code: err?.$metadata?.httpStatusCode,
        stack: err?.stack,
        details: err,
      });
      throw cognitoError;
    }

    authLogger.info('Login successful', { email: data.email });

    const accessToken = authResult.AuthenticationResult?.AccessToken;

    const response = NextResponse.json({
      success: true,
      email: data.email,
      tokens: authResult.AuthenticationResult,
    });

    if (accessToken) {
      response.cookies.set('eventosnow-auth-token', accessToken, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 72,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    return response;
  } catch (error: unknown) {
    authLogger.error('Login error:', { error });

    if (error instanceof Error) {
      const translated = cognitoErrorMap[error.name] || error.message;
      return NextResponse.json(
        {
          success: false,
          error: translated,
          errorType: error.name,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'An unknown error occurred' },
      { status: 400 }
    );
  }
}
