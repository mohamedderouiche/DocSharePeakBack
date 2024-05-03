import { IsNotEmpty } from 'class-validator';

export class CreateDocumentDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  userEmail: string;

  workspaceName : string;

  note?: string;
}
