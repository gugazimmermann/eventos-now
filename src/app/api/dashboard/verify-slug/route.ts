import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authLogger } from '@/lib/logger';
import { addMonths } from 'date-fns';
import { authenticateRequest } from '@/middleware/auth';

export async function POST(request: Request) {
  const authResult = await authenticateRequest(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { companyId } = authResult;

  authLogger.info('api/dashboard/verify-slug - Verify slug request received', {
    companyId,
  });

  try {
    const { slug } = await request.json();

    if (!slug) {
      authLogger.warn('api/dashboard/verify-slug - Slug verification attempted without slug', {
        companyId,
      });
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const existingEvent = await prisma.event.findFirst({
      where: {
        slug: slug,
        OR: [
          {
            endDate: {
              gt: new Date(),
            },
          },
          {
            endDate: {
              gte: addMonths(new Date(), -1),
            },
          },
        ],
      },
    });

    authLogger.info('api/dashboard/verify-slug - Slug verification completed', {
      companyId,
      slug,
      exists: !!existingEvent,
    });

    return NextResponse.json({
      exists: !!existingEvent,
    });
  } catch (error) {
    authLogger.error('api/dashboard/verify-slug - Error verifying slug', {
      companyId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
