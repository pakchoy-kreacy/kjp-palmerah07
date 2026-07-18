import { redirect } from "next/navigation";
import { getParentSession } from "@/lib/parent-session";
import { ParentForm } from "@/components/parent/ParentForm";

export const dynamic = "force-dynamic";

export default async function FormPage() {
  const session = await getParentSession();
  if (!session) redirect("/");
  return <ParentForm />;
}
