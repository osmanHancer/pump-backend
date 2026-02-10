import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS ayarları - Electron uygulamasından gelen istekleri kabul et
  app.enableCors({
    origin: '*', // Tüm originlere izin ver (production'da daha spesifik olmalı)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
