import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ⚙️ Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Autenticação')
    .setDescription('Documentação da API com JWT, Refresh Token e Users')
    .setVersion('1.0')
    .addBearerAuth() // Adiciona suporte ao token JWT no Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // http://localhost:3000/api

  app.enableCors();
  await app.listen(3000);
}
bootstrap();
