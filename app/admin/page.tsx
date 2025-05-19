// app/admin/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return <div>
    <h1>hello mr {session?.user.name} this is the admin</h1>
  </div>;
}