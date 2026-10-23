export type FileValidationError = 'type' | 'size';

export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/gif,image/webp';

/** Matches MIME types, wildcards (`image/*`) and extensions (`.pdf`). Empty accept allows all. */
export function matchesAccept(file: File, accept: string): boolean {
  const rules = accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule);
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

export function validateFile(
  file: File,
  options: { accept: string; max_size: number | null },
): FileValidationError | null {
  if (!matchesAccept(file, options.accept)) return 'type';
  if (options.max_size !== null && file.size > options.max_size) return 'size';
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
