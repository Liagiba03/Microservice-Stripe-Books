import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { CreateProductDto, UpdateProductDto } from './dto/products.dto';

@Injectable()
export class ProductsService {
    private readonly stripe = new Stripe(
        envs.stripeSecret
    )

    //CREAR UN PRODUCTO
    async createProduct(createProductDto: CreateProductDto) {
        const { name, description, price, currency } = createProductDto;
    
        // Crea primero el producto
        const product = await this.stripe.products.create({
            name,
            description,
        });
    
        // Luego crea el precio asociado al producto
        const priceObject = await this.stripe.prices.create({
            unit_amount: Math.round(price * 100), // Convierte el precio a centavos
            currency: currency || 'mxn',
            product: product.id,
        });
    
        // Actualiza el producto para asignar el precio como default_price
        const updatedProduct = await this.stripe.products.update(product.id, {
            default_price: priceObject.id,
        });
    
        return {
            productId: updatedProduct.id, // Producto con el default_price actualizado
            name: updatedProduct.name,
            description: updatedProduct.description,
            price: priceObject.unit_amount,      // Detalles del precio
        };
    }
    

    //EDITAR UN PRODUCTO
    async updateProduct(productId: string, UpdateProductDto: UpdateProductDto) {
        const { name, description, price, currency } = UpdateProductDto;

        // Actualizar solo los campos indicados
        const updatedProduct = await this.stripe.products.update(productId, {
        ...(name && { name }),
        ...(description && { description }),
        });

        // Si se da un nuevo precio, crea uno nuevo vinculado al producto
        let priceObject = null;
        if (price) {
        priceObject = await this.stripe.prices.create({
            unit_amount: Math.round(price * 100), // Convertir el precio a centavos
            currency: currency || 'mxn', // Usa la moneda especificada, por fecto mxn
            product: productId,
        });
        }

        return {
        updatedProduct,
        newPrice: priceObject,
        };
    }

    //ELIMINAR PRODUCTO POR ID
    async deleteProduct(productId: string) {
        try {
          // 1. Archiva el producto en lugar de eliminarlo
          const archivedProduct = await this.stripe.products.update(productId, {
            active: false, // Opcional: Desactivar el producto
          });
      
          return {
            id: archivedProduct.id,
            name: archivedProduct.name,
            deleted: true
          };
        } catch (error) {
          throw new Error(`Failed to archive product: ${error.message}`);
        }
      }
      
      

    //MOSTRAR EL DETALLE DE UN PRODUCTO
    async getProductDetails(productId: string) {
        try {
            // Obtener el producto
            const product = await this.stripe.products.retrieve(productId);
    
            // Si el producto tiene un precio predeterminado
            let priceDetails = null;
            if (product.default_price) {
                // Recuperar el precio usando el ID almacenado en default_price
                priceDetails = await this.stripe.prices.retrieve(
                    product.default_price as string
                );
            }
    
            // Devuelve el producto con detalles del precio
            return {
                productId: product.id,
                name: product.name,
                description: product.description,
                price: priceDetails ? priceDetails.unit_amount / 100 : null, // Devuelve el precio en formato decimal (MXN)
                currency: priceDetails ? priceDetails.currency : null,
            };
        } catch (error) {
            throw new Error(`Failed to retrieve product details: ${error.message}`);
        }
    }
    

    //MOSTRAR TODOS LOS PRODUSTOS
    async getAllProducts(){
        const products = await this.stripe.products.list();
        
        return products.data
    }

}
