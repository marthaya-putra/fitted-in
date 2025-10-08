import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ResumeModule } from "./resume/resume.module";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { Db, DB } from "./database/types";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule.forRoot({
      connectionString: process.env.DATABASE_URL!,
      ssl: process.env.NODE_ENV === "production",
    }),
    AuthModule.forRootAsync({
      inject: [DB],
      useFactory: (db: Db) => ({
        auth: betterAuth({
          database: drizzleAdapter(db, { provider: "pg" }),
          emailAndPassword: {
            enabled: true,
          },
          trustedOrigins: ["*localhost*"],
        }),
      }),
    }),
    ResumeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
