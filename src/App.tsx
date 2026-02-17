import { useState, useEffect } from 'react'
import chanukaKids from './assets/chanuka-kids.png'
import chanukaStudents from './assets/chanuka-students.png'
import chanukaLogoA from './assets/chanuka-a.svg'
import chanukaLogoB from './assets/Chanuka-b.svg'
import './App.css'

const SMS_SHORTCODE = '23702'

/** Safaricom Identity API – verifies user is on Safaricom data (returns masked MSISDN when on Safaricom) */
const SAFARICOM_FETCH_MSISDN_URL = 'https://identity.safaricom.com/partner/api/v2/fetchMaskedMsisdn'
/** Optional override: your own API that returns { allowed: boolean } or 403. Set in .env as VITE_CHECK_CARRIER_URL */
const CHECK_CARRIER_URL = import.meta.env.VITE_CHECK_CARRIER_URL

function SafaricomRequired({ onGoHome }: { onGoHome?: () => void }) {
  useEffect(() => {
    const prev = document.title
    document.title = 'Safaricom Data Required'
    return () => {
      document.title = prev
    }
  }, [])
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-gray-800 p-6 text-center shadow-lg">
        <div className="mb-4 flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0 3.75h.008M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
            />
          </svg>
        </div>
        <h1 className="mb-3 text-lg font-semibold text-white">Safaricom Data Required</h1>
        <p className="mb-6 text-sm leading-relaxed text-gray-300">
          Kindly connect using your <span className="font-medium text-white">Safaricom data</span> to help us verify
          your phone number.
        </p>
        {onGoHome ? (
          <button
            type="button"
            onClick={onGoHome}
            className="block w-full rounded-xl bg-green-600 py-3 text-sm font-medium text-white transition hover:bg-green-700"
          >
            Go Back Home
          </button>
        ) : (
          <a
            href="/"
            className="block w-full rounded-xl bg-green-600 py-3 text-sm font-medium text-white transition hover:bg-green-700"
            title="Return to Chanuka Bursary home"
          >
            Go Back Home
          </a>
        )}
      </div>
    </div>
  )
}

function App() {
  const [copied, setCopied] = useState(false)
  const [showVerifying, setShowVerifying] = useState(false)
  const [showSafaricomRequired, setShowSafaricomRequired] = useState(false)
  const [checkingSafaricom, setCheckingSafaricom] = useState(false)

  /** Check if user is on Safaricom data (called when user clicks apply or image) */
  const checkSafaricomData = async (): Promise<boolean> => {
    if (CHECK_CARRIER_URL) {
      const res = await fetch(CHECK_CARRIER_URL, { method: 'GET', credentials: 'same-origin' })
      if (res.status === 403 || !res.ok) return false
      const data = await res.json().catch(() => ({}))
      return Boolean(data && typeof data.allowed === 'boolean' && data.allowed)
    }
    try {
      const res = await fetch(SAFARICOM_FETCH_MSISDN_URL, {
        method: 'GET',
        mode: 'cors',
        headers: { Accept: 'application/json' },
      })
      return res.ok
    } catch {
      return false
    }
  }

  const handleParticipate = async () => {
    setCheckingSafaricom(true)
    const onSafaricom = await checkSafaricomData()
    setCheckingSafaricom(false)
    if (!onSafaricom) {
      setShowSafaricomRequired(true)
      return
    }
    setShowVerifying(true)
    try {
      await navigator.clipboard.writeText(SMS_SHORTCODE)
      setCopied(true)
    } catch {
      window.location.href = `sms:${SMS_SHORTCODE}`
    }
    setTimeout(() => {
      setShowVerifying(false)
      setTimeout(() => setCopied(false), 2000)
    }, 2000)
  }

  if (showSafaricomRequired) {
    return <SafaricomRequired onGoHome={() => setShowSafaricomRequired(false)} />
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#FFF9F1] text-slate-900">
      {/* Checking Safaricom data… */}
      {checkingSafaricom && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#0f172a] text-white"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="verify-spinner" />
          <p className="text-lg font-semibold">Checking connection</p>
          <p className="text-sm text-slate-300">Please wait...</p>
        </div>
      )}
      {/* Verification / loading overlay */}
      {showVerifying && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#0f172a] text-white"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="verify-spinner" />
          <p className="text-lg font-semibold">Verifying your phone number</p>
          <p className="text-sm text-slate-300">Please wait, this will only take a moment...</p>
        </div>
      )}
      <header className="shrink-0 border-b border-slate-200/80 bg-white px-3 py-2.5 shadow-sm sm:px-4">
        <div className="mx-auto flex w-full max-w-[min(100%,1400px)] items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={chanukaLogoA} alt="Chanuka Bursary" className="h-8 w-auto" />
            <span className="text-sm font-semibold text-slate-800">Chanuka Bursary</span>
          </div>
          <button
            type="button"
            onClick={handleParticipate}
            disabled={checkingSafaricom}
            className="apply-by-sms-cta apply-by-sms-blink rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow disabled:opacity-70"
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

          {/* Images – click checks Safaricom then applies or shows Safaricom Required */}
          <div className="mx-auto mt-8 w-full max-w-4xl px-1 sm:px-2">
            <div className="grid grid-cols-2 gap-5 sm:gap-6 md:gap-8">
              <button
                type="button"
                onClick={handleParticipate}
                disabled={checkingSafaricom}
                className="group flex aspect-[3/4] min-h-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0057A5] focus:ring-offset-2 disabled:opacity-70"
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
                disabled={checkingSafaricom}
                className="group flex aspect-[3/4] min-h-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0057A5] focus:ring-offset-2 disabled:opacity-70"
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
            disabled={checkingSafaricom}
            className="participate-btn mx-auto mt-8 block w-full max-w-4xl rounded-xl py-4 text-base font-bold uppercase tracking-wide text-white transition focus:outline-none focus:ring-2 focus:ring-[#0057A5] focus:ring-offset-2 disabled:opacity-70"
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
