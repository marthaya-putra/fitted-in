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
  Code2,
  Wrench,
  Save,
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
import { cn } from 'cnfast';

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.email("Invalid email address"),
  phone: z.string(),
  location: z.string(),
  website: z.string().url().or(z.literal("")),
  summary: z.string(),
  workExperiences: z.string(),
  educations: z.string(),
  projects: z.string(),
  skills: z.string(),
});

interface ResumeFormProps {
  initialData?: ResumeData;
}

interface SectionCardProps {
  icon: React.ElementType;
  iconBg?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  className,
}: SectionCardProps) {
  return (
    <Card className={cn("group hover:shadow-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
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
      website: initialData?.website || "",
      summary: initialData?.summary || "",
      workExperiences: initialData?.workExperiences || "",
      educations: initialData?.educations || "",
      projects: initialData?.projects || "",
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
          website: result.website || "",
          summary: result.summary || "",
          workExperiences: result.workExperiences || "",
          educations: result.educations || "",
          projects: result.projects || "",
          skills: result.skills || "",
        };
        reset(normalized);
        toast.success("Resume parsed successfully!");
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Row 1: Upload + Personal Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard icon={Upload} title="Upload CV" description="Upload your CV to auto-fill the form">
            <UploadArea
              onFileSelect={handleFileSelect}
              accept=".pdf"
            />
            {isPending && (
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                Parsing your resume...
              </div>
            )}
          </SectionCard>

          <SectionCard icon={User} title="Personal Information">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>
              <FormField
                control={control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourwebsite.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SectionCard>
        </div>

        {/* Summary — full width */}
        <SectionCard icon={FileText} title="Professional Summary" description="A brief overview of your experience and career goals">
          <FormField
            control={control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Experienced software engineer with 5+ years building scalable web applications..."
                    className="min-h-[120px] resize-none"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </SectionCard>

        {/* Experience — full width */}
        <SectionCard icon={Briefcase} title="Work Experience" description="List your relevant work experience, most recent first">
          <FormField
            control={control}
            name="workExperiences"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Senior Software Engineer — Acme Corp (2022-present)&#10;• Led team of 8 engineers building React microservices&#10;• Reduced load time by 40% through performance optimization"
                    className="min-h-[240px] resize-none"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </SectionCard>

        {/* Education + Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard icon={GraduationCap} title="Education" description="Degrees, certifications, relevant coursework">
            <FormField
              control={control}
              name="educations"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="B.S. Computer Science — MIT (2018)&#10;GPA: 3.8/4.0"
                      className="min-h-[160px] resize-none"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SectionCard>

          <SectionCard icon={Code2} title="Projects" description="Notable projects and side work">
            <FormField
              control={control}
              name="projects"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Open Source CLI Tool — Built a developer productivity tool with 2k+ GitHub stars"
                      className="min-h-[160px] resize-none"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SectionCard>
        </div>

        {/* Skills — full width */}
        <SectionCard icon={Wrench} title="Technical Skills" description="Technologies, tools, and frameworks you're proficient in">
          <FormField
            control={control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="React, TypeScript, Node.js, PostgreSQL, AWS, Docker, Kubernetes, Python, GraphQL"
                    className="min-h-[120px] resize-none"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </SectionCard>

        {/* Sticky save bar */}
        <div className="sticky bottom-6 flex justify-end -mx-6 px-6 pb-2 pt-4 bg-gradient-to-t from-background via-background to-transparent">
          <Button
            type="submit"
            size="lg"
            className="gap-2 shadow-md"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Resume
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
