"use client";

type ProfileCardProps = {
  name?: string | null;
  email?: string | null;
  role?: string;
  phone?: string | null;
};

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

function getInitials(name?: string | null): string {
  if (!name || name.trim() === "") return "?";
  const initials = name
    .split(" ")
    .filter((word) => word.length > 0)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
  return initials || "?";
}

function formatWhatsApp(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export function ProfileCard({ name, email, role, phone }: ProfileCardProps) {
  const initials = getInitials(name);
  const whatsappNumber = formatWhatsApp(phone);

  return (
    <section className="bg-slate-800 border border-slate-700 rounded-3xl p-8 flex items-center justify-between gap-10">

      <div className="flex items-center gap-6">

        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-black text-white shrink-0 select-none">
          {initials}
        </div>

        <div>

          <div className="flex items-center gap-4 mb-2 flex-wrap">
            <h1 className="text-5xl font-black leading-tight text-white">
              {name ?? "Usuário WorkFlex"}
            </h1>
            <RoleBadge role={role} />
          </div>

          <div className="flex items-center gap-4 mt-3 flex-wrap">

            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 transition rounded-xl px-4 py-2 group"
                title="Enviar email"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-cyan-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span className="text-slate-300 text-sm group-hover:text-white transition">
                  {email}
                </span>
              </a>
            )}

            {whatsappNumber ? (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 transition rounded-xl px-4 py-2 group"
                title="Abrir WhatsApp"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-green-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                <span className="text-green-400 text-sm font-semibold group-hover:text-green-300 transition">
                  {phone}
                </span>
              </a>
            ) : (
              <span className="text-slate-600 text-sm italic">
                Telefone não cadastrado
              </span>
            )}

          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-3xl px-10 py-8 text-center min-w-[320px] shrink-0">
        <p className="text-yellow-400 font-black text-xl mb-3">⭐ NOTA DO CLIENTE</p>
        <h2 className="text-6xl font-black text-white leading-none mb-3">4.95 / 5.0</h2>
        <p className="text-slate-500 text-lg">Avaliado por 14 clientes</p>
      </div>

    </section>
  );
}