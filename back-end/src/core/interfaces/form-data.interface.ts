export type MultipartFileType = 'image' | 'document' | 'pdf' | 'any';

export interface MultipartFileRule<T extends object = object> {
  field_name: string | RegExp;
  file_type: MultipartFileType;
  max_size?: number;
  assign_to?: (
    dto: T,
    file: ValidatedMultipartFile,
    field_name: string,
  ) => void;
}

export interface MultipartFormDataOptions<T extends object = object> {
  files?: MultipartFileRule<T>[];
  max_files?: number;
  max_size_total?: number;
  max_size_one?: number;
}

export interface ValidatedMultipartFile {
  field_name: string;
  buffer: Buffer;
  extension: string;
  content_type: string;
}

export interface ValidatedFormData<T extends object> {
  dto: T;
  files: Map<string, ValidatedMultipartFile>;
}

export interface DetectedFileType {
  extension: string;
  content_type: string;
}
