'use client'

import { useState, useTransition } from 'react'
import { Upload, FileText, User, Briefcase, GraduationCap, Wrench, Eye, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UploadArea } from '@/components/ui/upload'
import { toast } from 'sonner'
import { parseResume, saveResume, type ResumeData } from '@/lib/actions'
import dynamic from 'next/dynamic'

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface ResumeFormProps {
  initialData?: ResumeData
}

export function ResumeForm({ initialData }: ResumeFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isSaving, setIsSaving] = useState(false)
  const [editModes, setEditModes] = useState({
    summary: true,
    experiences: true,
    educations: true,
    skills: true
  })
  const [formData, setFormData] = useState<ResumeData>(initialData || {
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      website: ''
    },
    resume: {
      summary: '',
      experiences: '',
      educations: '',
      skills: ''
    }
  })

  const toggleEditMode = (field: keyof typeof editModes) => {
    setEditModes(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleFileSelect = async (file: File) => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('pdf', file)

        const result = await parseResume(formData)
        const normalized: ResumeData = {
          personalInfo: {
            fullName: result.personalInfo.fullName || '',
            email: result.personalInfo.email || '',
            phone: result.personalInfo.phone || '',
            location: result.personalInfo.location || '',
            website: result.personalInfo.website || ''
          },
          resume: {
            summary: result.resume.summary || '',
            experiences: result.resume.experiences || '',
            educations: result.resume.educations || '',
            skills: result.resume.skills || ''
          }
        }
        // Auto-fill form with parsed data
        setFormData(normalized);
        toast.success('Resume parsed successfully!')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to parse resume')
      }
    })
  }

  const handleInputChange = (section: keyof ResumeData, field: string, value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value || ''
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await saveResume(formData)
      toast.success('Resume saved successfully!')
    } catch (error) {
      toast.error('Failed to save resume')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Resume
            </CardTitle>
            <CardDescription>
              Upload your existing PDF resume to auto-fill the form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadArea
              onFileSelect={handleFileSelect}
              accept=".pdf"
              className="mb-4"
            />
            {isPending && (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600">Parsing your resume...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal Info Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.personalInfo.fullName}
                onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.personalInfo.email}
                onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.personalInfo.phone}
                onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.personalInfo.location}
                onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                placeholder="New York, NY"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.personalInfo.website}
                onChange={(e) => handleInputChange('personalInfo', 'website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Professional Summary
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => toggleEditMode('summary')}
                className="flex items-center gap-2"
              >
                {editModes.summary ? (
                  <>
                    <Eye className="h-4 w-4" />
                    Preview
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div data-color-mode="light">
              <MDEditor
                value={formData.resume.summary}
                onChange={(value) => handleInputChange('resume', 'summary', value || '')}
                preview={editModes.summary ? 'edit' : 'preview'}
                hideToolbar={false}
                visibleDragbar={false}
                height={200}
                data-color-mode="light"
              />
            </div>
          </CardContent>
        </Card>

        {/* Experience Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work Experience
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => toggleEditMode('experiences')}
                className="flex items-center gap-2"
              >
                {editModes.experiences ? (
                  <>
                    <Eye className="h-4 w-4" />
                    Preview
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div data-color-mode="light">
              <MDEditor
                value={formData.resume.experiences}
                onChange={(value) => handleInputChange('resume', 'experiences', value || '')}
                preview={editModes.experiences ? 'edit' : 'preview'}
                hideToolbar={false}
                visibleDragbar={false}
                height={300}
                data-color-mode="light"
              />
            </div>
          </CardContent>
        </Card>

        {/* Education Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => toggleEditMode('educations')}
                className="flex items-center gap-2"
              >
                {editModes.educations ? (
                  <>
                    <Eye className="h-4 w-4" />
                    Preview
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div data-color-mode="light">
              <MDEditor
                value={formData.resume.educations}
                onChange={(value) => handleInputChange('resume', 'educations', value || '')}
                preview={editModes.educations ? 'edit' : 'preview'}
                hideToolbar={false}
                visibleDragbar={false}
                height={200}
                data-color-mode="light"
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Technical Skills
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => toggleEditMode('skills')}
                className="flex items-center gap-2"
              >
                {editModes.skills ? (
                  <>
                    <Eye className="h-4 w-4" />
                    Preview
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div data-color-mode="light">
              <MDEditor
                value={formData.resume.skills}
                onChange={(value) => handleInputChange('resume', 'skills', value || '')}
                preview={editModes.skills ? 'edit' : 'preview'}
                hideToolbar={false}
                visibleDragbar={false}
                height={200}
                data-color-mode="light"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="text-center">
        <Button
          type="submit"
          size="lg"
          className="px-8"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Master Resume'}
        </Button>
      </div>
    </form>
  )
}