import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";

export async function POST(req: NextRequest) {
  const { data: sessionData } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!sessionData || !sessionData.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const { jobDescription } = body;

  const backendResponse = await fetch(
    `${import.meta.env.VITE_API_URL}/api/resumes/optimize`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: (await headers()).get("cookie") || "",
      },
      body: JSON.stringify({ jobDescription }),
    }
  );

  if (!backendResponse.ok) {
    const errorText = await backendResponse.text();
    return new Response(
      JSON.stringify({
        error: `Failed to optimize resume: ${backendResponse.status} - ${errorText}`,
      }),
      {
        status: backendResponse.status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!backendResponse.body) {
    return new Response(
      JSON.stringify({ error: "No response body from optimization endpoint" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Create a ReadableStream from the backend response
  const reader = backendResponse.body.getReader();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            break;
          }
          controller.enqueue(value);
        }
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      reader.cancel();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
