import { FindOptionsWhere, ObjectLiteral, Repository } from "typeorm";
import { AppDataSource } from "@orm/db";
import { applyProperties } from "@orm/lib/applyProperties";

export class BaseOneTextIdService<T extends ObjectLiteral> {
  protected repository: Repository<T>;

  constructor(entity: { new (): T }) {
    this.repository = AppDataSource.getRepository(entity) as Repository<T>;
  }

  async _get(id: number): Promise<T | null> {
    const where = { id } as unknown as FindOptionsWhere<T>;
    return this.repository.findOne({ where });
  }

  async _getByIdText(id_text: string): Promise<T | null> {
    const where = { id_text } as unknown as FindOptionsWhere<T>;
    return this.repository.findOne({ where });
  }

  async _update(id: number, dto: Partial<T>): Promise<T> {
    let entity = await this._get(id);

    if (!entity) {
      entity = new (this.repository.target as { new (): T })();
    }

    entity = applyProperties(entity, dto);

    return this.repository.save(entity);
  }
}
