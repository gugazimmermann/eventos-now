import { NextResponse } from 'next/server';
import { ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { calculateSecretHash, cognitoClient } from '@/lib/cognito';
import { cognitoErrorMap } from '@/utils/cognitoErrorMessages';
import { confirmSchema } from '@/schemas/auth/confirm';
import { authLogger } from '@/lib/logger';

export async function POST(request: Request) {
  const data = await request.json();

  authLogger.info('Registration confirmation request received', { data });

  const parseResult = confirmSchema.safeParse(data);
  if (!parseResult.success) {
    authLogger.warn('Registration confirmation validation error', {
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
    const confirmCommand = new ConfirmSignUpCommand({
      ClientId: process.env.AWS_COGNITO_CLIENT_ID!,
      Username: data.email,
      ConfirmationCode: data.code,
      SecretHash: calculateSecretHash(data.email),
    });

    try {
      await cognitoClient.send(confirmCommand);
    } catch (cognitoError: unknown) {
      interface CognitoError {
        name?: string;
        message?: string;
        $metadata?: { httpStatusCode?: number };
        stack?: string;
        [key: string]: unknown;
      }
      const err = cognitoError as CognitoError;
      authLogger.error('Error confirming registration in Cognito', {
        name: err?.name,
        message: err?.message,
        code: err?.$metadata?.httpStatusCode,
        stack: err?.stack,
        details: err,
      });
      throw cognitoError;
    }

    authLogger.info('User successfully confirmed', { email: data.email });
    return NextResponse.json({
      success: true,
      email: data.email,
    });
  } catch (error: unknown) {
    authLogger.error('Confirmation error:', { error });

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
