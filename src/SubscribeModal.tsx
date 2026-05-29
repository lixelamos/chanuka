type SubscribeModalProps = {
  onClose: () => void
  onSubscribe: () => void
  loading?: boolean
  priceLabel: string
  amount: string
  billingNote: string
  title: string
  description: string
  ctaLabel: string
}

export function SubscribeModal({
  onClose,
  onSubscribe,
  loading = false,
  priceLabel,
  amount,
  billingNote,
  title,
  description,
  ctaLabel,
}: SubscribeModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscribe-modal-title"
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 p-6 text-center shadow-2xl ring-1 ring-white/10">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-xl text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          aria-label="Close"
        >
          ✕
        </button>

        <p className="mb-2 text-2xl" aria-hidden>
          📱
        </p>
        <h2 id="subscribe-modal-title" className="text-lg font-bold text-white">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{description}</p>

        <div className="mt-6 rounded-xl bg-slate-800/80 px-4 py-4 ring-1 ring-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{priceLabel}</p>
          <p className="mt-1 text-3xl font-bold text-white">{amount}</p>
        </div>

        <button
          type="button"
          onClick={onSubscribe}
          disabled={loading}
          className="subscribe-pay-btn mt-6 w-full rounded-xl py-3.5 text-sm font-bold uppercase tracking-wide text-white transition disabled:opacity-70"
        >
          {loading ? 'Please wait…' : ctaLabel}
        </button>

        <p className="mt-4 text-xs leading-relaxed text-slate-500">{billingNote}</p>
      </div>
    </div>
  )
}
