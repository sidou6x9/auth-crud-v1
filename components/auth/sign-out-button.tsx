"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function SignOutButton() {
  return (
    
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Button onClick={() => signOut({ callbackUrl: "/auth/login" })} asChild>
            <button>
            Sign Out</button>
          </Button>
        </motion.div>
        
  );
}