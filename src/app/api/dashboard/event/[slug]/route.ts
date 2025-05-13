import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadFileToS3 } from '@/lib/s3';
import { eventsSchema } from '@/schemas/dashboard/events';
import { authLogger } from '@/lib/logger';
import { authenticateRequest } from '@/middleware/auth';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const authResult = await authenticateRequest(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { companyId } = authResult;
  const slug = params.slug;

  authLogger.info('api/dashboard/event/[slug] - Get event by slug request received', {
    companyId,
    slug,
  });

  try {
    const event = await prisma.event.findFirst({
      where: {
        companyId,
        slug,
      },
      include: {
        Address: true,
        EventConfig: true,
      },
    });

    if (!event) {
      return NextResponse.json({ success: false, error: 'Evento não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error: unknown) {
    authLogger.error('api/dashboard/event/[slug] - Failed to fetch event', {
      companyId,
      slug,
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ success: false, error: 'Erro ao buscar evento' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { slug: string } }) {
  const authResult = await authenticateRequest(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { companyId } = authResult;
  const uuid = params.slug;

  authLogger.info('api/dashboard/event/[uuid] - Event update request received', {
    companyId,
    uuid,
  });

  try {
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData.entries());
    const data = {
      ...rawData,
      hasGift: rawData.hasGift === 'true',
      hasPrize: rawData.hasPrize === 'true',
      startDate: new Date(rawData.startDate as string).toISOString(),
      endDate: new Date(rawData.endDate as string).toISOString(),
    };

    const parseResult = eventsSchema.safeParse(data);
    if (!parseResult.success) {
      authLogger.warn('api/dashboard/event/[uuid] - Event validation failed', {
        companyId,
        uuid,
        issues: parseResult.error.issues,
        data,
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

    const validatedData = parseResult.data;

    const existingEvent = await prisma.event.findFirst({
      where: {
        id: uuid,
        companyId,
      },
      include: {
        Address: true,
        EventConfig: true,
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    const file = formData.get('logo') as File;
    const fileBuffer = file ? await file.arrayBuffer() : null;

    const updatedEvent = await prisma.$transaction(async tx => {
      const address = await tx.address.update({
        where: { id: existingEvent.Address.id },
        data: {
          street: validatedData.addressStreet,
          number: validatedData.addressNumber,
          complement: validatedData.addressComplement,
          neighborhood: validatedData.addressNeighborhood,
          city: validatedData.addressCity,
          state: validatedData.addressState,
          country: validatedData.addressCountry,
          zipCode: validatedData.addressZipCode,
        },
      });

      const event = await tx.event.update({
        where: { id: existingEvent.id },
        data: {
          name: validatedData.name,
          description: validatedData.description,
          slug: validatedData.slug,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
        },
      });

      const eventConfig = await tx.eventConfig.update({
        where: { id: existingEvent.EventConfig[0].id },
        data: {
          confirmationType: validatedData.confirmationType,
          hasGift: validatedData.hasGift,
          giftDescription: validatedData.giftDescription || '',
          hasPrize: validatedData.hasPrize,
          prizeDescription: validatedData.prizeDescription || '',
        },
      });

      if (file) {
        const fileKey = `events/${event.id}.${file.name.split('.').pop()}`;
        try {
          const imageUrl = await uploadFileToS3({
            file,
            fileBuffer: fileBuffer!,
            fileKey,
          });

          const updatedEventWithImage = await tx.event.update({
            where: { id: event.id },
            data: {
              imageUrl,
            },
          });

          return {
            ...updatedEventWithImage,
            EventConfig: eventConfig,
            Address: address,
          };
        } catch (error) {
          authLogger.error('api/dashboard/event/[uuid] - Failed to upload event logo to S3', {
            companyId,
            error,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            eventId: event.id,
          });
          throw new Error('Erro ao fazer upload da imagem');
        }
      }

      return { ...event, EventConfig: eventConfig, Address: address };
    });

    authLogger.info('api/dashboard/event/[uuid] - Event updated successfully', {
      companyId,
      eventId: updatedEvent.id,
      eventName: updatedEvent.name,
    });

    return NextResponse.json({
      success: true,
      event: updatedEvent,
    });
  } catch (error: unknown) {
    authLogger.error('api/dashboard/event/[uuid] - Failed to update event', {
      companyId,
      uuid,
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar evento' },
      { status: 500 }
    );
  }
}