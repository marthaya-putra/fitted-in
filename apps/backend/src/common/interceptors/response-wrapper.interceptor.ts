import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { type Request } from "express";

@Injectable()
export class ResponseWrapperInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.headers.accept?.includes("text/event-stream")) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data: unknown) => {
        return { data: data ?? null } as const;
      })
    );
  }
}
