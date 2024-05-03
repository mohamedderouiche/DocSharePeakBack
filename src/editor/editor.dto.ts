// editor.dto.ts
export class CreateEditorDto {
  readonly title: string;
  readonly content: string; // Adjust the type based on your data structure
}

export class UpdateEditorDto {
  readonly content: string; // Adjust the type based on your data structure
}
