import { NextRequest, NextResponse } from "next/server";

import {
  getDashboardPayload,
  parseFiltersFromSearchParams,
} from "@/lib/server/dashboard-data";

const CACHE_TTL_MS = 60 * 1000;

type CachedResponse = {
  expiresAt: number;
  payload: Awaited<ReturnType<typeof getDashboardPayload>>;
};

const responseCache = new Map<string, CachedResponse>();

function buildCacheKey(searchParams: URLSearchParams): string {
  const entries = Array.from(searchParams.entries()).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(entries);
}

function pruneExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of responseCache.entries()) {
    if (entry.expiresAt <= now) {
      responseCache.delete(key);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    pruneExpiredCache();

    const cacheKey = buildCacheKey(request.nextUrl.searchParams);
    const cached = responseCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.payload, {
        status: 200,
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=30",
          "X-Dashboard-Cache": "HIT",
        },
      });
    }

    const filters = parseFiltersFromSearchParams(request.nextUrl.searchParams);
    const payload = await getDashboardPayload(filters);

    responseCache.set(cacheKey, {
      payload,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=30",
        "X-Dashboard-Cache": "MISS",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json(
      {
        error: "Failed to load dashboard data",
        details: message,
      },
      { status: 500 }
    );
  }
}
