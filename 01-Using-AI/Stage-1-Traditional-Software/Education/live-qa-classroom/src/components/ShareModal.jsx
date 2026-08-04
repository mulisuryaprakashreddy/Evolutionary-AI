import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, QrCode, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCopyToClipboard } from "../realtime/useRoom.js";

export default function ShareModal({ open, onClose, roomCode, shareUrl }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Share this room"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="card relative z-10 w-full max-w-md p-6"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              aria-label="Close share dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-brand-300">
              <QrCode className="h-5 w-5" />
              <h2 className="text-lg font-bold text-white">Invite your class</h2>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Students scan the QR code or enter the room code at the home page.
            </p>

            {/* QR */}
            <div className="mt-5 flex justify-center">
              <div className="rounded-2xl bg-white p-4 shadow-card">
                <QRCodeSVG value={shareUrl} size={196} includeMargin={false} level="M" />
              </div>
            </div>

            {/* Room code */}
            <div className="mt-5">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Room code
              </p>
              <div className="rounded-xl border border-white/10 bg-ink-900/60 py-3 text-center">
                <span className="font-mono text-2xl font-extrabold tracking-[0.35em] text-white">
                  {roomCode}
                </span>
              </div>
            </div>

            {/* Share link */}
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Share link
              </p>
              <button
                type="button"
                onClick={() => copy(shareUrl)}
                className="btn-ghost w-full justify-between px-4 py-3 text-sm"
              >
                <span className="truncate font-mono text-slate-300">{shareUrl}</span>
                <span className="ml-3 inline-flex items-center gap-1.5 font-semibold text-brand-300">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
