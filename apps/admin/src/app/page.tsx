"use client";

import { ResumeForm } from "@/components/resume-upload";
import { AuthGuard } from "@/components/auth-guard";

export default function Home() {
  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              CV Builder
            </h1>
          </div>

          <ResumeForm />
        </div>
      </main>
    </AuthGuard>
  );
}
