import { Brand } from "@/components/brand";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = {
  title: "Set New Password",
  description: "Set a new password for your EcoEats account.",
};

export default function ResetPasswordPage() {
  return (
    <main className="eco-page min-h-screen flex items-center justify-center p-6 bg-[var(--eco-canvas-50)]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Brand />
          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-[var(--color-foreground)]">
            Create New Password
          </h1>
          <p className="eco-copy mt-1.5 text-xs sm:text-sm">
            Please choose a strong password with at least 8 characters.
          </p>
        </div>

        <div className="eco-panel p-6 sm:p-8 bg-white shadow-md">
          <ResetPasswordForm />
        </div>
      </div>
    </main>
  );
}

