import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
    private readonly stripe = new Stripe(
        envs.stripeSecret
    )

    // Crear un cliente
  async createCustomer(createCustomerDto: CreateCustomerDto) {
    const { name, email, description } = createCustomerDto;
    const customer = await this.stripe.customers.create({
      name,
      email,
      description,
    });
    return customer.id;
  }

  // Editar un cliente
  async updateCustomer(customerId: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.stripe.customers.update(customerId, updateCustomerDto);
    return customer;
  }

  // Eliminar un cliente
  async deleteCustomer(customerId: string) {
    const deletedCustomer = await this.stripe.customers.del(customerId);
    return deletedCustomer;
  }

  
}
