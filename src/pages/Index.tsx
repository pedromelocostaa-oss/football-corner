const Index = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-700 to-emerald-900 flex items-center justify-center px-6 py-20">
      <section className="max-w-3xl text-center text-white">
        <span className="inline-block px-4 py-1 mb-6 text-xs font-semibold tracking-[0.3em] uppercase bg-white/10 backdrop-blur rounded-full border border-white/20">
          O Esporte Bretão
        </span>
        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
          Futebol: a paixão que move o mundo
        </h1>
        <p className="text-lg md:text-xl text-emerald-50/90 leading-relaxed mb-10">
          Praticado em mais de 200 países por bilhões de pessoas, o futebol é mais
          do que um jogo — é cultura, identidade e emoção. Onze contra onze,
          noventa minutos, uma bola e um sonho compartilhado em cada estádio,
          praça ou rua do planeta.
        </p>
        <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
          <div>
            <div className="text-4xl font-black">211</div>
            <div className="text-xs uppercase tracking-wider text-emerald-100/70 mt-1">Federações</div>
          </div>
          <div>
            <div className="text-4xl font-black">5B+</div>
            <div className="text-xs uppercase tracking-wider text-emerald-100/70 mt-1">Fãs no mundo</div>
          </div>
          <div>
            <div className="text-4xl font-black">1863</div>
            <div className="text-xs uppercase tracking-wider text-emerald-100/70 mt-1">Regras oficiais</div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
