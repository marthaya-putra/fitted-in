import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResumeProfileModule } from './resume-profile/resume-profile.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule.forRoot({
      connectionString: process.env.DATABASE_URL!,
      ssl: process.env.NODE_ENV === 'production',
    }),
    ResumeProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
