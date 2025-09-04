import { NextRequest, NextResponse } from "next/server";

const RUNNER_URL = "http://localhost:5173";

export async function GET(request: NextRequest) {
  try {
    // Check if runner is available
    const healthResponse = await fetch(`${RUNNER_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!healthResponse.ok) {
      throw new Error("Runner not available");
    }

    const healthData = await healthResponse.json();
    
    if (healthData.ok) {
      // Runner is available, return success
      return NextResponse.json({
        status: "online",
        url: RUNNER_URL,
        message: "Preview runner is online"
      });
    } else {
      throw new Error("Runner health check failed");
    }
  } catch (error) {
    // Runner is offline
    return NextResponse.json(
      {
        status: "offline",
        message: "Runner offline - Please start the preview runner",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward request to runner
    const response = await fetch(`${RUNNER_URL}/api/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Runner request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to communicate with runner",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}