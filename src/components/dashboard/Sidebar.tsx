export function Sidebar() {
  return (
    <aside className="w-[280px] min-h-screen bg-[#020817] border-r border-slate-800 p-6">

      <div className="mb-12">

        <h1 className="text-4xl font-black text-cyan-400">
          WorkFlex
        </h1>

        <p className="text-slate-500 mt-1">
          Plataforma inteligente
        </p>

      </div>

      <div className="space-y-3">

        <button className="w-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl px-5 py-4 text-left font-semibold">
          Dashboard
        </button>

        <button className="w-full hover:bg-slate-800 transition rounded-2xl px-5 py-4 text-left text-slate-300">
          Serviços
        </button>

        <button className="w-full hover:bg-slate-800 transition rounded-2xl px-5 py-4 text-left text-slate-300">
          Clientes
        </button>

        <button className="w-full hover:bg-slate-800 transition rounded-2xl px-5 py-4 text-left text-slate-300">
          Agendamentos
        </button>

        <button className="w-full hover:bg-slate-800 transition rounded-2xl px-5 py-4 text-left text-slate-300">
          Financeiro
        </button>

        <button className="w-full hover:bg-slate-800 transition rounded-2xl px-5 py-4 text-left text-slate-300">
          Perfil
        </button>

      </div>

    </aside>
  );
}