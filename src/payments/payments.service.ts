import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(
        envs.stripeSecret
    )

    //Metodo tomar precios
    async searchPrices(productId){
        // Consultar los precios asociados al producto en Stripe
        const prices = await this.stripe.prices.list({
            product: productId, // Filtrar precios por el ID del producto
            active: true, // Solo precios activos
            limit: 1, // Obtener solo un precio
        });
        if (prices.data.length === 0) {
            throw new Error(`No active price found for productId: ${productId}`);
        }

        const price = prices.data[0]; // Obtener el precio activo
        const unitAmount = price.unit_amount; // Cantidad en centavos
        const currency = price.currency; // Moneda asociada al precio

        return {
            unitAmount : unitAmount,
            currency: currency
        }
    }

    async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
        // Se toman los datos
        const { items, customerId } = paymentSessionDto;
    
        // Usar Promise.all para manejar las promesas en paralelo
        const lineItems = await Promise.all(
            items.map(async (item) => {
                const detailsProduct = await this.searchPrices(item.productId);
                return {
                    price_data: {
                        currency: detailsProduct.currency,
                        product_data: {
                            name: item.productId, // Asegúrate de incluir un nombre si es necesario
                        },
                        unit_amount: detailsProduct.unitAmount, // Ya está en centavos
                    },
                    quantity: item.quantity,
                };
            })
        );
    
        const session = await this.stripe.checkout.sessions.create({
            customer: customerId, // Asignar el cliente de Stripe
            line_items: lineItems, // Usar los lineItems construidos
            mode: 'payment', // Configurado para pago único
            success_url: envs.stripeSuccessUrl,
            cancel_url: envs.stripeCancelUrl,
        });
    
        return session;
    }
    


    async stripeWebhook( req: Request, res: Response){
        const sig = req.headers['stripe-signature'];
        //console.log({sig})
        let event: Stripe.Event;
     
        //Real
        const endpointSecret = envs.stripeEndpointSecret;

        try {
            event = this.stripe.webhooks.constructEvent(
                req['rawBody'], 
                sig, 
                endpointSecret,
            );
        } catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
            return ;
        }

        //console.log({event});

        switch(event.type){
            case 'charge.succeeded':

                const chargeSucceeded = event.data.object;
                // TODO: Call our service
                console.log('WEBHOOK')
                console.log({
                    metadata: chargeSucceeded.metadata,
                    orderId : chargeSucceeded.metadata.orderId

                })
                //console.log(event);
            break;

            case 'customer.created':
                const customerCreated = event.data.object;
                console.log({
                    customerId: customerCreated.id
                });
            break;

            case 'customer.updated':
                const customerUpdated = event.data.object;
                console.log({
                    customerId: customerUpdated.id
                });
            break;

            case 'customer.deleted':
                const customerDeleted = event.data.object;
                console.log('Customer Deleted:', customerDeleted);
            break;

            default:
                console.log(`Evento ${ event.type} not handled`);

        }
        return res.status(200).json({sig});
    }
}
