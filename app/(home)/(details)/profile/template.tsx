import { TabTransition } from "./_components/tab-transition";

export default function DetailsTemplate({ children }: { children: React.ReactNode }) {
  return <TabTransition>{children}</TabTransition>;
}