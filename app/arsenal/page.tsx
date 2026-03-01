import GlassCard from "@/components/ui/GlassCard";
import SectionTitle from "@/components/ui/SectionTitle";

export default function ArsenalPage() {
  return (
    <div className="pt-6">
      <GlassCard>
        <SectionTitle>Arsenal</SectionTitle>
        <p className="text-lg text-white/70 mt-3">
          Gestion des leurres, catalogue personnel, recommandations par conditions — bientôt disponible.
        </p>
      </GlassCard>
    </div>
  );
}
