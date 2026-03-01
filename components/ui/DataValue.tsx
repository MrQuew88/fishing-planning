interface Props {
  value: string | number;
  unit?: string;
  size?: "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  className?: string;
}

export default function DataValue({
  value,
  unit,
  size = "2xl",
  className = "",
}: Props) {
  return (
    <span
      className={`font-[family-name:var(--font-space)] font-bold text-${size} ${className}`}
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
