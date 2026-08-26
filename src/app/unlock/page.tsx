import { UnlockForm } from "@/components/access/UnlockForm";

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return <UnlockForm nextPath={params.next ?? "/"} />;
}
