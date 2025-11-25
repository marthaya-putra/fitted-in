"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Sparkles } from "lucide-react";

const jobDescriptionSchema = z.object({
  jobDescription: z
    .string()
    .min(50, "Job description must be at least 50 characters")
    .max(5000, "Job description must be less than 5000 characters"),
});

type JobDescriptionFormValues = z.infer<typeof jobDescriptionSchema>;

interface JobDescriptionFormProps {
  onSubmit: (data: JobDescriptionFormValues) => void;
  isLoading?: boolean;
}

export function JobDescriptionForm({ onSubmit, isLoading = false }: JobDescriptionFormProps) {
  const form = useForm<JobDescriptionFormValues>({
    resolver: zodResolver(jobDescriptionSchema),
    defaultValues: {
      jobDescription: "",
    },
  });

  const handleSubmit = (data: JobDescriptionFormValues) => {
    onSubmit(data);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Job Description
        </CardTitle>
        <CardDescription>
          Paste the job description to optimize your resume for this specific role
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="h-full flex flex-col min-h-0">
            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem className="flex-1 flex flex-col min-h-0">
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the complete job description here...

Example:
We are looking for a Senior Software Engineer with 5+ years of experience in React, Node.js, and cloud technologies. You will be responsible for developing and maintaining web applications, working with cross-functional teams, and mentoring junior developers..."
                      className="flex-1 min-h-[200px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include the full job description for best results. The more detailed, the better your resume optimization will be.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-4 pt-4 mt-auto">
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Optimizing Resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Optimize Resume
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isLoading}
              >
                Clear
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}