import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PumpModule } from './pump/pump.module';

@Module({
  imports: [PumpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
