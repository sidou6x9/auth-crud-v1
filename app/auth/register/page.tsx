
import type React from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import RegistrationForm from "@/components/auth/registration-form"

export default async function RegisterPage() {
   const session = await auth();
  if (session) {
    redirect("/admin"); // or home page, etc.
  }
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
     
          <RegistrationForm />
        
    </div>
  )
}
