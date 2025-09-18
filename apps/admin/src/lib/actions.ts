'use server'

import { revalidatePath } from 'next/cache'

export interface ResumeData {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    location: string
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
    // Here you would save to your database
    console.log('Saving resume data:', data)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    revalidatePath('/')
  } catch (error) {
    console.error('Error saving resume:', error)
    throw error
  }
}