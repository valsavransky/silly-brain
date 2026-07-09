export default function Portal() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Parent & Teacher Portal</h1>
      <p className="text-slate-500 mb-10">
        MindSprout is a premium, 100% ad-free learning arcade. No behavioral tracking, no
        cookies for kids, no personal data stored for children under 13.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        <div className="bg-white rounded-3xl border-4 border-slate-100 p-8">
          <h2 className="text-2xl font-bold">Free forever</h2>
          <p className="text-4xl font-display font-bold my-3">$0</p>
          <ul className="space-y-2 text-slate-600">
            <li>✅ Core levels of all four games</li>
            <li>✅ Adaptive difficulty engine</li>
            <li>✅ Works on iPad & Chromebook</li>
            <li>✅ Zero ads, zero tracking</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-berry-500 to-splash-600 text-white rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold">MindSprout Plus</h2>
          <p className="text-4xl font-display font-bold my-3">
            $4.99<span className="text-lg font-normal">/month</span>
          </p>
          <ul className="space-y-2 text-white/90">
            <li>🌟 Advanced curriculums & complex story modes</li>
            <li>🌟 Custom avatars</li>
            <li>🌟 Unlimited AI 20 Questions rounds</li>
            <li>🌟 One-time purchase option available</li>
          </ul>
          <button className="btn-chunky mt-6 w-full py-3 rounded-2xl bg-white text-berry-600 font-display font-bold shadow-[0_4px_0_0_rgb(0_0_0/0.2)]">
            Coming soon
          </button>
        </div>
      </div>

      <div className="bg-sprout-50 border-4 border-sprout-100 rounded-3xl p-8">
        <h2 className="text-2xl font-bold mb-2">🏫 School & classroom licensing</h2>
        <p className="text-slate-600">
          Bulk room licenses with unique invite URLs — web-accessible on school hardware with
          no app-store friction. Teachers get simple class setup and an ad-free guarantee.
          Contact us for pilot pricing.
        </p>
      </div>

      <div className="mt-10 text-sm text-slate-400">
        <h3 className="font-bold text-slate-500 mb-1">Privacy commitment</h3>
        <p>
          Strict adherence to COPPA (USA) and GDPR-K (Europe). No behavioral tracking cookies.
          No personal identification stored for users under 13. The AI guessing game sends only
          anonymous yes/no game moves to our server — never names, never free text from kids.
        </p>
      </div>
    </div>
  );
}
