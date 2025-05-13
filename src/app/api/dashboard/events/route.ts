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

  authLogger.info('api/dashboard/events - Get events request received', {
    companyId,
  });

  try {
    const events = await prisma.event.findMany({
      where: {
        companyId,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error: unknown) {
    authLogger.error('api/dashboard/events - Failed to fetch events', {
      companyId,
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ success: false, error: 'Erro ao buscar eventos' }, { status: 500 });
  }
}
