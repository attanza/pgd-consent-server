import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TermModule } from '../term/term.module';
import { ConsentController } from './consent.controller';
import { Consent, ConsentSchema } from './consent.schema';
import { ConsentService } from './consent.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Consent.name, schema: ConsentSchema }]),
    TermModule,
  ],
  providers: [ConsentService],
  exports: [ConsentService],
  controllers: [ConsentController],
})
export class ConsentModule {}
