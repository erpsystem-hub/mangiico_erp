import type { Option } from '@/components/ui/Combobox';
import { txt } from '@/lib/text';
import { hslToHex, PRIMARY_COLOR_MAP } from '@/lib/theme-utils';

export type ThemeColorName =
  | 'blue'
  | 'violet'
  | 'emerald'
  | 'rose'
  | 'amber'
  | 'orange'
  | 'cyan'
  | 'slate';

export interface ThemeColorOption {
  name: ThemeColorName;
  label: string;
  /** Tailwind background class for color swatch (farm-erp Settings pattern) */
  swatchClass: string;
}

/** Swatch classes — aligned with farm-erp/pages/Settings.tsx */
const THEME_COLOR_SWATCH_CLASS: Record<ThemeColorName, string> = {
  blue: 'bg-blue-600',
  violet: 'bg-indigo-600',
  emerald: 'bg-emerald-600',
  rose: 'bg-rose-600',
  amber: 'bg-amber-500',
  orange: 'bg-orange-600',
  cyan: 'bg-cyan-500',
  slate: 'bg-slate-600',
};

const THEME_COLOR_NAMES: ThemeColorName[] = [
  'blue',
  'violet',
  'emerald',
  'rose',
  'amber',
  'orange',
  'cyan',
  'slate',
];

const COLOR_LABEL_KEYS: Record<ThemeColorName, string> = {
  blue: 'settings.colorBlue',
  violet: 'settings.colorViolet',
  emerald: 'settings.colorEmerald',
  rose: 'settings.colorRose',
  amber: 'settings.colorAmber',
  orange: 'settings.colorOrange',
  cyan: 'settings.colorCyan',
  slate: 'settings.colorSlate',
};

export function themeSwatchHex(name: string): string {
  return hslToHex(PRIMARY_COLOR_MAP[name] ?? PRIMARY_COLOR_MAP.blue);
}

export function getThemeColorOptions(): ThemeColorOption[] {
  return THEME_COLOR_NAMES.map((name) => ({
    name,
    label: txt(COLOR_LABEL_KEYS[name]),
    swatchClass: THEME_COLOR_SWATCH_CLASS[name],
  }));
}

export function getThemeColorComboboxOptions(): Option[] {
  return getThemeColorOptions().map((c) => ({ value: c.name, label: c.label }));
}

export function getColorSchemeOptions(): Option[] {
  return [
    { value: 'light', label: txt('settings.colorSchemeLight') },
    { value: 'dark', label: txt('settings.colorSchemeDark') },
    { value: 'system', label: txt('settings.colorSchemeSystem') },
  ];
}

export function getFontFamilyOptions(): Option[] {
  return [
    { value: 'Be Vietnam Pro', label: txt('settings.fontBeVietnamPro') },
    { value: 'Inter', label: txt('settings.fontInter') },
    { value: 'Lexend', label: txt('settings.fontLexend') },
    { value: 'Nunito', label: txt('settings.fontNunito') },
    { value: 'Source Sans 3', label: txt('settings.fontSourceSans3') },
    { value: 'Merriweather', label: txt('settings.fontMerriweather') },
  ];
}

export function getFontSizeOptions(): Option[] {
  return [
    { value: 'small', label: txt('settings.fontSizeSmall') },
    { value: 'medium', label: txt('settings.fontSizeMedium') },
    { value: 'large', label: txt('settings.fontSizeLarge') },
  ];
}

export const TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  { value: 'Asia/Ho_Chi_Minh', label: '(GMT+07:00) Hà Nội, TP.HCM, Bangkok' },
  { value: 'Asia/Tokyo', label: '(GMT+09:00) Tokyo, Seoul' },
  { value: 'Asia/Shanghai', label: '(GMT+08:00) Bắc Kinh, Singapore' },
  { value: 'Asia/Kolkata', label: '(GMT+05:30) Mumbai, Kolkata' },
  { value: 'Asia/Dubai', label: '(GMT+04:00) Dubai, Abu Dhabi' },
  { value: 'Europe/London', label: '(GMT+00:00) London, Dublin' },
  { value: 'Europe/Paris', label: '(GMT+01:00) Paris, Berlin' },
  { value: 'Europe/Moscow', label: '(GMT+03:00) Moscow' },
  { value: 'America/New_York', label: '(GMT-05:00) New York, Washington' },
  { value: 'America/Los_Angeles', label: '(GMT-08:00) Los Angeles, San Francisco' },
  { value: 'Australia/Sydney', label: '(GMT+11:00) Sydney, Melbourne' },
  { value: 'Pacific/Auckland', label: '(GMT+13:00) Auckland' },
  { value: 'UTC', label: '(GMT+00:00) UTC' },
];

export function getTimezoneOptions(): Option[] {
  return TIMEZONE_OPTIONS.map((tz) => ({ value: tz.value, label: tz.label }));
}
