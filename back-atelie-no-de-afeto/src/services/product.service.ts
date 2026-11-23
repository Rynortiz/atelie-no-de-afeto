import { ProductRepository } from "../repositories/product.repository";
import { CategoryRepository } from "../repositories/category.repository";
import { AppError } from "../utils/AppError";
import {
  CreateProductInput,
  UpdateProductInput,
  PaginationQuery,
} from "../types";
import { cache } from "../infra/redis/cache.service";
import { chavesCache, TTL } from "../infra/redis/cache.keys";
import { eventPublisher } from "../infra/events/event.publisher";
import { EVENTOS } from "../infra/events/domain-events";
import { correlacaoAtual } from "../infra/request-context";
import { logger } from "../utils/logger";

const log = logger.com({ fluxo: "catalogo" });

export class ProductService {
  private productRepository = new ProductRepository();
  private categoryRepository = new CategoryRepository();

  async findAll(pagination: PaginationQuery) {
    const chave = chavesCache.listaProdutos(
      pagination as unknown as Record<string, unknown>,
    );

    return cache.getOrSet(chave, TTL.listaProdutos, () =>
      this.productRepository.findAll(pagination),
    );
  }


  async findById(id: string) {
    const chave = chavesCache.produto(id);

    const produto = await cache.getOrSet(chave, TTL.produto, async () => {
      const encontrado = await this.productRepository.findById(id);
      if (!encontrado) throw new AppError("Produto não encontrado.", 404);
      return encontrado;
    });

    return produto;
  }

  async create(input: CreateProductInput) {
    this.validateProductInput(input);
    await this.ensureCategoryExists(input.categoryId);

    const produto = await this.productRepository.create(input);

    await this.invalidarListagens("produto criado");

    await this.publicarMudanca(EVENTOS.PRODUTO_CRIADO, produto);

    return produto;
  }

  async update(id: string, input: UpdateProductInput) {
    this.validateProductInput(input);
    await this.ensureProductExists(id);
    await this.ensureCategoryExists(input.categoryId);

    const produto = await this.productRepository.update(id, input);

    await cache.del(chavesCache.produto(id));
    await this.invalidarListagens("produto atualizado");

    await this.publicarMudanca(EVENTOS.PRODUTO_ATUALIZADO, produto);
    if (typeof input.stock === "number" && input.stock === 0) {
      await eventPublisher.publicar(
        EVENTOS.ESTOQUE_ESGOTADO,
        { produtoId: id, nome: input.name },
        correlacaoAtual(),
      );
    }

    return produto;
  }

  async delete(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new AppError("Produto não encontrado.", 404);

    if (product.orderItems.length > 0) {
      throw new AppError(
        "Não é possível excluir um produto que possui pedidos vinculados.",
        400,
      );
    }

    if (product.imageUrl?.includes("/uploads/")) {
      const fs = await import("fs");
      const path = await import("path");
      const filename = product.imageUrl.split("/uploads/").pop();
      if (filename) {
        const filePath = path.resolve("uploads", path.basename(filename));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }

    await this.productRepository.delete(id);

    await cache.del(chavesCache.produto(id));
    await this.invalidarListagens("produto removido");

    await eventPublisher.publicar(
      EVENTOS.PRODUTO_REMOVIDO,
      { produtoId: id, nome: product.name },
      correlacaoAtual(),
    );
  }


  private async invalidarListagens(motivo: string): Promise<void> {
    const removidas = await cache.delPorPadrao(
      chavesCache.padraoListaProdutos(),
    );

    log.info("Listagens invalidadas", {
      motivo,
      chavesRemovidas: removidas,
      correlacaoId: correlacaoAtual(),
    });
  }

  private async publicarMudanca(
    evento: typeof EVENTOS[keyof typeof EVENTOS],
    produto: { id: string; name: string; categoryId: string; price: unknown; stock: number },
  ): Promise<void> {
    await eventPublisher.publicar(
      evento,
      {
        produtoId: produto.id,
        nome: produto.name,
        categoriaId: produto.categoryId,
        preco: Number(produto.price),
        estoque: produto.stock,
      },
      correlacaoAtual(),
    );
  }

  private validateProductInput(
    input: CreateProductInput | UpdateProductInput,
  ): void {
    if (!input.name?.trim())
      throw new AppError("Nome do produto é obrigatório.", 400);
    if (!input.description?.trim())
      throw new AppError("Descrição é obrigatória.", 400);
    if (input.price <= 0)
      throw new AppError("Preço deve ser maior que zero.", 400);
    if (input.stock < 0)
      throw new AppError("Estoque não pode ser negativo.", 400);
    if (!input.categoryId) throw new AppError("Categoria é obrigatória.", 400);
  }

  private async ensureProductExists(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new AppError("Produto não encontrado.", 404);
  }

  private async ensureCategoryExists(categoryId: string): Promise<void> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) throw new AppError("Categoria não encontrada.", 404);
  }
}