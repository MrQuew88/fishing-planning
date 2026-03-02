const COLOR_MAP: Record<string, string> = {
  amber: "bg-[#F59E0B]/20 text-[#F59E0B]",
  green: "bg-[#22C55E]/20 text-[#22C55E]",
  red: "bg-[#EF4444]/20 text-[#EF4444]/80",
  blue: "bg-blue-500/20 text-blue-300",
  purple: "bg-purple-500/20 text-purple-300",
  teal: "bg-teal-500/20 text-teal-300",
  orange: "bg-orange-500/20 text-orange-300",
  cyan: "bg-cyan-500/20 text-cyan-300",
  emerald: "bg-emerald-500/20 text-emerald-300",
  neutral: "bg-white/[0.06] text-white/75",
};

interface Props {
  label: string;
  color?: keyof typeof COLOR_MAP | string;
}

export default function Badge({ label, color = "neutral" }: Props) {
  const classes = COLOR_MAP[color] || color;
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 md:px-3 md:py-1 text-sm md:text-base font-semibold ${classes}`}
    >
      {label}
    </span>
  );
}
