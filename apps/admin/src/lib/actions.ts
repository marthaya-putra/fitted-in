"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { authClient } from "./auth-client";
import { redirect } from "next/navigation";
import { serverFetch } from "./server-fetch";

export interface ResumeData {
  id?: number;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  summary: string;
  workExperiences: string;
  educations: string;
  projects: string;
  skills: string;
}

export async function parseResume(formData: FormData): Promise<ResumeData> {
  try {
    const file = formData.get("pdf") as File;
    if (!file) throw new Error("No file provided");

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      throw new Error("Please select a PDF file");
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File size must be less than 10MB");
    }

    const backendFormData = new FormData();
    backendFormData.append("pdf", file, file.name);

    const res = await serverFetch(
      `${process.env.VITE_API_URL}/api/resumes/parse`,
      {
        method: "POST",
        body: backendFormData,
      }
    );

    revalidatePath("/");
    return res;
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw error;
  }
}

export async function saveResume(data: ResumeData): Promise<void> {
  const { data: sessionData } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!sessionData || !sessionData.user) {
    console.error("User not logged in");
    redirect("/sign-in");
  }

  const resumeProfileData = {
    id: data.id,
    fullName: data.fullName,
    location: data.location,
    email: data.email,
    website: data.website || undefined,
    phone: data.phone,
    summary: data.summary,
    workExperiences: data.workExperiences,
    educations: data.educations,
    projects: data.projects,
    skills: data.skills,
    userId: sessionData.user.id, // Hardcoded for now - should come from authentication
  };

  const res = await serverFetch(
    `${process.env.VITE_API_URL}/api/resumes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resumeProfileData),
    }
  );

  console.log("res from save resume: ", res);

  revalidatePath("/");
}

export async function optimizeResume(jobDescription: string): Promise<ReadableStream> {
  const { data: sessionData } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!sessionData || !sessionData.user) {
    console.error("User not logged in");
    redirect("/sign-in");
  }

  const response = await fetch(
    `${process.env.VITE_API_URL}/api/resumes/optimize`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: (await headers()).get("cookie") || "",
      },
      body: JSON.stringify({ jobDescription }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to optimize resume: ${response.status} - ${errorText}`);
  }

  if (!response.body) {
    throw new Error("No response body from optimization endpoint");
  }

  return response.body;
}
