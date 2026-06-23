import { useTheme } from "@/providers/ThemeProvider";

type BrandLogoProps = {
  variant?: "full" | "mark";
  className?: string;
  showTagline?: boolean;
};

export default function BrandLogo({
  variant = "full",
  className = "",
  showTagline = false,
}: BrandLogoProps) {
  const isMark = variant === "mark";
  const { siteName } = useTheme();

  return (
    <div className={`inline-flex items-center gap-3 ${className}`} aria-label={siteName}>
      <svg
        width={isMark ? 48 : 52}
        height={isMark ? 48 : 52}
        viewBox="0 0 64 64"
        role="img"
        aria-hidden="true"
        className="shrink-0 drop-shadow-[0_0_18px_rgba(212,175,55,0.35)]"
      >
        <defs>
          <linearGradient id="alyousefGold" x1="10" y1="4" x2="54" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFE8A3" />
            <stop offset="0.45" stopColor="#D4AF37" />
            <stop offset="1" stopColor="#9C7614" />
          </linearGradient>
          <linearGradient id="alyousefCyan" x1="8" y1="8" x2="58" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6BEAFF" stopOpacity="0.9" />
            <stop offset="1" stopColor="#C0C0C0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="10" y="9" width="44" height="46" rx="14" fill="#08162B" stroke="url(#alyousefGold)" strokeWidth="2.4" />
        <path d="M20 21h24c5 0 9 4 9 9v15" fill="none" stroke="url(#alyousefCyan)" strokeWidth="2.1" strokeLinecap="round" />
        <path d="M18 44h29c3.7 0 6.9 2.2 8.3 5.4l1.3 3H8.6l1.3-3A9 9 0 0 1 18 44Z" fill="#0D1E36" stroke="url(#alyousefGold)" strokeWidth="2.1" />
        <path d="M20.5 21.5 32 35.5 43.5 21.5M32 35.5V49" fill="none" stroke="url(#alyousefGold)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="49" cy="19" r="2" fill="#C0C0C0" opacity="0.85" />
      </svg>

      {!isMark && (
        <span className="leading-none">
          <span className="block text-[1.15rem] sm:text-[1.35rem] font-extrabold tracking-[0.16em] text-[#D4AF37]">
            {siteName}
          </span>
          <span className="mt-1 block text-[0.62rem] sm:text-[0.72rem] font-semibold tracking-[0.36em] text-[#F8FAFC]/85">
            STORE
          </span>
          {showTagline && (
            <span className="mt-2 block text-[0.68rem] font-medium tracking-[0.18em] text-[#C0C0C0]">
              PREMIUM TECH STORE
            </span>
          )}
        </span>
      )}
    </div>
  );
}
