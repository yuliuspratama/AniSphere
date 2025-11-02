"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { Home, BookOpen, Users, Search, User, LogOut } from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { href: "/beranda", label: "Beranda", icon: Home },
  { href: "/koleksiku", label: "Koleksiku", icon: BookOpen },
  { href: "/arena", label: "Arena", icon: Users },
  { href: "/jelajah", label: "Jelajah", icon: Search },
];

export function MainNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Gagal logout");
    } else {
      toast.success("Berhasil logout");
      router.push("/auth/login");
    }
  };

  // Don't show navigation on auth pages
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:relative md:border-r md:border-t-0">
      <div className="flex h-16 items-center justify-around md:h-screen md:w-64 md:flex-col md:justify-start md:gap-4 md:p-4">
        {/* Mobile Navigation */}
        <div className="flex w-full items-center justify-around md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId={`mobile-active-${item.href}`}
                      className="absolute inset-x-0 bottom-0 h-1 bg-primary rounded-t-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
          {user && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Link
                href={`/profile/${user.id}`}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  pathname?.startsWith("/profile") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
                }`}
              >
                <User className="h-5 w-5" />
                <span className="text-xs">Profil</span>
                {pathname?.startsWith("/profile") && (
                  <motion.div
                    layoutId="mobile-profile-indicator"
                    className="absolute inset-x-0 bottom-0 h-1 bg-primary rounded-t-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden w-full md:flex md:flex-col md:gap-2">
          <div className="mb-4 p-4">
            <h1 className="text-xl font-bold">AniSphere</h1>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={item.href}
                  className={`relative flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="desktop-active-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
          {user && (
            <>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/profile/${user.id}`}
                  className={`relative flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                    pathname?.startsWith("/profile")
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {pathname?.startsWith("/profile") && (
                    <motion.div
                      layoutId="desktop-profile-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <User className="h-5 w-5" />
                  <span>Profil</span>
                </Link>
              </motion.div>
              <div className="mt-auto space-y-4 border-t pt-4">
                <div className="px-4">
                  <ThemeSwitcher />
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

