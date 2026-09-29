import Image from 'next/image';
import { ReactNode } from 'react';
import { HiOutlineShieldCheck } from 'react-icons/hi';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footnote?: ReactNode;
}

/* The console's own chrome. Deliberately *not* the storefront's wave artwork:
   a dark backdrop makes it obvious at a glance that this is the internal tool
   and not the public site. It is pure CSS, so there is no image to ship. */
export default function AuthShell({
  title,
  subtitle,
  children,
  footnote
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-secondary px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="absolute -left-28 -top-28 h-[420px] w-[420px] rounded-full bg-primary/25 blur-3xl" />
        <span className="absolute -bottom-32 -right-24 h-[460px] w-[460px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <main className="relative z-10 w-full max-w-[440px]">
        <div className="rounded-2xl bg-white px-6 py-9 shadow-[0_18px_60px_rgba(0,0,0,0.35)] sm:px-9">
          <div className="flex justify-center">
            <Image
              src="/assets/images/logo.webp"
              alt="Tredella"
              width={140}
              height={45}
              priority
              className="h-8 w-auto"
            />
          </div>

          <div className="mt-6 flex justify-center">
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-12 font-medium uppercase tracking-wide text-primary">
              <HiOutlineShieldCheck aria-hidden="true" className="text-14" />
              Admin Console
            </span>
          </div>

          <h1 className="mt-4 text-center text-24 font-semibold text-secondary">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-2 text-center text-13 text-gray">{subtitle}</p>
          )}

          <div className="mt-7">{children}</div>
        </div>

        {footnote && (
          <p className="mt-6 text-balance text-center text-12 leading-relaxed text-white/55">
            {footnote}
          </p>
        )}
      </main>
    </div>
  );
}
