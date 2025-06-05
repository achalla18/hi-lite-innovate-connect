
export function StatsSection() {
  return (
    <section className="py-20 px-4 bg-hilite-light-blue/5">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-hilite-dark-red mb-2">10K+</div>
            <div className="text-muted-foreground">Active Innovators</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-hilite-dark-red mb-2">50+</div>
            <div className="text-muted-foreground">Countries</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-hilite-dark-red mb-2">1000+</div>
            <div className="text-muted-foreground">Projects Launched</div>
          </div>
        </div>
      </div>
    </section>
  );
}
