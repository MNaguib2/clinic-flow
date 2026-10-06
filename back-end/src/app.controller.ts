import { Controller, Get, Session } from '@nestjs/common';
import { AppService } from './app.service';

interface SessionData {
  visits?: number;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Session() session: SessionData): {
    message: string;
    visits: number;
  } {
    session.visits = (session.visits ?? 0) + 1;
    return { message: this.appService.getHello(), visits: session.visits };
  }
}
