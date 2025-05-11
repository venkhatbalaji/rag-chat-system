import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Document } from '../entities/document.entity';
import { Repository } from 'typeorm';
import { Source } from '../../chat/schemas/message.schema';

@Injectable()
export class RetrieverService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
  ) {}

  async search(query: string, topK = 5): Promise<Array<Source>> {
    const results = await this.documentRepo
      .createQueryBuilder('doc')
      .limit(topK)
      .getRawMany();

    return results.map((row) => ({
      snippet: row?.doc_content,
      source: row?.doc_title,
      similarityScore: parseFloat(row?.similarity || 0),
    }));
  }
}
