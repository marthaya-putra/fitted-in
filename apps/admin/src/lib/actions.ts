'use server'

import { revalidatePath } from 'next/cache'

export interface ResumeData {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    location: string
    website: string
  }
  resume: {
    summary: string
    experiences: string
    educations: string
    skills: string
  }
}

export async function parseResume(formData: FormData): Promise<ResumeData> {
  try {
    const file = formData.get('pdf') as File

    if (!file) {
      throw new Error('No file provided')
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Please select a PDF file')
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB')
    }

    // Convert File to Buffer for the backend API
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create FormData for the backend
    const backendFormData = new FormData()
    backendFormData.append('pdf', new Blob([buffer], { type: 'application/pdf' }), file.name)

    const response = await fetch('http://localhost:3001/parse-resume', {
      method: 'POST',
      body: backendFormData,
    })

    if (!response.ok) {
      throw new Error('Failed to parse resume')
    }

    const result = await response.json()
    revalidatePath('/')
    return result
  } catch (error) {
    console.error('Error parsing resume:', error)
    throw error
  }
}

export async function saveResume(data: ResumeData): Promise<void> {
  try {
    // Transform the data to match the backend API format
    const resumeProfileData = {
      fullName: data.personalInfo.fullName,
      location: data.personalInfo.location,
      email: data.personalInfo.email,
      website: data.personalInfo.website,
      phone: data.personalInfo.phone,
      summary: data.resume.summary,
      workExperiences: data.resume.experiences,
      educations: data.resume.educations,
      technicalSkills: data.resume.skills,
      accountId: 1 // Hardcoded for now - should come from authentication
    }

    const response = await fetch('http://localhost:3001/resume-profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resumeProfileData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to save resume profile')
    }

    revalidatePath('/')
  } catch (error) {
    console.error('Error saving resume:', error)
    throw error
  }
}