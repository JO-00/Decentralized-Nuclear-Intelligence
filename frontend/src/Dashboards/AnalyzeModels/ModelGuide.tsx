export function ModelInterpretabilityGuide() {
  const techniques = [
    { name: 'SHAP', desc: 'Shapley additive explanations for per-prediction feature attribution' },
    { name: 'LIME', desc: 'Local surrogate models that approximate your model locally' },
    { name: 'Attention visualization', desc: 'Expose attention weights across input timesteps' },
    { name: 'Integrated Gradients', desc: 'Attribute predictions to input features via path integrals' },
    { name: 'Counterfactual explanations', desc: 'Show minimal input changes that flip a decision' },
    { name: 'Partial Dependence Plots', desc: 'Visualize marginal effect of features on output' },
    { name: 'Permutation Feature Importance', desc: 'Rank features by their impact on model error' },
    { name: 'Saliency Maps', desc: 'Gradient-based maps highlighting influential input regions' },
    { name: 'Concept Activation Vectors', desc: 'Tie predictions to human-understandable concepts' },
    { name: 'Rule Extraction', desc: 'Distill your model into readable decision rules' },
  ];

  const votes = [
    { title: 'Inspectable reasoning', body: 'Voters can independently see why your model flagged an anomaly.' },
    { title: 'Catch the fakes', body: 'Explanations surface overfitting and spurious correlations before anyone endorses you.' },
    { title: 'Compounding trust', body: 'Trusted models accumulate credibility and get reused across the platform.' },
    { title: 'Weight in the room', body: 'The stronger your interpretability story, the more your model matters to the community.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:4s]" />

      <div className="relative max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="mb-14 animate-[fadeUp_0.7s_ease-out]">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-mono mb-5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            GUIDE · MODEL INTERPRETABILITY
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Interpretable models win votes.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
            Transparency is the backbone of safety-critical systems. When you submit a model here,
            its credibility is measured by how much the community can <em className="text-slate-200 not-italic font-medium">understand</em> it.
            Opaque black boxes don't get trust. Interpretable models do.
          </p>
        </header>

        {/* Why */}
        <section className="mb-14 group">
          <div className="relative bg-slate-900/60 border border-slate-800 rounded-2xl p-7 backdrop-blur-sm transition-all duration-500 hover:border-cyan-500/40 hover:bg-slate-900/80 hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)]">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Why interpretability matters here</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              Every model you propose competes for community votes. Voters need to see{' '}
              <strong className="text-white">how</strong> your model reaches its conclusions before
              they stake their reputation on it. A model with clear feature attributions, transparent
              decision paths, and reproducible explanations earns credibility. A black box earns
              suspicion.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Interpretability isn't a nice-to-have — it's the mechanism by which your anomaly
              detector becomes{' '}
              <span className="text-cyan-400 font-medium">trusted infrastructure</span> for reactor
              state monitoring.
            </p>
          </div>
        </section>

        {/* Techniques */}
        <section className="mb-14">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-2">Techniques to build in</h2>
          <p className="text-slate-400 mb-6">
            Always ship models that explain themselves. Consider weaving in:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {techniques.map((t, i) => (
              <div
                key={t.name}
                style={{ animationDelay: `${i * 60}ms` }}
                className="group relative bg-slate-900/50 border border-slate-800 rounded-xl p-4 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/50 hover:bg-slate-900/80 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_rgba(6,182,212,0.4)] animate-[fadeUp_0.6s_ease-out_both]"
              >
                <div className="absolute left-0 top-4 bottom-4 w-px bg-cyan-500/0 group-hover:bg-cyan-500/60 transition-colors duration-300" />
                <div className="font-mono text-cyan-400 text-sm mb-1 transition-colors group-hover:text-cyan-300">
                  {t.name}
                </div>
                <div className="text-slate-400 text-sm leading-relaxed">{t.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Voting rationale */}
        <section className="mb-14">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-5">How this earns you votes</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {votes.map((v, i) => (
              <div
                key={v.title}
                style={{ animationDelay: `${i * 80}ms` }}
                className="relative rounded-xl p-5 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 transition-all duration-300 hover:border-cyan-400/40 hover:from-cyan-500/15 hover:to-blue-500/10 animate-[fadeUp_0.6s_ease-out_both]"
              >
                <div className="text-white font-medium mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  {v.title}
                </div>
                <div className="text-slate-400 text-sm leading-relaxed">{v.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* zkML */}
        <section className="mb-14">
          <div className="flex items-baseline gap-3 mb-3">
            <h2 className="text-2xl font-semibold text-cyan-400">Optional: zkML & verifiable computation</h2>
            <span className="text-xs font-mono text-slate-500 border border-slate-700 rounded px-2 py-0.5">OPTIONAL</span>
          </div>
          <p className="text-slate-300 leading-relaxed mb-6 max-w-2xl">
            Go one step further — attach zero-knowledge proofs that your model output is correct
            without revealing your weights. Your inference becomes{' '}
            <strong className="text-white">cryptographically verifiable</strong>, and reviewers can
            confirm it independently in the lab section.
          </p>

          <div className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 transition-all duration-500 hover:border-cyan-500/40 hover:shadow-[0_0_50px_-15px_rgba(6,182,212,0.5)]">
            <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center gap-2 backdrop-blur-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs font-mono text-slate-500">bash · ezkl</span>
            </div>
            <div className="p-5 font-mono text-sm overflow-x-auto">
              <div className="mb-6">
                <div className="text-slate-500 mb-2"># Prover — generate a proof of your inference</div>
                <pre className="text-slate-200 leading-relaxed whitespace-pre-wrap">
<span className="text-cyan-400">ezkl</span> prove \
{'\n'}  <span className="text-slate-500">--model</span>           model.onnx \
{'\n'}  <span className="text-slate-500">--witness</span>         witness.json \
{'\n'}  <span className="text-slate-500">--compiled-circuit</span> model.compiled \
{'\n'}  <span className="text-slate-500">--vk-path</span>         vk.key \
{'\n'}  <span className="text-slate-500">--pk-path</span>         pk.key \
{'\n'}  <span className="text-slate-500">--proof-path</span>      proof.json
                </pre>
              </div>
              <div>
                <div className="text-slate-500 mb-2"># Verifier — check the proof on your side</div>
                <pre className="text-slate-200 leading-relaxed whitespace-pre-wrap">
<span className="text-cyan-400">ezkl</span> verify \
{'\n'}  <span className="text-slate-500">--proof-path</span>    proof.json \
{'\n'}  <span className="text-slate-500">--settings-path</span> settings.json \
{'\n'}  <span className="text-slate-500">--vk-path</span>       vk.key
                </pre>
              </div>
            </div>
          </div>

          <p className="text-slate-500 text-sm mt-4">
            Full walkthrough lives in the{' '}
            <span className="text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors underline underline-offset-4 decoration-cyan-500/40">
              Lab
            </span>{' '}
            section.
          </p>
        </section>

        {/* TL;DR */}
        <div className="relative border-t border-slate-800 pt-6">
          <div className="absolute top-0 left-0 w-24 h-px bg-gradient-to-r from-cyan-500 to-transparent" />
          <p className="text-slate-400 text-sm leading-relaxed">
            <strong className="text-slate-200 font-mono text-xs tracking-wider">TL;DR</strong>{' '}
            <span className="mx-2 text-slate-700">—</span>
            Ship a model that explains itself. Add SHAP, LIME, or any technique above. Want maximum
            credibility? Attach a zkML proof so anyone can verify your inference without seeing your
            weights.
          </p>
        </div>
      </div>

      {/* keyframes */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}