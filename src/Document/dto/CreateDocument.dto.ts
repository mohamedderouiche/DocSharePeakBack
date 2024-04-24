import { IsNotEmpty } from 'class-validator';

export class CreateDocumentDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  userEmail: string;

  workspaceName : string;

  // Ajouter le champ note dans CreateDocumentDto si nécessaire
  note?: string;
}
