import { redirect } from "next/navigation";
import { ResumeForm } from "@/components/resume-form";
import { serverFetch } from "@/lib/server-fetch";
import { getAuthSession } from "@/lib/auth";
import { FileText } from "lucide-react";

export default async function Home() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/sign-in");
  }

  const savedResume = await serverFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/resumes/user/${session.user.id}`
  );

  return (
    <>
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Your Resume
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-[52px]">
          Fill in your details or upload an existing CV to get started
        </p>
      </div>

      <ResumeForm initialData={savedResume} />
    </>
  );
}
