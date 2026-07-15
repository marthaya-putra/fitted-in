import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { createHash } from "node:crypto";
import { PdfGenerationRepository } from "../../repositories/pdf-generation.repository";
import { DRIZZLE_DB } from "../../drizzle/drizzle.module";
import { type Db } from "../../db/types";
import { Inject } from "@nestjs/common";

/**
 * Capability-token guard for the public SSE status endpoint.
 *
 * Why a guard and not an in-handler check: once `@Sse` commits the response,
 * it has already written `writeHead(200, text/event-stream)` (see Nest's
 * `RouterResponseController.sse`). Any error thrown inside the handler or the
 * RxJS pipeline — including a sync throw from an `async` handler — is routed to
 * the stream's `catchError` and emitted as an SSE `event: error`, never a real
 * HTTP status. A guard runs before the route is treated as an SSE response, so
 * its `UnauthorizedException` reaches `AllExceptionsFilter` and returns 401.
 *
 * The route is `@AllowAnonymous()` so the global cookie `AuthGuard` lets it
 * through; this guard re-applies authentication via the per-job token instead.
 */
@Injectable()
export class PdfStatusTokenGuard implements CanActivate {
  constructor(
    private readonly pdfGenerationRepo: PdfGenerationRepository,
    @Inject(DRIZZLE_DB) private readonly db: Db,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      params: { id: string };
      query: { token?: string };
    }>();

    const { id } = request.params;
    const { token } = request.query;

    const tokenHash = createHash("sha256").update(token ?? "").digest("hex");
    const row = await this.pdfGenerationRepo.findById(this.db, id);

    if (!row || row.statusTokenHash !== tokenHash) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
