import { OptimizeContent } from "@/components/optimize-content";
import { getAuthSession } from "@/lib/auth";

export default async function OptimizePage() {
  await getAuthSession();

  return <OptimizeContent />;
}
