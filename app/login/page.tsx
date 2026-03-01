import PasswordGate from "@/components/auth/PasswordGate";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Killykeen
        </h1>
        <p className="text-lg text-white/70">Tableau de bord</p>
      </div>
      <PasswordGate />
    </div>
  );
}
