const metrics = [
  { value: "10K+", label: "Active innovators", detail: "Building ideas daily" },
  { value: "50+", label: "Countries represented", detail: "Global collaboration" },
  { value: "1,000+", label: "Projects launched", detail: "From concept to execution" },
  { value: "96%", label: "Member satisfaction", detail: "Based on monthly feedback" },
];

export function StatsSection() {
  return (
    <section id="community" className="border-y bg-hilite-light-blue/5 px-4 py-16 md:py-20">
      <div className="container grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border bg-background/80 p-6 text-center shadow-sm">
            <div className="text-3xl font-extrabold text-hilite-dark-red md:text-4xl">{metric.value}</div>
            <p className="mt-2 font-medium text-foreground">{metric.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{metric.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
