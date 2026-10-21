import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
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

  readonly ORGANIZATION_PREFIX = 'org_';
  readonly CERTIFICATIONS_PREFIX = 'cert_';
  readonly PROFILE_IMAGES_PREFIX = 'profile_';

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

  async read_public(relative_path: string): Promise<Buffer> {
    const profile_images_path = join(
      this.ORGANIZATION_FOLDER,
      this.PROFILE_IMAGES_FOLDER,
    );
    if (
      relative_path.startsWith(`${this.ORGANIZATION_FOLDER}${sep}`) &&
      !relative_path.startsWith(`${profile_images_path}${sep}`)
    ) {
      throw new NotFoundException('File not found');
    }
    const upload_path = relative_path.startsWith(`${profile_images_path}${sep}`)
      ? relative_path
      : join('public', relative_path);
    const file_path = resolve(this.upload_root, upload_path);
    const allowed_roots = [
      resolve(this.upload_root, 'public'),
      resolve(
        this.upload_root,
        this.ORGANIZATION_FOLDER,
        this.PROFILE_IMAGES_FOLDER,
      ),
    ];
    if (
      isAbsolute(relative_path) ||
      !allowed_roots.some((allowed_root) =>
        file_path.startsWith(`${allowed_root}${sep}`),
      )
    ) {
      throw new NotFoundException('File not found');
    }

    try {
      return await readFile(
        this.resolve_path(relative(this.upload_root, file_path)),
      );
    } catch (error) {
      const is_missing_file =
        error instanceof Error &&
        'code' in error &&
        (error as NodeJS.ErrnoException).code === 'ENOENT';
      if (is_missing_file) {
        throw new NotFoundException('File not found');
      }
      throw error;
    }
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
