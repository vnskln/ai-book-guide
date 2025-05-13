import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission will be implemented later
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Sprawdź swoją skrzynkę</CardTitle>
          <CardDescription>
            Wysłaliśmy link do resetowania hasła na podany adres email. Sprawdź swoją skrzynkę i kliknij w link aby
            zresetować hasło.
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-6">
          <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/login")}>
            Powrót do logowania
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Resetowanie hasła</CardTitle>
        <CardDescription>Podaj swój adres email, a wyślemy Ci link do zresetowania hasła</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="twoj@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-6">
          <Button type="submit" className="w-full">
            Wyślij link resetujący
          </Button>
          <p className="text-sm text-center">
            <a href="/login" className="text-primary hover:underline">
              Powrót do logowania
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
