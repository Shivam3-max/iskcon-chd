/* eslint-disable @next/next/no-img-element */
// The temple's own logo, keyed out from the JPEG on iskconchandigarh.com
// (public/brand/iskcon-chandigarh-logo.jpg) into transparent maroon and white versions.
export default function Logo({ className = "h-[46px]", onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <img
      src={onDark ? "/brand/logo-white.png" : "/brand/logo-maroon.png"}
      alt="ISKCON Chandigarh"
      width={340}
      height={98}
      className={`w-auto ${className}`}
    />
  );
}
