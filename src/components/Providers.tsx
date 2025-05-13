import { Toaster } from "sonner";
import type { PropsWithChildren } from "react";

export function Providers({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <Toaster richColors />
    </>
  );
}
