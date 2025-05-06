import { NextResponse } from "next/server";
import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import prisma from "@/lib/prisma";
import { calculateSecretHash, cognitoClient } from "@/lib/cognito";
import { registerSchema } from "@/schemas/auth/register";
import { authLogger } from "@/lib/logger";
import { cognitoErrorMap } from "@/utils/cognitoErrorMessages";

export async function POST(request: Request) {
  const data = await request.json();

  authLogger.info("Registration request received", { data });

  const parseResult = registerSchema.safeParse(data);
  if (!parseResult.success) {
    authLogger.warn("Registration validation error", { issues: parseResult.error.issues });
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro de validação",
        issues: parseResult.error.issues 
      }, 
      { status: 400 }
    );
  }

  try {
    const signUpCommand = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: data.email,
      Password: data.password,
      SecretHash: calculateSecretHash(data.email),
    });

    let cognitoResponse;
    try {
      cognitoResponse = await cognitoClient.send(signUpCommand);
    } catch (cognitoError: unknown) {
      interface CognitoError {
        name?: string;
        message?: string;
        $metadata?: { httpStatusCode?: number };
        stack?: string;
        [key: string]: unknown;
      }
      const err = cognitoError as CognitoError;
      authLogger.error("Error registering user in Cognito", {
        name: err?.name,
        message: err?.message,
        code: err?.$metadata?.httpStatusCode,
        stack: err?.stack,
        details: err,
      });
      throw cognitoError;
    }

    const cognitoId = cognitoResponse.UserSub;

    if (!cognitoId) {
      authLogger.warn("Failed to get Cognito User ID");
      throw new Error('Failed to get Cognito User ID');
    }

    const user = await prisma.auth.create({
      data: {
        cognitoId,
        Company: {
          create: {
            name: data.companyName,
            document: data.companyDocument,
            phone: data.companyPhone,
            owner: data.companyOwner,
            email: data.email,
            Address: {
              create: {
                street: data.addressStreet,
                number: data.addressNumber,
                complement: data.addressComplement,
                neighborhood: data.addressNeighborhood,
                city: data.addressCity,
                state: data.addressState,
                country: data.addressCountry,
                zipCode: data.addressZipCode,
              },
            },
          },
        },
      },
    });

    authLogger.info("User registered successfully", { user });
    return NextResponse.json({ 
      success: true, 
      email: data.email,
    });
  } catch (error: unknown) {
    authLogger.error('Registration error:', { error });
    
    if (error instanceof Error) {
      const translated = cognitoErrorMap[error.name] || error.message;
      return NextResponse.json(
        { 
          success: false, 
          error: translated,
          errorType: error.name 
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
