import { Link } from "react-router-dom"

export default function Landing() {
  return (
    <div>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/80">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src="/images/logo.svg" alt="CloudForge" className="h-8 w-8" />
            <span className="text-xl font-bold text-gray-900">CloudForge</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <Link to="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Log in</Link>
            <Link to="/register" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all">Get started</Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gray-950 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-950 to-gray-950" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20 mb-8">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Visual AWS Infrastructure Builder
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
            Build AWS Infrastructure{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              without writing code
            </span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Drag, connect, generate Terraform, and deploy in minutes with a clean visual workflow.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-600/30 transition-all duration-200"
            >
              Get Started Free
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-600 bg-white/5 px-8 py-3.5 text-base font-semibold text-gray-300 hover:bg-white/10 hover:text-white hover:border-gray-400 transition-all duration-200"
            >
              View Pricing
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              SOC 2 compliant
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              &lt; 1s Terraform generation
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              Team collaboration
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto pt-10 border-t border-gray-800">
            <div>
              <div className="text-3xl font-bold text-white">5,000+</div>
              <div className="text-sm text-gray-400 mt-1">Teams</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">40+</div>
              <div className="text-sm text-gray-400 mt-1">AWS services</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-sm text-gray-400 mt-1">Uptime SLA</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">$0</div>
              <div className="text-sm text-gray-400 mt-1">To start</div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-24 bg-gradient-to-b from-gray-950 to-white" />

      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest">Features</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
              Everything your team needs
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              CloudForge turns complex infrastructure diagrams into deployable Terraform — in seconds, not days.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-5">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25L12 17.25 2.25 12l4.179-2.25" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Visual Canvas Builder</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Drag and drop AWS services and wire valid infrastructure relationships automatically.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-5">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Real-time Terraform</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Generate production-ready Terraform instantly as you edit your infrastructure graph.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-5">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">One-Click Deploy</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Promote plans to apply with a guided workflow and clear execution visibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest">How it works</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
              From idea to deployment in 3 steps
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-bold mb-5">
                01
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25L12 17.25 2.25 12l4.179-2.25" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Design</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Draw infrastructure visually with reusable service building blocks on an infinite canvas.
              </p>
            </div>

            <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-bold mb-5">
                02
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Generate</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Generate clean Terraform code organized by resources and modules, ready for production.
              </p>
            </div>

            <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-bold mb-5">
                03
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Deploy</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Deploy directly from CloudForge with environment-aware settings and execution logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Start free. Scale when you need to.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Free</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-base text-gray-500">/month</span>
              </div>
              <p className="mt-4 text-sm text-gray-600">Perfect for learning and small projects.</p>
              <ul className="mt-8 space-y-3">
                <li className="flex items-center gap-3 text-sm text-gray-600"><svg className="h-5 w-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>3 projects</li>
                <li className="flex items-center gap-3 text-sm text-gray-600"><svg className="h-5 w-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>5 AWS services</li>
                <li className="flex items-center gap-3 text-sm text-gray-600"><svg className="h-5 w-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Download .tf files</li>
                <li className="flex items-center gap-3 text-sm text-gray-600"><svg className="h-5 w-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Community support</li>
              </ul>
              <Link to="/register" className="mt-8 block w-full rounded-xl border border-gray-300 bg-white py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Get started</Link>
            </div>

            <div className="rounded-2xl border-2 border-indigo-600 bg-white p-8 shadow-lg shadow-indigo-600/10 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">Most Popular</div>
              <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">$29</span>
                <span className="text-base text-gray-500">/month</span>
              </div>
              <p className="mt-4 text-sm text-gray-600">For teams shipping real infrastructure.</p>
              <ul className="mt-8 space-y-3">
                <li className="flex items-center gap-3 text-sm text-gray-600"><svg className="h-5 w-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Unlimited projects</li>
                <li className="flex items-center gap-3 text-sm text-gray-600"><svg className="h-5 w-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>16 AWS services</li>
                <li className="flex items-center gap-3 text-sm text-gray-600"><svg className="h-5 w-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Deploy from canvas</li>
                <li className="flex items-center gap-3 text-sm text-gray-600"><svg className="h-5 w-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Import Terraform</li>
                <li className="flex items-center gap-3 text-sm text-gray-600"><svg className="h-5 w-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Budget tracking</li>
                <li className="flex items-center gap-3 text-sm text-gray-600"><svg className="h-5 w-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Email support</li>
              </ul>
              <Link to="/register" className="mt-8 block w-full rounded-xl bg-indigo-600 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors">Start free trial</Link>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Team</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">$79</span>
                <span className="text-base text-gray-500">/month</span>
              </div>
              <p className="mt-4 text-sm text-gray-600">For organizations with advanced needs.</p>
              <ul className="mt-8 space-y-3">
                <li className="flex items-center gap-3 text-sm text-gray-600"><svg className="h-5 w-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Everything in Pro</li>
                <li className="flex items-center gap-3 text-sm text-gray-600"><svg className="h-5 w-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Team collaboration</li>
                <li className="flex items-center gap-3 text-sm text-gray-600"><svg className="h-5 w-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Audit logs</li>
                <li className="flex items-center gap-3 text-sm text-gray-600"><svg className="h-5 w-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Priority support</li>
                <li className="flex items-center gap-3 text-sm text-gray-600"><svg className="h-5 w-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>SSO integration</li>
              </ul>
              <Link to="/register" className="mt-8 block w-full rounded-xl border border-gray-300 bg-white py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Contact sales</Link>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link to="/pricing" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
              See all plans and compare features →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-indigo-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to build?</h2>
          <p className="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
            Start modeling secure AWS infrastructure with CloudForge today. No credit card required.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-50 shadow-lg transition-all duration-200"
          >
            Get Started Free
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <div className="flex items-center gap-2">
                <img src="/images/logo.svg" alt="CloudForge" className="h-8 w-8" />
                <span className="text-lg font-bold text-white">CloudForge</span>
              </div>
              <p className="mt-2 text-sm text-gray-400 max-w-xs">
                Visual infrastructure builder for AWS. From diagram to deployment.
              </p>
            </div>

            <div className="flex flex-wrap gap-8">
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a></li>
                  <li><Link to="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Changelog</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-500">&copy; 2024 CloudForge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
