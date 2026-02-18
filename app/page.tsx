import AuthButton from "@/components/AuthButton";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default function LandingPage() {
  return (
    <div className="min-h-screen px-6">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 py-12 md:grid-cols-2">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2">
            <Image
              src="/linknest_logo.png"
              alt="LinkNest"
              width={700}
              height={180}
              className="h-[140px] w-auto"
              priority
            />
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
            Your private link workspace
          </h1>
          <p className="mt-4 max-w-xl text-lg text-gray-500">
            Save, organize, and access your links anywhere.
          </p>
        </div>

        <div className="animate-slide-up">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-medium text-gray-900">
              Sign in
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Use Google to securely access your workspace.
            </p>

            <div className="mt-6">
              <AuthButton fullWidth />
            </div>

            <p className="mt-6 text-xs text-gray-500">
              By continuing, you agree to store links privately in your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
