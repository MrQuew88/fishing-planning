interface Props {
  value: string | number;
  unit?: string;
  size?: "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  className?: string;
  glow?: string;
}

export default function DataValue({
  value,
  unit,
  size = "2xl",
  className = "",
  glow,
}: Props) {
  const glowStyle = glow ? { textShadow: `0 0 12px ${glow}` } : undefined;

  return (
    <span
      className={`font-[family-name:var(--font-plex)] font-bold text-${size} ${className}`}
      style={glowStyle}
    >
      {value}
      {unit && (
        <span className="text-white/70 font-medium text-base ml-1">
          {unit}
        </span>
      )}
    </span>
  );
}
