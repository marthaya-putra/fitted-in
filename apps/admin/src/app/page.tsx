import { ResumeForm } from "@/components/resume-form";
import { serverFetch } from "@/lib/server-fetch";
import { getAuthSession } from "@/lib/auth";

export default async function Home() {
  const session = await getAuthSession();
  const savedResume = await serverFetch(
    `${import.meta.env.VITE_API_URL}/api/resumes/user/${session!.user.id}`
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-accent">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            CV Builder
          </h1>
          <p className="text-muted-foreground">
            Build your professional resume
          </p>
        </div>

        <ResumeForm initialData={savedResume} />
      </div>
    </main>
  );
}
