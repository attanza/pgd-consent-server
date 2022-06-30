import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attachment, AttachmentSchema } from './attachment.schema';
import { AttachmentsService } from './attachments.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Attachment.name, schema: AttachmentSchema }])],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
