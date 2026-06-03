export function StatsCards() {
  return (
    <section className="grid grid-cols-4 gap-5">

      <div className="bg-slate-800 border border-slate-700 rounded-[28px] p-6">

        <p className="text-slate-400 text-sm mb-3">
          Serviços realizados
        </p>

        <h2 className="text-4xl font-black text-white mb-2">
          248
        </h2>

        <span className="text-emerald-400 text-sm font-semibold">
          +12 este mês
        </span>

      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-[28px] p-6">

        <p className="text-slate-400 text-sm mb-3">
          Clientes atendidos
        </p>

        <h2 className="text-4xl font-black text-white mb-2">
          187
        </h2>

        <span className="text-cyan-400 text-sm font-semibold">
          Alta confiança
        </span>

      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-[28px] p-6">

        <p className="text-slate-400 text-sm mb-3">
          Faturamento
        </p>

        <h2 className="text-4xl font-black text-white mb-2">
          R$ 12k
        </h2>

        <span className="text-yellow-400 text-sm font-semibold">
          Últimos 30 dias
        </span>

      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-[28px] p-6">

        <p className="text-slate-400 text-sm mb-3">
          Avaliação média
        </p>

        <h2 className="text-4xl font-black text-white mb-2">
          4.9
        </h2>

        <span className="text-pink-400 text-sm font-semibold">
          Excelente reputação
        </span>

      </div>

    </section>
  );
}