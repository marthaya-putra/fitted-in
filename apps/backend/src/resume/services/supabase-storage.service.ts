import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseStorageService {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>("SUPABASE_URL")!,
      this.configService.get<string>("SUPABASE_SERVICE_ROLE_KEY")!
    );
  }

  async upload(path: string, buffer: Buffer): Promise<void> {
    const { error } = await this.supabase.storage
      .from("resumes")
      .upload(path, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }
  }

  async getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from("resumes")
      .createSignedUrl(path, expiresIn);

    if (error || !data) {
      throw new Error(
        `Signed URL generation failed: ${error?.message ?? "no data"}`
      );
    }

    return data.signedUrl;
  }
}
