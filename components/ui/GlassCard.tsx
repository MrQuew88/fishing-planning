interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = "" }: Props) {
  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}
    >
      {children}
    </div>
  );
}
