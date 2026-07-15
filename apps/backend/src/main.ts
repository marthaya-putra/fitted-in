import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { cleanupOpenApiDoc } from "nestjs-zod";
import { ResponseWrapperInterceptor } from "./common/interceptors/response-wrapper.interceptor";

// Global error handlers for non-HTTP errors
process.on("uncaughtException", (error: Error) => {
  console.error(
    `[${new Date().toISOString()}] UNCAUGHT EXCEPTION: ${error.message}`
  );
  console.error("Stack trace:", error.stack);
});

process.on("unhandledRejection", (reason: any) => {
  console.error(
    `[${new Date().toISOString()}] UNHANDLED PROMISE REJECTION:`,
    reason
  );
  if (reason instanceof Error) {
    console.error("Stack trace:", reason.stack);
  }
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: ["error", "warn", "log", "debug", "verbose"],
  });
  app.setGlobalPrefix("api", { exclude: ["health"] });

  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle("Example API")
      .setDescription("Example API description")
      .setVersion("1.0")
      .build()
  );

  SwaggerModule.setup("api", app, cleanupOpenApiDoc(openApiDoc));

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalInterceptors(new ResponseWrapperInterceptor());

  const port = process.env.PORT ?? 3001;
  app.getHttpServer().setTimeout(0);
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
}
void bootstrap();
