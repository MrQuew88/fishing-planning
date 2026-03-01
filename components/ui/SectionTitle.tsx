interface Props {
  children: React.ReactNode;
}

export default function SectionTitle({ children }: Props) {
  return (
    <h2 className="text-2xl font-bold text-[#F1F5F9] uppercase tracking-wide">
      {children}
    </h2>
  );
}
