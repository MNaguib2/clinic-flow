import { BadRequestException, Injectable } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { extname } from 'node:path';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type {
  DetectedFileType,
  MultipartFormDataOptions,
  ValidatedFormData,
  ValidatedMultipartFile,
} from '../interfaces/form-data.interface';

@Injectable()
export class FormDataService {
  async parseAndValidate<T extends object>(
    request: FastifyRequest,
    dto_class: new () => T,
    options: MultipartFormDataOptions<T> = {},
  ): Promise<ValidatedFormData<T>> {
    let raw_data: string | undefined;
    let total_file_size = 0;
    const files = new Map<string, ValidatedMultipartFile>();
    const file_rules = new Map<
      string,
      NonNullable<MultipartFormDataOptions<T>['files']>[number]
    >();

    for await (const part of request.parts()) {
      if (part.type === 'field') {
        if (part.fieldname !== 'data' || raw_data !== undefined) {
          throw new BadRequestException('Only one data field is accepted');
        }
        if (typeof part.value !== 'string') {
          throw new BadRequestException('Form data must be JSON');
        }
        raw_data = part.value;
        continue;
      }

      const rule = options.files?.find((candidate) =>
        typeof candidate.field_name === 'string'
          ? candidate.field_name === part.fieldname
          : candidate.field_name.test(part.fieldname),
      );
      if (!rule) {
        throw new BadRequestException('Unexpected file field');
      }
      if (files.has(part.fieldname)) {
        throw new BadRequestException('Only one file is allowed per field');
      }
      if (options.max_files !== undefined && files.size >= options.max_files) {
        throw new BadRequestException('Too many files uploaded');
      }

      const buffer = await part.toBuffer();
      const max_size_one = [rule.max_size, options.max_size_one]
        .filter((size): size is number => size !== undefined)
        .reduce((max_size, size) => Math.min(max_size, size), Infinity);
      if (buffer.length > max_size_one) {
        throw new BadRequestException('Uploaded file is too large');
      }
      total_file_size += buffer.length;
      if (
        options.max_size_total !== undefined &&
        total_file_size > options.max_size_total
      ) {
        throw new BadRequestException('Total uploaded files are too large');
      }

      const detected_type = detect_file_type(buffer);
      const file_type =
        detected_type ??
        (rule.file_type === 'any'
          ? unknown_file_type(part.filename)
          : undefined);
      if (
        !file_type ||
        (rule.file_type === 'image' &&
          file_type.content_type === 'application/pdf') ||
        (rule.file_type === 'pdf' &&
          file_type.content_type !== 'application/pdf')
      ) {
        throw new BadRequestException(
          rule.file_type === 'image'
            ? 'File must be a JPEG, PNG, GIF, or WebP image'
            : rule.file_type === 'pdf'
              ? 'File must be a PDF'
              : 'File must be a PDF or supported image',
        );
      }

      files.set(part.fieldname, {
        field_name: part.fieldname,
        buffer,
        ...file_type,
      });
      file_rules.set(part.fieldname, rule);
    }

    if (raw_data === undefined) {
      throw new BadRequestException('Form data is required');
    }

    let parsed_data: unknown;
    try {
      parsed_data = JSON.parse(raw_data);
    } catch {
      throw new BadRequestException('Form data must be valid JSON');
    }
    if (
      typeof parsed_data !== 'object' ||
      parsed_data === null ||
      Array.isArray(parsed_data)
    ) {
      throw new BadRequestException('Form data must be a JSON object');
    }

    const dto = plainToInstance(dto_class, parsed_data);
    const validation_errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (validation_errors.length) {
      throw new BadRequestException(validation_errors);
    }

    for (const [field_name, file] of files) {
      file_rules.get(field_name)?.assign_to?.(dto, file, field_name);
    }

    return { dto, files };
  }
}

function detect_file_type(data: Buffer): DetectedFileType | undefined {
  if (
    data.length >= 3 &&
    data[0] === 0xff &&
    data[1] === 0xd8 &&
    data[2] === 0xff
  ) {
    return { extension: 'jpg', content_type: 'image/jpeg' };
  }
  if (
    data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    return { extension: 'png', content_type: 'image/png' };
  }
  if (
    data.length >= 12 &&
    data.toString('ascii', 0, 4) === 'RIFF' &&
    data.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { extension: 'webp', content_type: 'image/webp' };
  }
  if (data.toString('ascii', 0, 6).match(/^GIF8[79]a$/)) {
    return { extension: 'gif', content_type: 'image/gif' };
  }
  if (data.toString('ascii', 0, 5) === '%PDF-') {
    return { extension: 'pdf', content_type: 'application/pdf' };
  }
  return undefined;
}

function unknown_file_type(filename: string): DetectedFileType {
  const extension = extname(filename).toLowerCase();
  return {
    extension: /^\.[a-z0-9]{1,10}$/.test(extension)
      ? extension.slice(1)
      : 'bin',
    content_type: 'application/octet-stream',
  };
}
