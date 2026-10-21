import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LocalFileService } from './core/service/local-file.service';

describe('AppController', () => {
  const original_upload_dir = process.env.UPLOAD_DIR;
  let upload_dir: string;
  let app: NestFastifyApplication;
  let local_file_service: LocalFileService;

  beforeEach(async () => {
    upload_dir = await mkdtemp(join(tmpdir(), 'clinicflow-public-files-'));
    process.env.UPLOAD_DIR = upload_dir;
    local_file_service = new LocalFileService();

    const testing_module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: LocalFileService, useValue: local_file_service },
      ],
    }).compile();

    app = testing_module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.setGlobalPrefix('api');
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
    if (original_upload_dir === undefined) {
      delete process.env.UPLOAD_DIR;
    } else {
      process.env.UPLOAD_DIR = original_upload_dir;
    }
    await rm(upload_dir, { recursive: true, force: true });
  });

  it('serves files from the public upload directory', async () => {
    const content = Buffer.from('public file');
    await local_file_service.save('public/avatars/photo.bin', content);

    const response = await app.getHttpAdapter().getInstance().inject({
      method: 'GET',
      url: '/api/public/avatars/photo.bin',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe('application/octet-stream');
    expect(response.rawPayload).toEqual(content);
  });

  it('serves organization profile images', async () => {
    const content = Buffer.from('profile image');
    await local_file_service.save(
      'organizations/profile_images/profile_42',
      content,
    );

    const response = await app.getHttpAdapter().getInstance().inject({
      method: 'GET',
      url: '/api/public/organizations/profile_images/profile_42',
    });

    expect(response.statusCode).toBe(200);
    expect(response.rawPayload).toEqual(content);
  });

  it('does not serve organization certification files publicly', async () => {
    await local_file_service.save(
      'organizations/certifications/cert_42.pdf',
      Buffer.from('private certificate'),
    );

    const response = await app.getHttpAdapter().getInstance().inject({
      method: 'GET',
      url: '/api/public/organizations/certifications/cert_42.pdf',
    });

    expect(response.statusCode).toBe(404);
  });
});
