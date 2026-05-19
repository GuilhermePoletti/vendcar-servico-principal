import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from '../adapters/in/auth.controller';
import { PrismaUsuarioRepository } from '../adapters/out/prisma-usuario.repository';
import { UsuarioRepositoryPort } from '../../application/ports/out/usuario.repository.port';
import { RegistrarUsuarioUseCase } from '../../application/use-cases/auth/registrar-usuario.use-case';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'vendcar-jwt-secret-dev',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: UsuarioRepositoryPort,
      useClass: PrismaUsuarioRepository,
    },
    RegistrarUsuarioUseCase,
    LoginUseCase,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
