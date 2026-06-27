import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, MapPin, ShieldCheck, Loader2 } from 'lucide-react';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import Vipin from '../../components/Vipin';
import { log } from '../../lib/log';
import { haptic } from '../../lib/haptics';
import { markOnboardingDone, setLocationGranted } from '../../data/store';
import { isInCluster } from '../../data/cluster';

/* The way in. Welcome → phone identity (mock OTP) → location ladder with a
   working denied fallback → anonymity explainer → land in Pulse. Each step is a
   focused screen with a clear back path; the product never dead-ends, including
   on a denied location permission. */

type StepKey = 'welcome' | 'phone' | 'otp' | 'location' | 'anonymity';
const STEPS: StepKey[] = ['welcome', 'phone', 'otp', 'location', 'anonymity'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [locState, setLocState] = useState<'idle' | 'requesting' | 'granted' | 'fallback'>('idle');

  // Log each step as it is reached (PRS section 9).
  useEffect(() => {
    log('onboarding_step_reached', { step });
  }, [step]);

  function next() {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }
  function back() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function finish() {
    markOnboardingDone();
    log('onboarding_completed');
    haptic('success');
    navigate('/app/pulse', { replace: true });
  }

  function requestLocation() {
    setLocState('requesting');
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationGranted(false);
      log('location_denied', { reason: 'unsupported' });
      setLocState('fallback');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const inside = isInCluster(pos.coords.latitude, pos.coords.longitude);
        setLocationGranted(true);
        log('location_granted', { inCluster: inside });
        haptic('confirm');
        setLocState('granted');
      },
      () => {
        // Denied or unavailable — fall back to the cluster centre, never dead-end.
        setLocationGranted(false);
        log('location_denied', { reason: 'permission' });
        setLocState('fallback');
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  function skipLocation() {
    setLocationGranted(false);
    log('location_denied', { reason: 'skipped' });
    setLocState('fallback');
  }

  const transition = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 320, damping: 32 };

  return (
    <main className="min-h-[100svh] bg-paper text-ink flex flex-col">
      {/* Top bar: back path + progress dots */}
      <div className="flex items-center justify-between px-4 pt-4 min-h-[56px]">
        {stepIndex > 0 ? (
          <button
            onClick={back}
            aria-label="Go back"
            className="flex items-center justify-center w-11 h-11 -ml-2 rounded-pill text-ink-soft hover:text-ink"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
        ) : (
          <span className="w-11 h-11" aria-hidden="true" />
        )}
        <div className="flex items-center gap-1.5" role="presentation">
          {STEPS.map((s, i) => (
            <span
              key={s}
              aria-hidden="true"
              className={`h-1.5 rounded-pill transition-all ${
                i === stepIndex ? 'w-5 bg-cobalt' : 'w-1.5 bg-line'
              }`}
            />
          ))}
        </div>
        <span className="w-11 h-11" aria-hidden="true" />
      </div>

      <div className="flex-1 flex flex-col px-6 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: reduce ? 0 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduce ? 0 : -24 }}
            transition={transition}
            className="flex-1 flex flex-col"
          >
            {step === 'welcome' && (
              <Centered>
                <Vipin mood="hello" size={104} />
                <h1 className="font-display text-[32px] leading-9 font-extrabold mt-6">Push The Pin</h1>
                <p className="text-body-l text-ink-soft mt-3 max-w-xs">
                  See what's alive on your street, and get things fixed, together.
                </p>
                <p className="text-caption text-ink-faint mt-2">Bandra West, H-West</p>
                <Button fullWidth className="mt-10 max-w-xs" onClick={next}>
                  Get started
                </Button>
              </Centered>
            )}

            {step === 'phone' && (
              <TopAligned>
                <h2 className="font-display text-[26px] leading-8 font-bold">What's your number?</h2>
                <p className="text-body text-ink-soft mt-2">
                  Your phone is just how we know it's you. It's never shown to other
                  residents — not here, not anywhere.
                </p>
                <div className="mt-6">
                  <TextInput
                    label="Phone number"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="98XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s]/g, ''))}
                    hint="Any number works in this prototype."
                  />
                </div>
                <div className="mt-auto pt-8">
                  <Button fullWidth onClick={next} disabled={phone.replace(/\D/g, '').length < 6}>
                    Send code
                  </Button>
                </div>
              </TopAligned>
            )}

            {step === 'otp' && (
              <TopAligned>
                <h2 className="font-display text-[26px] leading-8 font-bold">Enter the code</h2>
                <p className="text-body text-ink-soft mt-2">
                  We sent a code to {phone.trim() || 'your number'}.
                </p>
                <div className="mt-6">
                  <TextInput
                    label="Verification code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="1234"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    hint="Any code works — this is a prototype, so it always succeeds."
                  />
                </div>
                <div className="mt-auto pt-8">
                  <Button fullWidth onClick={next} disabled={code.length < 4}>
                    Verify
                  </Button>
                </div>
              </TopAligned>
            )}

            {step === 'location' && (
              <TopAligned>
                <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-cobalt/10 text-cobalt">
                  <MapPin size={28} aria-hidden="true" />
                </div>
                <h2 className="font-display text-[26px] leading-8 font-bold mt-5">
                  Where are you?
                </h2>

                {locState === 'idle' && (
                  <>
                    <p className="text-body text-ink-soft mt-2">
                      Sharing precise location places your pins exactly where they
                      belong. You can always browse Bandra West without it.
                    </p>
                    <div className="mt-auto pt-8 flex flex-col gap-3">
                      <Button fullWidth onClick={requestLocation}>
                        Use my precise location
                      </Button>
                      <Button variant="ghost" fullWidth onClick={skipLocation}>
                        Not now
                      </Button>
                    </div>
                  </>
                )}

                {locState === 'requesting' && (
                  <div className="flex items-center gap-2 text-ink-soft mt-6" role="status">
                    <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                    <span>Finding your spot…</span>
                  </div>
                )}

                {locState === 'granted' && (
                  <>
                    <p className="text-body text-ink-soft mt-2">
                      Got it — you're in Bandra West. Your map is ready.
                    </p>
                    <div className="mt-auto pt-8">
                      <Button fullWidth onClick={next}>Continue</Button>
                    </div>
                  </>
                )}

                {locState === 'fallback' && (
                  <>
                    <div className="mt-3 rounded-lg border border-line bg-paper-raised p-4">
                      <p className="text-body text-ink">
                        No problem. You'll browse from the centre of Bandra West.
                      </p>
                      <p className="text-caption text-ink-soft mt-1">
                        You can turn on precise location later in Profile — it just
                        places your own pins more accurately.
                      </p>
                    </div>
                    <div className="mt-auto pt-8">
                      <Button fullWidth onClick={next}>Continue</Button>
                    </div>
                  </>
                )}
              </TopAligned>
            )}

            {step === 'anonymity' && (
              <Centered>
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-cobalt/10 text-cobalt">
                  <ShieldCheck size={32} aria-hidden="true" />
                </div>
                <h2 className="font-display text-[32px] leading-9 font-extrabold mt-6">
                  Your name is never shown
                </h2>
                <p className="text-body-l text-ink-soft mt-3 max-w-sm">
                  To everyone here you're just a neighbour — like
                  {' '}<span className="text-ink font-semibold">"a neighbour on Waroda Road"</span>.
                  No name, no photo, no profile. That's the deal, and it doesn't change.
                </p>
                <Button fullWidth className="mt-10 max-w-xs" onClick={finish}>
                  Got it — take me in
                </Button>
              </Centered>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      {children}
    </div>
  );
}

function TopAligned({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 flex flex-col pt-8">{children}</div>;
}
