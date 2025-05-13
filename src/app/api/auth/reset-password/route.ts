import { NextResponse } from 'next/server';
import { ConfirmForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { calculateSecretHash, cognitoClient } from '@/lib/cognito';
import { cognitoErrorMap } from '@/utils/cognitoErrorMessages';
import { resetPasswordSchema } from '@/schemas/auth/reset-password';
import { authLogger } from '@/lib/logger';

export async function POST(request: Request) {
  const data = await request.json();

  authLogger.info('Password reset request received', { data });

  const parseResult = resetPasswordSchema.safeParse(data);
  if (!parseResult.success) {
    authLogger.warn('Reset password validation error', { issues: parseResult.error.issues });
    return NextResponse.json(
      {
        success: false,
        error: 'Erro de validação',
        issues: parseResult.error.issues,
      },
      { status: 400 }
    );
  }

  const { email, password, repeatPassword, code } = parseResult.data;

  if (!email || !password || !repeatPassword || !code) {
    return NextResponse.json(
      {
        success: false,
        error: 'Todos os campos são obrigatórios (email, password, repeatPassword, code)',
      },
      { status: 400 }
    );
  }

  if (password !== repeatPassword) {
    return NextResponse.json(
      {
        success: false,
        error: 'As senhas não coincidem',
      },
      { status: 400 }
    );
  }

  try {
    const confirmForgotPasswordCommand = new ConfirmForgotPasswordCommand({
      ClientId: process.env.AWS_COGNITO_CLIENT_ID!,
      Username: email,
      ConfirmationCode: code,
      Password: password,
      SecretHash: calculateSecretHash(email),
    });

    try {
      await cognitoClient.send(confirmForgotPasswordCommand);
    } catch (cognitoError: unknown) {
      interface CognitoError {
        name?: string;
        message?: string;
        $metadata?: { httpStatusCode?: number };
        stack?: string;
        [key: string]: unknown;
      }
      const err = cognitoError as CognitoError;
      authLogger.error('Error confirming password reset in Cognito', {
        name: err?.name,
        message: err?.message,
        code: err?.$metadata?.httpStatusCode,
        stack: err?.stack,
        details: err,
      });
      throw cognitoError;
    }

    authLogger.info('Password changed successfully', { email });
    return NextResponse.json({
      success: true,
      email,
    });
  } catch (error: unknown) {
    authLogger.error('Reset password error:', { error });

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
