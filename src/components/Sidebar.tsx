import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-slate-900 border-r border-slate-800 p-6">

      <div className="mb-12">
        <h1 className="text-3xl font-black text-cyan-400">
          WorkFlex
        </h1>

        <p className="text-slate-500 text-sm mt-1">
          Painel do usuário
        </p>
      </div>

      <nav className="flex flex-col gap-3">

        <Link href="/dashboard">
          <div className="bg-slate-800 hover:bg-slate-700 transition p-4 rounded-2xl cursor-pointer">
            Dashboard
          </div>
        </Link>

        <Link href="/">
          <div className="bg-slate-800 hover:bg-slate-700 transition p-4 rounded-2xl cursor-pointer">
            Explorar Serviços
          </div>
        </Link>

        <Link href="/perfil">
          <div className="bg-slate-800 hover:bg-slate-700 transition p-4 rounded-2xl cursor-pointer">
            Meu Perfil
          </div>
        </Link>

      </nav>
    </aside>
  );
}