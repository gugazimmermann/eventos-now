import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authLogger } from '@/lib/logger';
import { authenticateRequest } from '@/middleware/auth';

export async function GET(request: Request) {
  const authResult = await authenticateRequest(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { companyId } = authResult;

  authLogger.info('api/dashboard/me - /me request received', {
    companyId,
  });

  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        document: true,
        name: true,
        email: true,
        phone: true,
        owner: true,
      },
    });

    return NextResponse.json({
      success: true,
      company,
    });
  } catch (error) {
    authLogger.error('api/dashboard/me - Error fetching user', { error });
    return NextResponse.json({ success: false, error: 'Erro ao buscar usuário' }, { status: 400 });
  }
}
