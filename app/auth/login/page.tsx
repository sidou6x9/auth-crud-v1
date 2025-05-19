// app/auth/login/page.tsx

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/admin"); // or home page, etc.
  }

  return (
    <div>
      <LoginForm />
    </div>
  );
}
