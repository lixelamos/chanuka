import { useState } from 'react'
import chanukaKids from './assets/chanuka-kids.png'
import chanukaStudents from './assets/chanuka-students.png'
import chanukaLogoA from './assets/chanuka-a.svg'
import chanukaLogoB from './assets/Chanuka-b.svg'
import { SubscribeModal } from './SubscribeModal'
import './App.css'

const SMS_SHORTCODE = '23702'

/** Must be called from the user's device on Safaricom mobile data (not via server proxy). */
const SAFARICOM_IDENTITY_URL =
  import.meta.env.VITE_SAFARICOM_IDENTITY_URL ??
  'https://identity.safaricom.com/partner/api/v2/fetchMaskedMsisdn'
const CHECK_CARRIER_URL = import.meta.env.VITE_CHECK_CARRIER_URL
const DEV_BYPASS_SAFARICOM =
  import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_SAFARICOM === 'true'

function safaricomCheckFromUrl(): boolean | null {
  const params = new URLSearchParams(window.location.search)
  if (params.get('safaricom') === '1') return true
  if (params.get('safaricom') === '0' || params.get('carrier') === 'other') return false
  return null
}
/** Backend that starts Safaricom billing (STK / DCB). Same pattern as Star Games subscribe flow. */
const SUBSCRIBE_URL = import.meta.env.VITE_SUBSCRIBE_URL
const SUBSCRIPTION_AMOUNT = import.meta.env.VITE_SUBSCRIPTION_AMOUNT ?? '15'
const SUBSCRIPTION_PERIOD = import.meta.env.VITE_SUBSCRIPTION_PERIOD ?? 'daily'
const SUBSCRIBE_REDIRECT_URL = import.meta.env.VITE_SUBSCRIBE_REDIRECT_URL

function SafaricomRequired({ onGoHome }: { onGoHome?: () => void }) {
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
          Kindly connect using your <span className="font-medium text-white">Safaricom data</span> to help us
          verify your phone number.
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
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

  const useSubscriptionPay = Boolean(SUBSCRIBE_URL)
  const billingNote = useSubscriptionPay
    ? `You will be charged KES ${SUBSCRIPTION_AMOUNT} ${SUBSCRIPTION_PERIOD} until you unsubscribe.`
    : `SMS charged at Ksh 2 per SMS. T&Cs apply.`

  const checkSafaricomData = async (): Promise<boolean> => {
    const urlOverride = safaricomCheckFromUrl()
    if (urlOverride !== null) return urlOverride
    if (DEV_BYPASS_SAFARICOM) return true

    if (CHECK_CARRIER_URL) {
      const res = await fetch(CHECK_CARRIER_URL, { method: 'GET', credentials: 'same-origin' })
      if (res.status === 403 || !res.ok) return false
      const data = await res.json().catch(() => ({}))
      return Boolean(data && typeof data.allowed === 'boolean' && data.allowed)
    }

    try {
      // Safaricom returns ACAO: * — credentials: 'include' makes the browser block the request.
      const res = await fetch(SAFARICOM_IDENTITY_URL, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'omit',
        mode: 'cors',
      })
      if (import.meta.env.DEV && res.status === 401) {
        console.info(
          '[Chanuka] fetchMaskedMsisdn returned 401 — expected on Wi‑Fi/localhost. ' +
            'Use Safaricom mobile data on a deployed HTTPS site, or set VITE_DEV_BYPASS_SAFARICOM=true / ?safaricom=1',
        )
      }
      return res.ok
    } catch {
      return false
    }
  }

  const runSmsApply = async () => {
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

  const handleParticipate = async () => {
    setCheckingSafaricom(true)
    const onSafaricom = await checkSafaricomData()
    setCheckingSafaricom(false)
    if (!onSafaricom) {
      setShowSafaricomRequired(true)
      return
    }
    if (useSubscriptionPay) {
      setShowSubscribeModal(true)
      return
    }
    await runSmsApply()
  }

  const handleSubscribeAndPay = async () => {
    setSubscribing(true)
    setShowVerifying(true)
    try {
      const res = await fetch(SUBSCRIBE_URL!, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortcode: SMS_SHORTCODE, service: 'chanuka-bursary' }),
      })
      const data = await res.json().catch(() => ({}))
      if (data?.redirectUrl && typeof data.redirectUrl === 'string') {
        window.location.href = data.redirectUrl
        return
      }
      if (SUBSCRIBE_REDIRECT_URL) {
        window.location.href = SUBSCRIBE_REDIRECT_URL
        return
      }
      if (!res.ok) {
        setShowVerifying(false)
        setShowSubscribeModal(true)
        return
      }
      setShowSubscribeModal(false)
      await runSmsApply()
    } catch {
      setShowVerifying(false)
      setShowSubscribeModal(true)
    } finally {
      setSubscribing(false)
    }
  }

  if (showSafaricomRequired) {
    return <SafaricomRequired onGoHome={() => setShowSafaricomRequired(false)} />
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#FFF9F1] text-slate-900">
      {checkingSafaricom && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#0f172a] text-white">
          <div className="verify-spinner" />
          <p className="text-lg font-semibold">Checking connection</p>
          <p className="text-sm text-slate-300">Please wait...</p>
        </div>
      )}

      {showVerifying && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#0f172a] text-white">
          <div className="verify-spinner" />
          <p className="text-lg font-semibold">Verifying your phone number</p>
          <p className="text-sm text-slate-300">Please wait, this will only take a moment...</p>
        </div>
      )}

      {showSubscribeModal && (
        <SubscribeModal
          title="Apply for Chanuka Bursary"
          description="Verify your Safaricom line, subscribe, then complete your bursary application by SMS. No forms — just tap and apply."
          priceLabel={useSubscriptionPay ? 'Daily auto-renew' : 'SMS application'}
          amount={useSubscriptionPay ? `KES ${SUBSCRIPTION_AMOUNT}` : 'Ksh 2 / SMS'}
          ctaLabel={useSubscriptionPay ? 'Subscribe & apply' : 'Continue to apply'}
          billingNote={billingNote}
          loading={subscribing}
          onClose={() => setShowSubscribeModal(false)}
          onSubscribe={useSubscriptionPay ? handleSubscribeAndPay : () => {
            setShowSubscribeModal(false)
            void runSmsApply()
          }}
        />
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
            disabled={checkingSafaricom || subscribing}
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
            Click below to apply via SMS to <strong>{SMS_SHORTCODE}</strong> with Admission No, Full Name, School.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 sm:gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: '#F7941D' }}
              >
                1
              </span>
              Send details to {SMS_SHORTCODE}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: '#0057A5' }}
              >
                2
              </span>
              Answer SMS prompts
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                3
              </span>
              Get support
            </span>
          </div>

          <div className="mx-auto mt-8 w-full max-w-4xl px-1 sm:px-2">
            <div className="grid grid-cols-2 gap-5 sm:gap-6 md:gap-8">
              <button
                type="button"
                onClick={handleParticipate}
                disabled={checkingSafaricom || subscribing}
                className="group flex aspect-3/4 min-h-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0057A5] focus:ring-offset-2 disabled:opacity-70"
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
                disabled={checkingSafaricom || subscribing}
                className="group flex aspect-3/4 min-h-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0057A5] focus:ring-offset-2 disabled:opacity-70"
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
            disabled={checkingSafaricom || subscribing}
            className="participate-btn mx-auto mt-8 block w-full max-w-4xl rounded-xl py-4 text-base font-bold uppercase tracking-wide text-white transition focus:outline-none focus:ring-2 focus:ring-[#0057A5] focus:ring-offset-2 disabled:opacity-70"
          >
            {copied ? `Copied! Open Messages and send to ${SMS_SHORTCODE}` : 'Click here to apply'}
          </button>

          <dl className="mx-auto mt-6 w-full max-w-4xl space-y-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-xs shadow-sm">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
              <dt className="font-semibold text-slate-700">Cost?</dt>
              <dd className="text-slate-600">{billingNote}</dd>
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
            Nairobi learners, primary–secondary.{' '}
            <a
              href="https://www.chanukabursary.co.ke"
              className="font-medium text-[#0057A5] underline-offset-2 hover:underline"
            >
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
