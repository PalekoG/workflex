type ServiceCardProps = {
  title: string;
  description: string;
};

export function ServiceCard({
  title,
  description,
}: ServiceCardProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 hover:border-cyan-500 transition duration-300">
      
      <div className="w-16 h-16 rounded-2xl bg-cyan-600 flex items-center justify-center text-3xl mb-6">
        ⚡
      </div>

      <h3 className="text-3xl font-bold mb-4">
        {title}
      </h3>

      <p className="text-slate-400 text-lg leading-relaxed">
        {description}
      </p>

    </div>
  );
}