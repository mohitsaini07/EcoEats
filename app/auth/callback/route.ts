import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/app";
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Validate redirect URL against open redirects (must be a relative path)
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/app";

  if (error) {
    console.error("Auth callback error:", error, errorDescription);
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("error", errorDescription || error);
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Code exchange failed:", exchangeError.message);
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("error", exchangeError.message);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.redirect(new URL(safeNext, request.url));
  }

  // If no code, redirect to home or login
  return NextResponse.redirect(new URL("/login", request.url));
}

