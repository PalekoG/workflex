// src/components/dashboard/ProfileCard.tsx

// Definimos quais dados o componente recebe
// O "?" significa que o dado pode vir como null (caso o perfil não tenha sido preenchido ainda)
type ProfileCardProps = {
  name?: string | null;
  email?: string | null;
  role?: string;
};

// Função auxiliar — transforma a role em texto legível e cor
function RoleBadge({ role }: { role?: string }) {
  const isProfessional = role === "professional";

  return (
    <span
      className={`px-5 py-2 rounded-2xl text-sm font-bold border ${
        isProfessional
          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
          : "bg-violet-500/10 border-violet-500/30 text-violet-400"
      }`}
    >
      {isProfessional ? "PROFISSIONAL" : "CLIENTE"}
    </span>
  );
}

// Função auxiliar — gera as iniciais do nome para o avatar
// Ex: "Rodrigo Oliveira" → "RO"
function getInitials(name?: string | null): string {
  if (!name) return "?";

  return name
    .split(" ")                        // divide por espaço → ["Rodrigo", "Oliveira"]
    .filter((word) => word.length > 0) // remove espaços extras
    .slice(0, 2)                       // pega só as 2 primeiras palavras
    .map((word) => word[0].toUpperCase()) // pega a primeira letra de cada
    .join("");                         // junta → "RO"
}

export function ProfileCard({ name, email, role }: ProfileCardProps) {
  const initials = getInitials(name);

  return (
    <section className="bg-slate-800 border border-slate-700 rounded-4xl p-8 flex items-center justify-between gap-10">

      <div className="flex items-center gap-6">

        {/* Avatar com iniciais reais — futuramente substituiremos por foto */}
        <div className="w-28 h-28 rounded-[28px] bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-black text-white shrink-0 select-none">
          {initials}
        </div>

        <div>

          <div className="flex items-center gap-4 mb-3 flex-wrap">

            {/* Nome real vindo do banco — fallback se não tiver */}
            <h1 className="text-5xl font-black leading-tight text-white">
              {name ?? "Usuário WorkFlex"}
            </h1>

            {/* Badge com a role real */}
            <RoleBadge role={role} />

          </div>

          {/* Email real */}
          <p className="text-slate-400 text-xl">
            {email ?? "Email não informado"}
          </p>

        </div>

      </div>

      {/* Card de avaliação — por enquanto ainda mock, evoluiremos depois */}
      <div className="bg-slate-900 border border-slate-700 rounded-[28px] px-10 py-8 text-center min-w-[320px] 
      shrink-0">
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