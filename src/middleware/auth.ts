import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authLogger } from '@/lib/logger';

export type AuthenticatedUser = {
  cognitoId: string;
  companyId: string;
};

export async function authenticateRequest(
  request: Request
): Promise<NextResponse | AuthenticatedUser> {
  const cognitoId = request.headers.get('x-cognito-id');

  if (!cognitoId) {
    authLogger.warn('Cognito ID not found in headers', {
      headers: Object.fromEntries(request.headers.entries()),
    });
    return NextResponse.json({ success: false, error: 'Token não encontrado' }, { status: 401 });
  }

  const user = await prisma.auth.findUnique({
    where: { cognitoId },
    select: { Company: { select: { id: true } } },
  });

  if (!user) {
    authLogger.warn('User not found in database', {
      cognitoId,
    });
    return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 });
  }

  return {
    cognitoId,
    companyId: user.Company[0].id,
  };
}
