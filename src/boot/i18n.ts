import { defineBoot } from '#q-app/wrappers';
import { createI18n } from 'vue-i18n';
import messages from 'src/i18n';

export type MessageLanguages = keyof typeof messages;

export const i18n = createI18n({
  legacy: false, // 👈 GANZ wichtig
  locale: (localStorage.getItem('locale') as MessageLanguages) || 'en-US',
  fallbackLocale: 'en-US',
  messages,
});

export default defineBoot(({ app }) => {
  app.use(i18n);
});
