import { z } from 'zod';
import { txt } from '../../../../lib/text';

const logoUrlSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine(
    (v) => {
      const trimmed = v?.trim() ?? '';
      if (!trimmed) return true;
      if (trimmed.startsWith('data:image/')) return true;
      try {
        const url = new URL(trimmed);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    },
    txt('company.validation.logoUrlInvalid'),
  );

export const companySchema = z.object({
  appName: z.string().min(2, txt('company.validation.appNameMin')),
  appDescription: z.string().max(30, txt('company.validation.appDescMax')).optional(),
  appLogo: logoUrlSchema,
  companyName: z.string().min(2, txt('company.validation.companyNameMin')),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email(txt('company.validation.emailInvalid')).optional().or(z.literal('')),
  website: z.string().optional(),
});
