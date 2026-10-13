import type { Metadata } from 'next';

export const metadata: Metadata = {
  // absolute: o template do layout raiz não atravessa o layout de /habits
  title: { absolute: 'Novo hábito · Arco' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
