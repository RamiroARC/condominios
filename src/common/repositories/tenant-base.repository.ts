import { Document, FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

/**
 * Repositorio base multi-tenant. TODO acceso a datos de negocio pasa por aquí,
 * de modo que el filtro `organizationId` se aplica SIEMPRE y no puede olvidarse.
 * Esta es la defensa en profundidad contra fugas de datos entre organizaciones.
 *
 * El `organizationId` proviene del contexto de la petición (extraído del JWT),
 * nunca del body enviado por el cliente.
 *
 * T se restringe a Document (HydratedDocument de cada schema), lo que alinea
 * los tipos de retorno de Mongoose (save/find) con el genérico.
 */
export abstract class TenantBaseRepository<T extends Document> {
  protected constructor(protected readonly model: Model<T>) {}

  /** Inyecta organizationId en cualquier filtro. */
  private scoped(organizationId: string, filter: FilterQuery<T> = {}): FilterQuery<T> {
    return { ...filter, organizationId } as FilterQuery<T>;
  }

  async create(organizationId: string, data: Partial<T>): Promise<T> {
    const doc = new this.model({ ...data, organizationId });
    return doc.save();
  }

  async findById(organizationId: string, id: string): Promise<T | null> {
    return this.model.findOne(this.scoped(organizationId, { _id: id } as FilterQuery<T>)).exec();
  }

  async findByIdOrFail(organizationId: string, id: string): Promise<T> {
    const doc = await this.findById(organizationId, id);
    if (!doc) throw new NotFoundException('Recurso no encontrado');
    return doc;
  }

  async findOne(organizationId: string, filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(this.scoped(organizationId, filter)).exec();
  }

  async find(
    organizationId: string,
    filter: FilterQuery<T> = {},
    options: QueryOptions = {},
  ): Promise<T[]> {
    return this.model.find(this.scoped(organizationId, filter), null, options).exec();
  }

  async count(organizationId: string, filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(this.scoped(organizationId, filter)).exec();
  }

  async paginate(
    organizationId: string,
    filter: FilterQuery<T>,
    page: number,
    pageSize: number,
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<{ items: T[]; total: number }> {
    const scoped = this.scoped(organizationId, filter);
    const [items, total] = await Promise.all([
      this.model
        .find(scoped)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.model.countDocuments(scoped).exec(),
    ]);
    return { items, total };
  }

  async updateById(
    organizationId: string,
    id: string,
    update: UpdateQuery<T>,
  ): Promise<T> {
    const doc = await this.model
      .findOneAndUpdate(this.scoped(organizationId, { _id: id } as FilterQuery<T>), update, {
        new: true,
      })
      .exec();
    if (!doc) throw new NotFoundException('Recurso no encontrado');
    return doc;
  }

  async deleteById(organizationId: string, id: string): Promise<void> {
    const res = await this.model
      .deleteOne(this.scoped(organizationId, { _id: id } as FilterQuery<T>))
      .exec();
    if (res.deletedCount === 0) throw new NotFoundException('Recurso no encontrado');
  }
}
