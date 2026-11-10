import { Brand } from "@/components/brand";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = {
  title: "Forgot Password",
  description: "Reset your EcoEats account password.",
};

export default function ForgotPasswordPage() {
  return (
    <main className="eco-page min-h-screen flex items-center justify-center p-6 bg-[var(--eco-canvas-50)]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Brand ecoColor="text-black" />
          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-[var(--color-foreground)]">
            Reset Your Password
          </h1>
          <p className="eco-copy mt-1.5 text-xs sm:text-sm">
            Enter your email and we&apos;ll send you instructions to recover your account.
          </p>
        </div>

        <div className="eco-panel p-6 sm:p-8 bg-white shadow-md">
          <ForgotPasswordForm />
        </div>

        <div className="text-center text-xs text-[var(--eco-ink-500)]">
          Need additional assistance? Contact support@ecoeats.local
        </div>
      </div>
    </main>
  );
}
