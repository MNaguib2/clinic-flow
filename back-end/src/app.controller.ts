import {
  Controller,
  Get,
  Header,
  Param,
  Session,
  StreamableFile,
} from '@nestjs/common';
import { AppService } from './app.service';
import { LocalFileService } from './core/service/local-file.service';

interface SessionData {
  visits?: number;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly local_file_service: LocalFileService,
  ) {}

  @Get()
  getHello(@Session() session: SessionData): {
    message: string;
    visits: number;
  } {
    session.visits = (session.visits ?? 0) + 1;
    return { message: this.appService.getHello(), visits: session.visits };
  }

  @Get('public/*')
  @Header('X-Content-Type-Options', 'nosniff')
  async read_public_file(@Param('*') file_path: string | string[]) {
    const relative_path = Array.isArray(file_path)
      ? file_path.join('/')
      : file_path;
    const file = await this.local_file_service.read_public(relative_path);

    return new StreamableFile(file, {
      type: relative_path.endsWith('.svg')
        ? 'image/svg+xml'
        : 'application/octet-stream',
      disposition: relative_path.startsWith('global-public/')
        ? 'inline'
        : 'attachment',
    });
  }
}
