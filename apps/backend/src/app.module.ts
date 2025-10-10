import {
  ArgumentsHost,
  Catch,
  HttpException,
  Logger,
  Module,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import {
  APP_FILTER,
  APP_INTERCEPTOR,
  APP_PIPE,
  BaseExceptionFilter,
} from "@nestjs/core";
import {
  ZodSerializationException,
  ZodSerializerInterceptor,
  ZodValidationPipe,
} from "nestjs-zod";
import { ZodError } from "zod";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DRIZZLE_DB, DrizzleModule } from "./drizzle/drizzle.module";

import { AuthModule } from "@thallesp/nestjs-better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { Db } from "./db/types";
import { ResumeModule } from "./resume/resume.module";
import { RepositoryModule } from "./repositories/repository.module";

@Catch(HttpException)
class HttpExceptionFilter extends BaseExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError();

      if (zodError instanceof ZodError) {
        this.logger.error(`ZodSerializationException: ${zodError.message}`);
      }
    }

    super.catch(exception, host);
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    AuthModule.forRootAsync({
      inject: [DRIZZLE_DB],
      useFactory: (db: Db) => ({
        auth: betterAuth({
          advanced: {
            defaultCookieAttributes: {
              sameSite: "None",
              secure: true,
              partitioned: true,
            },
          },
          database: drizzleAdapter(db, { provider: "pg" }),
          emailAndPassword: {
            enabled: true,
          },
          trustedOrigins: [
            "*localhost*",
            "https://fitted-in-admin.marthayaputra-han.workers.dev",
            "chrome-extension://jhhpmkomkllohgcbjggpjjnlnplimpfj",
          ],
        }),
      }),
    }),
    DrizzleModule,
    RepositoryModule,
    ResumeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
