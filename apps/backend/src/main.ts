import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { cleanupOpenApiDoc } from "nestjs-zod";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle("Example API")
      .setDescription("Example API description")
      .setVersion("1.0")
      .build()
  );

  SwaggerModule.setup("api", app, cleanupOpenApiDoc(openApiDoc));

  // Enable CORS for frontend development
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global prefix for all routes
  app.setGlobalPrefix("api");

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
}
void bootstrap();
