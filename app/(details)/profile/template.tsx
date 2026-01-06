import { TabTransition } from "./components/tab-transition";

export default function DetailsTemplate({ children }: { children: React.ReactNode }) {
  return <TabTransition>{children}</TabTransition>;
}