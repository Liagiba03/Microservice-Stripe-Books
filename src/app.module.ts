import { Module } from '@nestjs/common';
import { PaymentsModule } from './payments/payments.module';
import { CustomersModule } from './customers/customers.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [PaymentsModule, CustomersModule, ProductsModule],
})
export class AppModule {}
