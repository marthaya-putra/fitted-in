import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("hello")
  @AllowAnonymous()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("ping")
  @AllowAnonymous()
  ping(): { status: string; timestamp: string } {
    return {
      status: "pong",
      timestamp: new Date().toISOString(),
    };
  }
}
