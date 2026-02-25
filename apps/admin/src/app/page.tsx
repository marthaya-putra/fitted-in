import { ResumeForm } from "@/components/resume-form";
import { serverFetch } from "@/lib/server-fetch";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { AuthRedirect } from "@/components/auth-redirect";

// Helper to add timeout to promises
async function withTimeout<T>(
  promise: Promise<T>,
  ms: number
): Promise<T | null> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Timeout")), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch {
    return null;
  } finally {
    clearTimeout(timer!);
  }
}

export default async function Home() {
  let session;
  try {
    const sessionResult = await withTimeout(
      authClient.getSession({
        fetchOptions: {
          headers: await headers(),
          credentials: "include",
        },
      }),
      5000
    );
    session = sessionResult?.data;
  } catch {
    session = null;
  }

  if (!session?.user) {
    return <AuthRedirect to="/sign-in" />;
  }

  const savedResume = await serverFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/resumes/user/${session.user.id}`
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-accent">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">CV Builder</h1>
          <p className="text-muted-foreground">Build your professional resume</p>
        </div>

        <ResumeForm initialData={savedResume} />
      </div>
    </main>
  );
}
