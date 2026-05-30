import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Palette,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardToolbar from '@/components/shared/DashboardToolbar';
import Button from '@/components/ui/Button';
import { txt } from '@/lib/text';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useStore';
import { DEFAULT_FONT_FAMILY } from '@/lib/theme/tokens';
import {
  getThemeColorOptions,
  type ThemeColorName,
} from '@/lib/theme/settings-options';

const Settings: React.FC = () => {
  const { primaryColor, colorScheme, setTheme } = useUIStore();
  const themeColors = useMemo(() => getThemeColorOptions(), []);

  const handleReset = () => {
    setTheme({
      primaryColor: 'blue',
      fontFamily: DEFAULT_FONT_FAMILY,
      fontSize: 'medium',
      colorScheme: 'light',
      timezone: 'Asia/Ho_Chi_Minh',
    });
    toast.info(txt('page.settings.restored'));
  };

  return (
    <div className="flex flex-col min-h-0">
      <DashboardToolbar
        innerWrapperClassName="max-w-5xl mx-auto w-full px-4 sm:px-6"
        leadingContent={
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <SettingsIcon className="h-4 w-4" />
            </div>
            <h1 className="text-sm font-semibold text-foreground truncate">
              {txt('page.settings.title')}
            </h1>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              {txt('page.settings.autoSaved')}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="rounded-xl shrink-0"
            >
              <RotateCcw size={14} className="mr-1.5" />
              {txt('common.reset')}
            </Button>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto w-full space-y-6 pb-10 px-4 sm:px-6 pt-3 md:pt-4">
        <p className="text-sm text-muted-foreground">
          {txt('page.settings.description')}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-5 rounded-xl border border-border shadow-sm"
        >
          <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-3">
            <Palette className="w-4 h-4 text-primary" />
            {txt('settings.appearance')}
          </h3>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Moon size={14} className="text-muted-foreground" />
                {txt('settings.displayMode')}
              </label>
              <div
                className="flex flex-wrap gap-3"
                role="radiogroup"
                aria-label={txt('settings.displayMode')}
              >
                {(
                  [
                    { value: 'light' as const, label: txt('settings.colorSchemeLight'), icon: Sun },
                    { value: 'dark' as const, label: txt('settings.colorSchemeDark'), icon: Moon },
                    { value: 'system' as const, label: txt('settings.colorSchemeSystem'), icon: Monitor },
                  ] as const
                ).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={colorScheme === value}
                    onClick={() => setTheme({ colorScheme: value })}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
                      colorScheme === value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted',
                    )}
                  >
                    <Icon
                      size={14}
                      className={cn(
                        'shrink-0',
                        colorScheme === value ? 'text-primary' : 'text-muted-foreground',
                      )}
                    />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                {txt('settings.primaryColor')}
              </label>
              <div
                className="flex flex-wrap gap-2"
                role="radiogroup"
                aria-label={txt('settings.primaryColor')}
              >
                {themeColors.map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    role="radio"
                    aria-checked={primaryColor === theme.name}
                    aria-label={theme.label}
                    onClick={() =>
                      setTheme({ primaryColor: theme.name as ThemeColorName })
                    }
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all',
                      primaryColor === theme.name
                        ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted/50',
                    )}
                  >
                    <span
                      className={cn('w-4 h-4 rounded-full shrink-0', theme.swatchClass)}
                      aria-hidden
                    />
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
