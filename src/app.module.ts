import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { CondominiumsModule } from './modules/condominiums/condominiums.module';
import { BuildingsModule } from './modules/buildings/buildings.module';
import { ApartmentsModule } from './modules/apartments/apartments.module';
import { PersonsModule } from './modules/persons/persons.module';
import { OccupantsModule } from './modules/occupants/occupants.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { FinanceModule } from './modules/finance/finance.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AssetsModule } from './modules/assets/assets.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { UtilitiesModule } from './modules/utilities/utilities.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuditInterceptor } from './modules/audit/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongoUri'),
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('throttle.ttl')! * 1000,
          limit: config.get<number>('throttle.limit')!,
        },
      ],
    }),
    AuditModule,
    AuthModule,
    OrganizationsModule,
    CondominiumsModule,
    BuildingsModule,
    ApartmentsModule,
    PersonsModule,
    OccupantsModule,
    MaintenanceModule,
    FinanceModule,
    ReservationsModule,
    CommunicationsModule,
    DashboardModule,
    AssetsModule,
    ExpensesModule,
    UtilitiesModule,
  ],
  providers: [
    // JWT global: todo endpoint requiere auth salvo los marcados @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Rate limiting global
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Auditoría automática de handlers marcados con @Auditable
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
