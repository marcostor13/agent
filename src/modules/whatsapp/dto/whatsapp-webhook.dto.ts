import { IsString, IsArray, IsOptional, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class WhatsAppMessageDTO {
  @IsString()
  from: string;

  @IsString()
  id: string;

  @IsString()
  timestamp: string;

  @IsObject()
  @IsOptional()
  text?: {
    body: string;
  };

  @IsString()
  type: string;
}

export class WhatsAppContactDTO {
  @IsObject()
  profile: {
    name: string;
  };

  @IsString()
  wa_id: string;
}

export class WhatsAppValueDTO {
  @IsString()
  messaging_product: string;

  @IsObject()
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppContactDTO)
  contacts: WhatsAppContactDTO[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppMessageDTO)
  messages: WhatsAppMessageDTO[];
}

export class WhatsAppChangeDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => WhatsAppValueDTO)
  value: WhatsAppValueDTO;

  @IsString()
  field: string;
}

export class WhatsAppEntryDTO {
  @IsString()
  id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppChangeDTO)
  changes: WhatsAppChangeDTO[];
}

export class WhatsAppWebhookDTO {
  @IsString()
  object: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppEntryDTO)
  entry: WhatsAppEntryDTO[];
}
