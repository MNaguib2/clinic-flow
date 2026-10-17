import {
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { appendFile, mkdir } from 'node:fs/promises';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { LocalizedHttpExceptionFilter } from './localized-http-exception.filter';

jest.mock('node:fs/promises', () => ({
  appendFile: jest.fn(),
  mkdir: jest.fn(),
}));

describe('LocalizedHttpExceptionFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(appendFile).mockResolvedValue(undefined);
    jest.mocked(mkdir).mockResolvedValue(undefined);
  });

  it('translates validation messages and error labels using Accept-Language', async () => {
    const reply = jest.fn();
    const response = {};
    const request = { headers: { 'accept-language': 'ar-EG,en;q=0.8' } };
    const host = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;
    const httpAdapterHost = {
      httpAdapter: { reply },
    } as unknown as HttpAdapterHost;
    const filter = new LocalizedHttpExceptionFilter(httpAdapterHost);
    const exception = new BadRequestException({
      statusCode: 400,
      message: ['phone is invalid', 'email must be an email'],
      error: 'Bad Request',
    });

    await filter.catch(exception, host);

    expect(reply).toHaveBeenCalledWith(
      response,
      {
        statusCode: 400,
        message: [
          'رقم الهاتف غير صالح',
          'email يجب أن يكون بريدًا إلكترونيًا صالحًا',
        ],
        error: 'طلب غير صالح',
      },
      400,
    );
  });

  it('writes the URL, redacted request body, and exception details to JSON Lines', async () => {
    const reply = jest.fn();
    const response = {};
    const request = {
      url: '/api/users/login?source=form',
      headers: { 'accept-language': 'en' },
      lastDatabaseQuery:
        'SELECT `User`.`id` FROM `User` WHERE `User`.`phoneNumber` = ?',
      body: {
        phone: '+15551234567',
        password: 'do-not-log-this',
        nested: { confirmPassword: 'also-secret' },
      },
    };
    const host = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;
    const httpAdapterHost = {
      httpAdapter: { reply },
    } as unknown as HttpAdapterHost;
    const filter = new LocalizedHttpExceptionFilter(httpAdapterHost);

    await filter.catch(
      new BadRequestException('Invalid phone or password'),
      host,
    );

    const log_path = (appendFile as jest.Mock).mock.calls[0][0] as string;
    const log_line = (appendFile as jest.Mock).mock.calls[0][1] as string;
    const log_entry: unknown = JSON.parse(log_line);
    expect(log_path).toMatch(/log[\\/]error\.jsonl$/);
    expect(log_entry).toEqual(
      expect.objectContaining({
        url: '/api/users/login?source=form',
        databaseQuery:
          'SELECT `User`.`id` FROM `User` WHERE `User`.`phoneNumber` = ?',
        body: {
          phone: '+15551234567',
          password: '[REDACTED]',
          nested: { confirmPassword: '[REDACTED]' },
        },
        exception: expect.objectContaining({
          name: 'BadRequestException',
          message: 'Invalid phone or password',
          statusCode: 400,
        }),
      }),
    );
    expect(log_line).not.toContain('do-not-log-this');
    expect(log_line).not.toContain('also-secret');
  });
});
