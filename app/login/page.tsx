import PasswordGate from "@/components/auth/PasswordGate";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
      <h1 className="text-2xl font-bold">Killykeen Dashboard</h1>
      <p className="text-gray-400 text-sm">Accès protégé</p>
      <PasswordGate />
    </div>
  );
}
