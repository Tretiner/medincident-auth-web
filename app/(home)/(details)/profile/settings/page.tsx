import type { Metadata } from 'next';
import { SettingsView } from './_components/settings-view';

export const metadata: Metadata = {
  title: 'Настройки',
};

export default function SettingsPage() {
  return <SettingsView />;
}
