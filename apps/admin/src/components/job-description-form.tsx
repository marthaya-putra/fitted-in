"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  jobDescription: z.string().min(1, "Job description is required"),
});

type JobDescriptionFormValues = z.infer<typeof jobDescriptionSchema>;

interface JobDescriptionFormProps {
  onSubmit: (data: JobDescriptionFormValues) => void;
  isLoading?: boolean;
}

export function JobDescriptionForm({
  onSubmit,
  isLoading = false,
}: JobDescriptionFormProps) {
  const form = useForm<JobDescriptionFormValues>({
    resolver: zodResolver(jobDescriptionSchema),
    defaultValues: {
      jobDescription: "",
    },
    mode: "onChange",
  });

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          Job Description
        </CardTitle>
        <CardDescription>
          Paste the job description to optimize your resume for this specific role
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full min-h-0"
          >
            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem className="flex-1 flex flex-col min-h-0">
                  <FormLabel className="flex-shrink-0">Job Description</FormLabel>
                  <FormControl className="flex-1 min-h-0">
                    <Textarea
                      placeholder="Paste the complete job description here...

Example:
We are looking for a Senior Software Engineer with 5+ years of experience in React, Node.js, and cloud technologies..."
                      className="h-full min-h-0 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="flex-shrink-0">
                    Include the full job description for best results.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-3 pt-4 mt-auto">
              <Button type="submit" disabled={isLoading} className="flex-1 gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
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
