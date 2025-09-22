/*
CM3070 Computer Science Final Project Track My Impact: Data Driven Waste Management
BSc Computer Science, Goldsmiths, University of London
CM3070 Final Project in Data Science (CM3050)
with Extended Features in Machine Learning and Neural Networks (CM3015) and Databases and Advanced Data Techniques (CM3010)
by
Zinhle Maurice-Mopp (210125870)
zm140@student.london.ac.uk

about/page.tsx: About page for the Track My Impact project.
*/
export default function AboutPage() {
  const pillars = [
    {
      title: "Behaviour-first design",
      description:
        "We combine landfill comparisons with positive nudges so that every log reinforces better habits rather than just reporting tonnage.",
    },
    {
      title: "Community visibility",
      description:
        "Leaderboards and shared stats make it easy to see the collective impact of small actions across neighbourhoods and teams.",
    },
    {
      title: "Open data foundation",
      description:
        "Reference factors live in JSON and the impact engine is transparent, making it straightforward to adapt Track My Impact to new regions or initiatives.",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 text-gray-800">
        <header className="space-y-3 text-center">
          <h1 className="text-3xl font-bold text-gray-900">About Track My Impact</h1>
          <p className="text-gray-600">
            Track My Impact helps households and communities log waste decisions, compare them to landfill baselines, and celebrate the avoided emissions they create together.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">What we focus on</h2>
          <div className="space-y-3">
            {pillars.map((item) => (
              <article key={item.title} className="rounded-lg border border-green-200 bg-white/70 p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-green-800">{item.title}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-emerald-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">How the numbers work</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Impact values represent the difference between landfilling an item and the disposal method you choose. Positive values mean avoided emissions, while negative values highlight where additional emissions were created. The calculator and AI classifier both use this approach so that improvements and regressions are obvious at a glance.
          </p>
        </section>
      </div>
  );
}
