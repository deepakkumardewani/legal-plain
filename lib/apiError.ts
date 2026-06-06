import { NextResponse } from "next/server";

const DEFAULT_MESSAGE = "Internal server error. Please try again.";

export function serverError(
  label: string,
  error: unknown,
  responseMessage: string = DEFAULT_MESSAGE,
): NextResponse {
  console.error(`${label}:`, {
    message: error instanceof Error ? error.message : "Unknown error",
    name: error instanceof Error ? error.name : "Unknown",
    cause: error instanceof Error ? error.cause : undefined,
    stack: error instanceof Error ? error.stack : undefined,
  });

  return NextResponse.json({ error: responseMessage }, { status: 500 });
}
