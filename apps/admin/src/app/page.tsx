import { ResumeForm } from "@/components/resume-upload";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CV Builder</h1>
        </div>

        <ResumeForm />
      </div>
    </main>
  );
}
