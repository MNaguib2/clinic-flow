import { describe, expect, it } from 'vitest';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  it('normalizes nested validation errors without exposing target objects', () => {
    const service = new ToastService();

    service.show({
      message: [
        {
          target: { privateValue: 'must not be shown' },
          property: 'organizationLogo',
          constraints: {
            whitelistValidation: 'property organizationLogo should not exist',
            anotherConstraint: 'organizationLogo is not accepted',
          },
        },
        {
          property: 'clinics',
          children: [
            {
              property: '0',
              children: [
                {
                  target: { privateValue: 'must not be shown' },
                  property: 'clinicImage',
                  constraints: {
                    whitelistValidation: 'property clinicImage should not exist',
                  },
                },
              ],
            },
          ],
        },
        {
          property: 'organizationLogo',
          constraints: {
            whitelistValidation: 'property organizationLogo should not exist',
          },
        },
      ],
      error: 'طلب غير صالح',
      statusCode: 400,
    });

    const message = service.messages().at(-1);
    expect(message?.validationSummary).toBe('طلب غير صالح');
    expect(message?.validationErrors).toEqual([
      {
        propertyPath: 'organizationLogo',
        messages: [
          'property organizationLogo should not exist',
          'organizationLogo is not accepted',
        ],
      },
      {
        propertyPath: 'clinics[0].clinicImage',
        messages: ['property clinicImage should not exist'],
      },
    ]);
    expect(message?.details).not.toContain('must not be shown');
  });

  it('keeps ordinary messages on the generic toast path', () => {
    const service = new ToastService();
    service.show({ message: 'Request failed', error: 'Bad Request', statusCode: 400 });

    expect(service.messages().at(-1)?.validationErrors).toBeUndefined();
    expect(service.messages().at(-1)?.details).toContain('Bad Request');
  });
});
