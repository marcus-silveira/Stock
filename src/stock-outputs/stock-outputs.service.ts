import { Injectable } from '@nestjs/common';
import { CreateStockOutputDto } from './dto/create-stock-output.dto';
import { NotFoundError } from 'src/utils/errors';
import { error } from 'console';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StockOutputsService {
  constructor(private prismaService: PrismaService) {}

  async create(createStockInputDto: CreateStockOutputDto) {
    const product = await this.prismaService.product.findUnique({
      where: { id: createStockInputDto.product_id },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (product.quantity === 0) {
      throw new NotFoundError('Product out of stock');
    }

    if (
      product.quantity < createStockInputDto.quantity ||
      product.quantity - createStockInputDto.quantity < 0
    ) {
      throw new NotFoundError('Insufficient product quantity');
    }

    // Lock row na tabela de produtos
    const result = await this.prismaService.$transaction([
      this.prismaService.stockInput.create({
        data: {
          productId: createStockInputDto.product_id,
          quantity: createStockInputDto.quantity,
          date: createStockInputDto.date,
        },
      }),
      this.prismaService.product.update({
        where: { id: createStockInputDto.product_id },
        data: {
          quantity: {
            decrement: createStockInputDto.quantity,
          },
        },
      }),
    ]);

    return result[0];
  }
  async findAll() {
    return await this.prismaService.stockOutput.findMany();
  }

  async findOne(id: number) {
    try {
      return await this.prismaService.stockOutput.findUniqueOrThrow({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025')
        throw new NotFoundError(`Stock input with ID ${id} not found`);
    }
    throw error;
  }
}
