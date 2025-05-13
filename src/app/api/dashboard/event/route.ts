import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadFileToS3 } from '@/lib/s3';
import { eventsSchema } from '@/schemas/dashboard/events';
import { authLogger } from '@/lib/logger';
import { authenticateRequest } from '@/middleware/auth';

export async function POST(request: Request) {
  const authResult = await authenticateRequest(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { companyId } = authResult;

  authLogger.info('api/dashboard/event - Event create request received', {
    companyId,
  });

  const formData = await request.formData();
  const rawData = Object.fromEntries(formData.entries());
  const data = {
    ...rawData,
    hasGift: rawData.hasGift === 'true',
    hasPrize: rawData.hasPrize === 'true',
    startDate: new Date(rawData.startDate as string).toISOString(),
    endDate: new Date(rawData.endDate as string).toISOString(),
  };

  try {
    const parseResult = eventsSchema.safeParse(data);
    if (!parseResult.success) {
      authLogger.warn('api/dashboard/event - Event validation failed', {
        companyId,
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

    const file = formData.get('logo') as File;
    const fileBuffer = file ? await file.arrayBuffer() : null;

    const createdEvent = await prisma.$transaction(async tx => {
      const address = await tx.address.create({
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

      const event = await tx.event.create({
        data: {
          companyId,
          name: validatedData.name,
          description: validatedData.description,
          slug: validatedData.slug,
          imageUrl: '',
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
          addressId: address.id,
        },
      });

      const eventConfig = await tx.eventConfig.create({
        data: {
          eventId: event.id,
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

          const updatedEvent = await tx.event.update({
            where: { id: event.id },
            data: {
              imageUrl,
            },
          });

          return {
            ...updatedEvent,
            EventConfig: eventConfig,
            Address: address,
          };
        } catch (error) {
          authLogger.error('api/dashboard/event - Failed to upload event logo to S3', {
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

    authLogger.info('api/dashboard/event - Event created successfully', {
      companyId,
      eventId: createdEvent.id,
      eventName: createdEvent.name,
    });

    return NextResponse.json({
      success: true,
      event: createdEvent,
    });
  } catch (error: unknown) {
    authLogger.error('api/dashboard/event - Failed to create event', {
      companyId,
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ success: false, error: 'Erro ao criar evento' }, { status: 500 });
  }
}
