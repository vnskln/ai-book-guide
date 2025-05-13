import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface UserHeaderProps {
  email: string;
}

export function UserHeader({ email }: UserHeaderProps) {
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        window.location.href = "/auth/login";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex justify-end items-center gap-4 mb-4 px-4">
      <span className="text-sm text-muted-foreground">{email}</span>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
