import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
@Injectable()
export class MinioClientService {
  constructor(private readonly minio: MinioService) {
    this.logger = new Logger('MinioService');
  }

  private readonly logger: Logger;
  private readonly bucketName = process.env.MINIO_BUCKET_NAME;

  public get client() {
    return this.minio.client;
  }

  public async upload(
    file: Express.Multer.File,
    filename: string,
    bucketName: string = this.bucketName,
  ) {
    try {
      const metaData = {
        'Content-Type': file.mimetype,
      };
      await this.client.putObject(bucketName, filename, file.buffer, file.size, metaData);
    } catch (error) {
      console.log('error', error);
    }
  }

  async delete(objetName: string, bucketName: string = this.bucketName) {
    try {
      await this.client.removeObject(bucketName, objetName);
    } catch (error) {
      throw new BadRequestException('Deleting file error');
    }
  }
}
