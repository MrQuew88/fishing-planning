import PasswordGate from "@/components/auth/PasswordGate";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
          Killykeen
        </h1>
        <p className="text-sm text-slate-400">Tableau de bord</p>
      </div>
      <PasswordGate />
    </div>
  );
}
