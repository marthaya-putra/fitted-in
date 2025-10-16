import { ResumeForm } from "@/components/resume-form";
import { redirect } from "next/navigation";
import { serverFetch } from "@/lib/server-fetch";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";

export default async function Home() {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      credentials: "include",
    },
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const savedResume = await serverFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/resumes/user/${session.user.id}`
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CV Builder</h1>
        </div>

        <ResumeForm initialData={savedResume} />
      </div>
    </main>
  );
}
