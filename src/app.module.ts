import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/modules/prisma.module';
import { ClienteModule } from './infrastructure/modules/cliente.module';
import { VeiculoModule } from './infrastructure/modules/veiculo.module';
import { AuthModule } from './infrastructure/modules/auth.module';

@Module({
  imports: [PrismaModule, AuthModule, ClienteModule, VeiculoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
