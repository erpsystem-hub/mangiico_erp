import React, { useState } from 'react';
import { txt } from '../../../../lib/text';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  Save, Building2, MapPin, Phone, Mail, Globe, Image as ImageIcon, Link2,
} from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import { companySchema } from '../core/schema';
import type { CompanyFormValues } from '../core/types';
import { useCan } from '@/hooks/use-can';
import { cn } from '@/lib/utils';

export interface ThongTinToChucFormProps {
  initialValues: CompanyFormValues;
  onSubmit: (data: CompanyFormValues) => void;
}

const ThongTinToChucForm: React.FC<ThongTinToChucFormProps> = ({ initialValues, onSubmit }) => {
  const canEdit = useCan('edit', 'company');
  const [logoLoadError, setLogoLoadError] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      appName: initialValues.appName,
      appDescription: initialValues.appDescription ?? '',
      appLogo: initialValues.appLogo ?? '',
      companyName: initialValues.companyName,
      address: initialValues.address ?? '',
      phone: initialValues.phone ?? '',
      email: initialValues.email ?? '',
      website: initialValues.website ?? '',
    },
  });

  const logoUrl = watch('appLogo')?.trim() ?? '';
  const showPreview = Boolean(logoUrl) && !logoLoadError;

  const onFormSubmit = async (data: CompanyFormValues) => {
    if (!canEdit) return;
    const trimmedLogo = data.appLogo?.trim() ?? '';
    await onSubmit({ ...data, appLogo: trimmedLogo });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="min-w-0">
      <fieldset disabled={!canEdit} className="grid grid-cols-1 md:grid-cols-3 gap-6 border-0 p-0 m-0 min-w-0 disabled:opacity-80">
      <div className="md:col-span-1 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-5 rounded-xl border border-border shadow-sm"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" /> {txt('company.brandSection')}
          </h3>

          <div className="space-y-4">
            <div
              className={cn(
                'flex flex-col items-center justify-center gap-3 p-6 border border-dashed rounded-xl bg-muted/50',
                logoLoadError && logoUrl ? 'border-destructive/50' : 'border-border',
              )}
            >
              {showPreview ? (
                <img
                  src={logoUrl}
                  alt="App Logo"
                  className="h-24 w-24 object-contain"
                  loading="lazy"
                  onLoad={() => setLogoLoadError(false)}
                  onError={() => setLogoLoadError(true)}
                />
              ) : (
                <div className="h-24 w-24 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                  <ImageIcon size={32} />
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                {logoLoadError && logoUrl
                  ? txt('company.logoLoadError')
                  : showPreview
                    ? logoUrl
                    : txt('company.logoPreviewEmpty')}
              </p>
            </div>

            <div className="space-y-1">
              <Input
                label={txt('company.logoUrl')}
                placeholder={txt('company.logoUrlPlaceholder')}
                icon={<Link2 className="w-4 h-4 text-muted-foreground" />}
                {...register('appLogo', {
                  onChange: () => setLogoLoadError(false),
                })}
                error={errors.appLogo?.message}
              />
              <p className="text-xs text-muted-foreground italic">{txt('company.logoUrlHint')}</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <Input
                  label={txt('company.appName')}
                  placeholder={txt('company.appNamePlaceholder')}
                  {...register('appName')}
                  error={errors.appName?.message}
                />
                <p className="text-xs text-muted-foreground italic">{txt('company.appNameHint')}</p>
              </div>
              <div className="space-y-1">
                <Input
                  label={txt('company.appDescription')}
                  placeholder={txt('company.appDescPlaceholder')}
                  {...register('appDescription')}
                  error={errors.appDescription?.message}
                />
                <p className="text-xs text-muted-foreground italic">{txt('company.appDescHint')}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="md:col-span-2 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-5 rounded-xl border border-border shadow-sm"
        >
          <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-3">
            <Building2 className="w-4 h-4 text-muted-foreground" /> {txt('company.legalSection')}
          </h3>

          <div className="grid gap-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Input
                  label={txt('company.companyName')}
                  placeholder={txt('company.companyNamePlaceholder')}
                  icon={<Building2 className="w-4 h-4 text-muted-foreground" />}
                  {...register('companyName')}
                  error={errors.companyName?.message}
                />
              </div>
              <Input
                label={txt('company.phone')}
                placeholder={txt('company.phonePlaceholder')}
                icon={<Phone className="w-4 h-4 text-muted-foreground" />}
                {...register('phone')}
                error={errors.phone?.message}
              />
              <Input
                label={txt('company.email')}
                placeholder={txt('company.emailPlaceholder')}
                icon={<Mail className="w-4 h-4 text-muted-foreground" />}
                {...register('email')}
                error={errors.email?.message}
              />
              <Input
                label={txt('company.website')}
                placeholder={txt('company.websitePlaceholder')}
                icon={<Globe className="w-4 h-4 text-muted-foreground" />}
                {...register('website')}
                error={errors.website?.message}
              />
              <div className="md:col-span-2">
                <Input
                  label={txt('company.address')}
                  placeholder={txt('company.addressPlaceholder')}
                  icon={<MapPin className="w-4 h-4 text-muted-foreground" />}
                  {...register('address')}
                  error={errors.address?.message}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end pt-2"
        >
          {canEdit && (
          <Button type="submit" size="lg" className="w-full md:w-auto shadow-lg shadow-primary/20" isLoading={isSubmitting}>
            <Save className="w-4 h-4 mr-2" /> {txt('company.saveButton')}
          </Button>
          )}
        </motion.div>
      </div>
      </fieldset>
    </form>
  );
};

export default ThongTinToChucForm;
