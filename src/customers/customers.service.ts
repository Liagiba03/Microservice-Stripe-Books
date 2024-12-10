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

  //Mostrar el detalle de un customer en especifico
  async getCustomerDetails(customerId: string) {
    try {
        // Obtener el producto
        const customer = await this.stripe.customers.retrieve(customerId);

        // Devuelve el customer con detalles del precio
        return customer;
    } catch (error) {
        throw new Error(`Failed to retrieve product details: ${error.message}`);
    }
}

//Mostrar todos los customers
//MOSTRAR TODOS LOS PRODUSTOS
async getAllCustomers(){
  const customers = await this.stripe.customers.list();
  
  return customers.data
}

  
}
