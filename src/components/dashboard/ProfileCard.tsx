export function ProfileCard() {
  return (
    <section className="bg-slate-800 border border-slate-700 rounded-[32px] p-8 flex items-center justify-between gap-10">

      <div className="flex items-center gap-6">

        <div className="w-28 h-28 rounded-[28px] bg-cyan-500 flex items-center justify-center text-5xl flex-shrink-0">
          👨‍🔧
        </div>

        <div>

          <div className="flex items-center gap-4 mb-3 flex-wrap">

            <h1 className="text-5xl font-black leading-tight text-white">
              Rodrigo M. Oliveira
            </h1>

            <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-5 py-2 rounded-2xl text-sm font-bold">
              PROFISSIONAL
            </span>

          </div>

          <p className="text-slate-400 text-xl">
            Membro verificado desde Janeiro de 2026
          </p>

        </div>

      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-[28px] px-10 py-8 text-center min-w-[320px] flex-shrink-0">

        <p className="text-yellow-400 font-black text-xl mb-3">
          ⭐ NOTA DO CLIENTE
        </p>

        <h2 className="text-6xl font-black text-white leading-none mb-3">
          4.95 / 5.0
        </h2>

        <p className="text-slate-500 text-lg">
          Avaliado por 14 clientes
        </p>

      </div>

    </section>
  );
}