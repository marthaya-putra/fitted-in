"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = NonNullable<Parameters<typeof fetch>[1]>;

export async function serverFetch(
  input: FetchInput,
  init?: FetchInit
): Promise<Response> {
  const cookieStore = await cookies();

  const headers = new Headers(init?.headers);

  if (!headers.has("Cookie")) {
    headers.set("Cookie", cookieStore.toString());
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experiences: string;
  educations: string;
  skills: string;
}

export async function parseResume(formData: FormData): Promise<ResumeData> {
  try {
    const file = formData.get("pdf") as File;

    if (!file) {
      throw new Error("No file provided");
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      throw new Error("Please select a PDF file");
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File size must be less than 10MB");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const backendFormData = new FormData();
    backendFormData.append(
      "pdf",
      new Blob([buffer], { type: "application/pdf" }),
      file.name
    );

    const response = await serverFetch(
      "http://localhost:3001/api/resumes/parse",
      {
        method: "POST",
        body: backendFormData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to parse resume");
    }

    const result = await response.json();
    revalidatePath("/");
    return result;
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw error;
  }
}

export async function saveResume(data: ResumeData): Promise<void> {
  try {
    // Transform the data to match the backend API format
    const resumeProfileData = {
      fullName: data.fullName,
      location: data.location,
      email: data.email,
      website: "", // Website is no longer in the flat schema
      phone: data.phone,
      summary: data.summary,
      workExperiences: data.experiences,
      educations: data.educations,
      skills: data.skills,
      userId: 1, // Hardcoded for now - should come from authentication
    };

    const response = await serverFetch("http://localhost:3001/api/resumes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resumeProfileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to save resume profile");
    }

    revalidatePath("/");
  } catch (error) {
    console.error("Error saving resume:", error);
    throw error;
  }
}
