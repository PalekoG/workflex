import { ServiceCard } from "@/components/ServiceCard";

export default function Home() {
  return (
    <main className="text-white">

      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        
        <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 px-4 py-1 rounded-full text-sm font-medium mb-6">
          Plataforma em desenvolvimento
        </span>

        <h1 className="text-6xl font-black max-w-4xl leading-tight">
          Conectando clientes e profissionais com mais segurança
        </h1>

        <p className="text-slate-400 text-lg mt-6 max-w-2xl">
          Marketplace moderno para contratação de serviços técnicos,
          residenciais e especializados.
        </p>

      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="mb-12">
          <h2 className="text-5xl font-black mb-4">
            Serviços Populares
          </h2>

          <p className="text-slate-400">
            Profissionais qualificados para diferentes necessidades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <ServiceCard
            title="Eletricista"
            description="Instalações, manutenção elétrica e soluções residenciais."
          />

          <ServiceCard
            title="Residenciais"
            description="Reparos hidráulicos, Moveis e instalações."
          />

          <ServiceCard
            title="Técnico de Informática"
            description="Suporte técnico, redes e manutenção de computadorese."
          />

          <ServiceCard
            title="Mão de Obra Qualificada"
            description="Pintura, Construção, Acabamentos, Limpezas."
          />

        </div>

      </section>

    </main>
  );
}
