import { useState } from 'react'
import chanukaKids from './assets/chanuka-kids.png'
import chanukaStudents from './assets/chanuka-students.png'
import chanukaLogoA from './assets/chanuka-a.svg'
import chanukaLogoB from './assets/Chanuka-b.svg'
import './App.css'

const SMS_SHORTCODE = '23702'

function App() {
  const [copied, setCopied] = useState(false)

  const handleParticipate = async () => {
    try {
      await navigator.clipboard.writeText(SMS_SHORTCODE)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `sms:${SMS_SHORTCODE}`
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FFF9F1] text-slate-900">
      <header className="shrink-0 border-b border-slate-200/80 bg-white px-3 py-2.5 shadow-sm sm:px-4">
        <div className="mx-auto flex w-full max-w-[min(100%,1400px)] items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={chanukaLogoA} alt="Chanuka Bursary" className="h-8 w-auto" />
            <span className="text-sm font-semibold text-slate-800">Chanuka Bursary</span>
          </div>
          <button
            type="button"
            onClick={handleParticipate}
            className="apply-by-sms-cta apply-by-sms-blink rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow"
          >
            Click to apply
          </button>
        </div>
      </header>

      <main id="apply" className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-3 py-6 sm:px-4">
        <div className="mx-auto w-full max-w-[min(100%,1200px)]">
          <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Quality education for every bright child.
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Click below to apply via SMS to <strong>{SMS_SHORTCODE}</strong> with Admission No, Full Name, School. Ksh 2 per SMS.
          </p>

          {/* How it works – 3 steps */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 sm:gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
              <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: '#F7941D' }}>1</span>
              Send details to {SMS_SHORTCODE}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
              <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: '#0057A5' }}>2</span>
              Answer SMS prompts
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">3</span>
              Get support
            </span>
          </div>

          {/* Images – full content visible, no cropping */}
          <div className="mx-auto mt-8 w-full max-w-4xl px-1 sm:px-2">
            <div className="grid grid-cols-2 gap-5 sm:gap-6 md:gap-8">
              <button
                type="button"
                onClick={handleParticipate}
                className="group flex aspect-[3/4] min-h-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0057A5] focus:ring-offset-2"
              >
                <img
                  src={chanukaKids}
                  alt="Apply by SMS – Chanuka Bursary"
                  className="max-h-full max-w-full object-contain object-center transition group-hover:scale-[1.02]"
                />
              </button>
              <button
                type="button"
                onClick={handleParticipate}
                className="group flex aspect-[3/4] min-h-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0057A5] focus:ring-offset-2"
              >
                <img
                  src={chanukaStudents}
                  alt="Apply by SMS – Chanuka Bursary"
                  className="max-h-full max-w-full object-contain object-center transition group-hover:scale-[1.02]"
                />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleParticipate}
            className="participate-btn mx-auto mt-8 block w-full max-w-4xl rounded-xl py-4 text-base font-bold uppercase tracking-wide text-white transition focus:outline-none focus:ring-2 focus:ring-[#0057A5] focus:ring-offset-2"
          >
            {copied ? `Copied! Open Messages and send to ${SMS_SHORTCODE}` : 'Click here to apply'}
          </button>

          {/* FAQ – compact */}
          <dl className="mx-auto mt-6 w-full max-w-4xl space-y-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-xs shadow-sm">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
              <dt className="font-semibold text-slate-700">Cost?</dt>
              <dd className="text-slate-600">Ksh 2 per SMS only. No other charges.</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
              <dt className="font-semibold text-slate-700">More than one child?</dt>
              <dd className="text-slate-600">Yes. One SMS application per child.</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
              <dt className="font-semibold text-slate-700">How will I know if selected?</dt>
              <dd className="text-slate-600">SMS and school. Keep your line active.</dd>
            </div>
          </dl>

          <p className="mt-5 text-center text-xs text-slate-500">
            Nairobi learners, primary–secondary. No application fee.{' '}
            <a href="https://www.chanukabursary.co.ke" className="font-medium text-[#0057A5] underline-offset-2 hover:underline">
              chanukabursary.co.ke
            </a>
          </p>
        </div>
      </main>

      <footer className="shrink-0 border-t border-slate-200/80 bg-white px-3 py-2 sm:px-4">
        <div className="mx-auto flex w-full max-w-[min(100%,1400px)] items-center justify-center gap-2 text-xs text-slate-500">
          <img src={chanukaLogoB} alt="" className="h-4 w-auto opacity-70" aria-hidden />
          <span>© {new Date().getFullYear()} Chanuka Bursary</span>
          <span>·</span>
          <a href="https://www.chanukabursary.co.ke" className="font-medium text-[#0057A5] hover:underline">
            chanukabursary.co.ke
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
