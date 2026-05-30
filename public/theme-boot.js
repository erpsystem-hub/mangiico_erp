/**
 * Pre-React theme boot data — keep in sync with lib/theme/tokens.ts and lib/theme/fonts.ts.
 */
(function (global) {
  global.__MANGIICO_THEME_BOOT__ = {
    DEFAULT_PRIMARY: 'blue',
    DEFAULT_FONT: 'Be Vietnam Pro',
    PRIMARY_COLOR_MAP: {
      blue: '221.2 83.2% 53.3%',
      violet: '262.1 83.3% 57.8%',
      emerald: '142.1 76.2% 36.3%',
      rose: '346.8 77.2% 49.8%',
      amber: '37.7 92.1% 50.2%',
      orange: '24.6 95% 53.1%',
      cyan: '188.7 94.5% 42.7%',
      slate: '215.4 16.3% 46.9%',
    },
    GOOGLE_FONT_PARAM: {
      Inter: '',
      'Be Vietnam Pro': 'Be+Vietnam+Pro:wght@400;500;600;700',
      Lexend: 'Lexend:wght@400;500;600;700',
      Nunito: 'Nunito:wght@400;600;700',
      'Source Sans 3': 'Source+Sans+3:wght@400;500;600;700',
      Merriweather: 'Merriweather:wght@400;700',
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
