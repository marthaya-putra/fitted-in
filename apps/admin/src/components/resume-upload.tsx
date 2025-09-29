'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Upload,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Eye,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UploadArea } from '@/components/ui/upload';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { parseResume, saveResume, type ResumeData } from '@/lib/actions';
import dynamic from 'next/dynamic';

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const formSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string(),
  location: z.string(),
  summary: z.string(),
  experiences: z.string(),
  educations: z.string(),
  skills: z.string(),
});

interface ResumeFormProps {
  initialData?: ResumeData;
}

export function ResumeForm({ initialData }: ResumeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [editModes, setEditModes] = useState({
    summary: true,
    experiences: true,
    educations: true,
    skills: true,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      experiences: '',
      educations: '',
      skills: '',
    },
  });

  const { control, handleSubmit, setValue } = form;

  const toggleEditMode = (field: keyof typeof editModes) => {
    setEditModes(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleFileSelect = async (file: File) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('pdf', file);

        const result = await parseResume(formData);
        const normalized: ResumeData = {
          fullName: result.fullName || '',
          email: result.email || '',
          phone: result.phone || '',
          location: result.location || '',
          summary: result.summary || '',
          experiences: result.experiences || '',
          educations: result.educations || '',
          skills: result.skills || '',
        };
        // Auto-fill form with parsed data
        Object.entries(normalized).forEach(([key, value]) => {
          setValue(key as keyof ResumeData, value);
        });
        toast.success('Resume parsed successfully!');
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to parse resume'
        );
      }
    });
  };

  const onSubmit = async (data: ResumeData) => {
    setIsSaving(true);

    try {
      await saveResume(data);
      toast.success('Resume saved successfully!');
    } catch (error) {
      toast.error('Failed to save resume');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                  <p className="mt-2 text-sm text-gray-600">
                    Parsing your resume...
                  </p>
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
              <FormField
                control={control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="New York, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Summary</FormLabel>
                    <FormControl>
                      <div data-color-mode="light">
                        <MDEditor
                          value={field.value}
                          onChange={field.onChange}
                          preview={editModes.summary ? 'edit' : 'preview'}
                          hideToolbar={false}
                          visibleDragbar={false}
                          height={200}
                          data-color-mode="light"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={control}
                name="experiences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Experience</FormLabel>
                    <FormControl>
                      <div data-color-mode="light">
                        <MDEditor
                          value={field.value}
                          onChange={field.onChange}
                          preview={editModes.experiences ? 'edit' : 'preview'}
                          hideToolbar={false}
                          visibleDragbar={false}
                          height={300}
                          data-color-mode="light"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={control}
                name="educations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education</FormLabel>
                    <FormControl>
                      <div data-color-mode="light">
                        <MDEditor
                          value={field.value}
                          onChange={field.onChange}
                          preview={editModes.educations ? 'edit' : 'preview'}
                          hideToolbar={false}
                          visibleDragbar={false}
                          height={200}
                          data-color-mode="light"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technical Skills</FormLabel>
                    <FormControl>
                      <div data-color-mode="light">
                        <MDEditor
                          value={field.value}
                          onChange={field.onChange}
                          preview={editModes.skills ? 'edit' : 'preview'}
                          hideToolbar={false}
                          visibleDragbar={false}
                          height={200}
                          data-color-mode="light"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="text-center">
          <Button type="submit" size="lg" className="px-8" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
