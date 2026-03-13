import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ZodSerializerInterceptor, ZodValidationPipe } from "nestjs-zod";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DRIZZLE_DB, DrizzleModule } from "./drizzle/drizzle.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

import { AuthModule } from "@thallesp/nestjs-better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { Db } from "./db/types";
import { ResumeModule } from "./resume/resume.module";
import { RepositoryModule } from "./repositories/repository.module";

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
            "chrome-extension://cocolialcdmiadcimbjdooppfdmgiiad",
            "fittedinmobile://",
            // For development with Expo Go:
            ...(process.env.NODE_ENV === "development"
              ? ["exp://", "exp://**", "exp://192.168.*.*:*/**"]
              : []),
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
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
