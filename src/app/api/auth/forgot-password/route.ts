import { NextResponse } from 'next/server';
import { ForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { calculateSecretHash, cognitoClient } from '@/lib/cognito';
import { cognitoErrorMap } from '@/utils/cognitoErrorMessages';
import { forgotPasswordSchema } from '@/schemas/auth/forgot-password';
import { authLogger } from '@/lib/logger';

export async function POST(request: Request) {
  const data = await request.json();

  authLogger.info('Password reset code request received', { data });

  const parseResult = forgotPasswordSchema.safeParse(data);
  if (!parseResult.success) {
    authLogger.warn('Password reset code validation error', {
      issues: parseResult.error.issues,
    });
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
    const forgotPasswordCommand = new ForgotPasswordCommand({
      ClientId: process.env.AWS_COGNITO_CLIENT_ID!,
      Username: data.email,
      SecretHash: calculateSecretHash(data.email),
    });

    try {
      await cognitoClient.send(forgotPasswordCommand);
    } catch (cognitoError: unknown) {
      interface CognitoError {
        name?: string;
        message?: string;
        $metadata?: { httpStatusCode?: number };
        stack?: string;
        [key: string]: unknown;
      }
      const err = cognitoError as CognitoError;
      authLogger.error('Error sending password reset code in Cognito', {
        name: err?.name,
        message: err?.message,
        code: err?.$metadata?.httpStatusCode,
        stack: err?.stack,
        details: err,
      });
      throw cognitoError;
    }

    authLogger.info('Password reset code sent successfully', {
      email: data.email,
    });
    return NextResponse.json({
      success: true,
      email: data.email,
    });
  } catch (error: unknown) {
    authLogger.error('Forgot password error:', { error });

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
