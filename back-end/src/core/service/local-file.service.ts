import {
  BadRequestException,
  Injectable,
  Scope,
} from '@nestjs/common';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  resolve,
  sep,
} from 'node:path';

@Injectable({ scope: Scope.DEFAULT })
export class LocalFileService {
  private readonly upload_root = resolve(
    process.env.UPLOAD_DIR || resolve(process.cwd(), 'uploads'),
  );

  readonly ORGANIZATION_FOLDER = 'organizations';
  readonly CERTIFICATIONS_FOLDER = 'certifications';
  readonly PROFILE_IMAGES_FOLDER = 'profile_images';
  readonly CLINIC_IMAGES_FOLDER = 'clinic_images';
  readonly SPECIALTY_IMAGES_FOLDER = 'specialty_images';

  readonly ORGANIZATION_PREFIX = 'org_';
  readonly CERTIFICATIONS_PREFIX = 'cert_';
  readonly PROFILE_IMAGES_PREFIX = 'profile_';
  readonly CLINIC_IMAGES_PREFIX = 'clinic_';
  readonly SPECIALTY_IMAGES_PREFIX = 'specialty_';

  readonly PATIENTS_FOLDER = 'patients';
  readonly PATIENTS_PREFIX = 'patient_';

  readonly PERMISSIONS_FOLDER = [this.PATIENTS_FOLDER];

  async save(relative_path: string, data: Buffer): Promise<string> {
    const requested_path = this.resolve_path(relative_path);
    const directory = dirname(requested_path);
    const filename = basename(relative_path);
    const extension = extname(filename);
    const name = filename.slice(0, filename.length - extension.length);
    await mkdir(directory, { recursive: true });

    let candidate_path = relative_path;
    let suffix = 0;
    while (true) {
      try {
        await writeFile(this.resolve_path(candidate_path), data, {
          flag: 'wx',
        });
        return candidate_path;
      } catch (error) {
        if (
          typeof error !== 'object' ||
          error === null ||
          !('code' in error) ||
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          ('code' in error && error.code !== 'EEXIST')
        ) {
          throw error;
        }
        candidate_path = join(
          dirname(relative_path),
          `${name}_${suffix}${extension}`,
        );
        suffix += 1;
      }
    }
  }

  async remove(relative_path: string): Promise<void> {
    try {
      await unlink(this.resolve_path(relative_path));
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        return;
      }
      throw error;
    }
  }

  async read_public(relative_path: string): Promise<Buffer> {
    await readFile(this.resolve_path(relative_path));
    throw new Error('Not implemented');
  }

  prepareDirectory(paths: Array<string>): string {
    return join(...paths);
  }

  private resolve_path(relative_path: string): string {
    const file_path = resolve(this.upload_root, relative_path);
    if (
      isAbsolute(relative_path) ||
      !file_path.startsWith(`${this.upload_root}${sep}`)
    ) {
      throw new BadRequestException('Invalid file path');
    }
    return file_path;
  }
}
