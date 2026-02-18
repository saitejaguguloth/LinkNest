import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { ToastProvider } from "@/components/ToastProvider";
import { DashboardProvider } from "@/components/DashboardProvider";
import DashboardShell from "@/components/DashboardShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const userName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    undefined;

  return (
    <ToastProvider>
      <DashboardProvider
        value={{
          userId: user.id,
          userEmail: user.email ?? "",
          userName,
          avatarUrl: user.user_metadata?.avatar_url,
        }}
      >
        <DashboardShell>{children}</DashboardShell>
      </DashboardProvider>
    </ToastProvider>
  );
}
