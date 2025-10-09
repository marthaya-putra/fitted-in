"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Upload,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UploadArea } from "@/components/ui/upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { parseResume, saveResume, type ResumeData } from "@/lib/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "./ui/button";

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.email("Invalid email address"),
  phone: z.string(),
  location: z.string(),
  summary: z.string(),
  workExperiences: z.string(),
  educations: z.string(),
  skills: z.string(),
});

interface ResumeFormProps {
  initialData?: ResumeData;
}

export function ResumeForm({ initialData }: ResumeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      location: initialData?.location || "",
      summary: initialData?.summary || "",
      workExperiences: initialData?.workExperiences || "",
      educations: initialData?.educations || "",
      skills: initialData?.skills || "",
    },
    mode: "onChange",
  });

  const { control, handleSubmit, reset } = form;

  const handleFileSelect = async (file: File) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("pdf", file);

        const result = await parseResume(formData);
        const normalized: ResumeData = {
          id: result.id,
          fullName: result.fullName || "",
          email: result.email || "",
          phone: result.phone || "",
          location: result.location || "",
          summary: result.summary || "",
          workExperiences: result.workExperiences || "",
          educations: result.educations || "",
          skills: result.skills || "",
        };
        // Auto-fill form with parsed data
        reset(normalized);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to parse resume"
        );
      }
    });
  };

  const onSubmit = async (data: ResumeData) => {
    setIsSaving(true);
    const dataToSave = { ...data, id: initialData?.id };
    console.log({ dataToSave });
    try {
      await saveResume(dataToSave);
      toast.success("Resume saved successfully!");
    } catch (error) {
      toast.error("Failed to save resume");
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
                Upload CV
              </CardTitle>
              <CardDescription>
                Upload your CV to auto-fill the form
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
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Professional Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Write your professional summary..."
                        className="min-h-[200px] resize-none"
                        value={field.value}
                        onChange={field.onChange}
                      />
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
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={control}
                name="workExperiences"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="List your work experience..."
                        className="min-h-[300px] resize-none"
                        value={field.value}
                        onChange={field.onChange}
                      />
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
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={control}
                name="educations"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="List your education..."
                        className="min-h-[200px] resize-none"
                        value={field.value}
                        onChange={field.onChange}
                      />
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
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Technical Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="List your technical skills..."
                        className="min-h-[200px] resize-none"
                        value={field.value}
                        onChange={field.onChange}
                      />
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
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
