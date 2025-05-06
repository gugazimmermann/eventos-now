import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { authLogger } from "@/lib/logger";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie");
  const match = cookie?.match(/eventosnow-auth-token=([^;]+)/);
  const token = match ? match[1] : null;

  authLogger.info("Request received to get user data", { hasToken: !!token });

  if (!token) {
    authLogger.warn("Token not found in cookie");
    return NextResponse.json(
      { success: false, error: "Token não encontrado" },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.decode(token) as {
      sub?: string;
      email?: string;
    } | null;

    authLogger.info("Token decoded", { decoded });

    if (!decoded || !decoded.sub) {
      authLogger.warn("Invalid token or missing sub");
      return NextResponse.json(
        { success: false, error: "Token inválido" },
        { status: 401 }
      );
    }

    const user = await prisma.auth.findUnique({
      where: {
        cognitoId: decoded.sub,
      },
      select: {
        Company: {
          select: {
            id: true,
            document: true,
            name: true,
            email: true,
            phone: true,
            owner: true,
          },
        },
      },
    });

    if (!user) {
      authLogger.warn("User not found in database", { cognitoId: decoded.sub });
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    authLogger.info("User found successfully", { company: user.Company });

    return NextResponse.json({
      success: true,
      company: user.Company[0],
    });
  } catch (error: unknown) {
    authLogger.error("Error decoding token or fetching user", { error });
    return NextResponse.json(
      { success: false, error: "Erro ao decodificar token" },
      { status: 400 }
    );
  }
}
