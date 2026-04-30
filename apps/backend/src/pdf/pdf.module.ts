import { Global, Module } from "@nestjs/common";
import { MarkdownToPdfService } from "../resume/services/markdown-to-pdf.service";
import { SupabaseStorageService } from "../resume/services/supabase-storage.service";

@Global()
@Module({
  providers: [MarkdownToPdfService, SupabaseStorageService],
  exports: [MarkdownToPdfService, SupabaseStorageService],
})
export class PdfModule {}
