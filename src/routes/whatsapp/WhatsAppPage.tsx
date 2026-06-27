import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { ArrowLeft, Check, MoreVertical, Phone } from 'lucide-react';
import Vipin from '../../components/Vipin';
import { log } from '../../lib/log';
import { haptic } from '../../lib/haptics';

/*
  The WhatsApp imitation — the real civic bot conversation with VIPIN, played
  as a scripted flow from report through the dead-zone wait to the resolution
  photo. Not a generic chat shell. VIPIN bubbles left with the avatar, resident
  replies right. Voice: calm, plain, local, honest about timelines.
*/

type Line = string | { image: true; caption: string };

interface Choice {
  label: string;
  next: string;
  residentSays?: string;
}

interface Stage {
  vipin: Line[];
  choices?: Choice[];
  survey?: boolean;
  autoNext?: string;
}

const STAGES: Record<string, Stage> = {
  start: {
    vipin: [
      'Hi, I’m VIPIN 👋',
      'I help keep an eye on Bandra West, together with the people who live here.',
      'Seen something that needs fixing? Tell me and I’ll put it on the record.',
    ],
    choices: [
      { label: 'Report a thing', next: 'category', residentSays: 'I’d like to report something' },
      { label: 'Just looking', next: 'justlooking' },
    ],
  },
  justlooking: {
    vipin: ['No rush. I’m here whenever something comes up on your street.'],
    choices: [{ label: 'Actually, report a thing', next: 'category', residentSays: 'Let me report something' }],
  },
  category: {
    vipin: ['What did you see? Pick what’s closest.'],
    choices: [
      { label: 'Garbage not cleared', next: 'location', residentSays: 'Garbage not cleared, on the corner' },
      { label: 'Pothole', next: 'location', residentSays: 'A pothole' },
      { label: 'Water logging', next: 'location', residentSays: 'Water logging' },
      { label: 'Streetlight out', next: 'location', residentSays: 'A streetlight that’s out' },
    ],
  },
  location: {
    vipin: ['Got it. Where is it? Share your location and I’ll pin it to the spot.'],
    choices: [{ label: '📍 Share location', next: 'locconfirm', residentSays: '📍 Shared my location' }],
  },
  locconfirm: {
    vipin: [
      'Thanks — that’s near Waroda Road, in H-West.',
      'One thing worth saying: your name is never shown to anyone. People only ever see “a neighbour on Waroda Road”.',
    ],
    choices: [{ label: 'Good to know', next: 'photo', residentSays: 'Good to know' }],
  },
  photo: {
    vipin: ['A photo helps the record. Want to add one?'],
    choices: [
      { label: '📷 Add a photo', next: 'photoadded', residentSays: '📷 Photo added' },
      { label: 'Skip', next: 'submitted', residentSays: 'Skip for now' },
    ],
  },
  photoadded: {
    vipin: ['Got it. I strip out the photo’s hidden location and details first, so nothing personal travels with it.'],
    autoNext: 'submitted',
  },
  submitted: {
    vipin: ['Done. Your report is on the record now.', 'I’ll send it to the BMC ward office next.'],
    autoNext: 'routed',
  },
  routed: {
    vipin: [
      'Sent. The ward office has it.',
      'Your reference is BMC-HW-2026-04863. Keep it — that’s how the city tracks this one.',
    ],
    choices: [{ label: 'What happens now?', next: 'waiting', residentSays: 'What happens now?' }],
  },
  waiting: {
    vipin: [
      'Honestly? Now we wait.',
      'The city can be slow. Sometimes days pass with nothing visible. That’s normal here, not a dead end.',
      'I won’t over-promise. I’ll just tell you the moment anything actually changes.',
    ],
    choices: [{ label: 'Skip the wait ▶', next: 'update', residentSays: '(a few days later…)' }],
  },
  update: {
    vipin: [
      'A few days on. Still with the city. Hanging in there.',
      'Update: someone’s been out to the spot. Looks sorted. Here’s the proof 👇',
    ],
    autoNext: 'resolved',
  },
  resolved: {
    vipin: [
      { image: true, caption: 'After · Waroda Road corner' },
      'Fixed. The corner’s clear again.',
      'Want to confirm it’s actually done, for the neighbourhood’s record?',
    ],
    choices: [{ label: 'Confirm it’s fixed ✓', next: 'closed', residentSays: 'Confirmed — it’s fixed ✓' }],
  },
  closed: {
    vipin: [
      'That’s the part that matters — a neighbour saw it, not a number on some dashboard.',
      'Thank you. That’s how this stays honest.',
    ],
    survey: true,
  },
  done: {
    vipin: ['Thanks for that — it genuinely helps us make this better.', 'I’ll be here next time something comes up.'],
    choices: [{ label: 'Start over', next: 'start', residentSays: 'Start over' }],
  },
};

const SURVEY_QUESTION = 'Quick one — how did that feel?';
const SURVEY_OPTIONS = ['Reassuring', 'It was okay', 'Still a bit skeptical'];

interface Msg {
  id: number;
  from: 'vipin' | 'resident';
  text?: string;
  image?: { caption: string };
}

export default function WhatsAppPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [choices, setChoices] = useState<Choice[] | null>(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);

  const idRef = useRef(0);
  const cancelled = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const nextId = () => ++idRef.current;
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));

  const enterStage = useCallback(
    async (id: string) => {
      const stage = STAGES[id];
      if (!stage) return;
      setChoices(null);
      setShowSurvey(false);
      setBusy(true);

      for (const line of stage.vipin) {
        if (cancelled.current) return;
        setTyping(true);
        await sleep(typeof line === 'string' ? Math.min(900, 350 + line.length * 12) : 700);
        if (cancelled.current) return;
        setTyping(false);
        if (typeof line === 'string') {
          setMessages((prev) => [...prev, { id: nextId(), from: 'vipin', text: line }]);
        } else {
          setMessages((prev) => [...prev, { id: nextId(), from: 'vipin', image: { caption: line.caption } }]);
        }
        await sleep(120);
      }

      if (stage.survey) {
        log('survey_shown', { where: 'whatsapp', question: SURVEY_QUESTION });
        setShowSurvey(true);
        setBusy(false);
      } else if (stage.choices) {
        setChoices(stage.choices);
        setBusy(false);
      } else if (stage.autoNext) {
        await sleep(500);
        if (cancelled.current) return;
        enterStage(stage.autoNext);
      } else {
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reduce],
  );

  useEffect(() => {
    cancelled.current = false;
    enterStage('start');
    return () => {
      cancelled.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }, [messages, typing, choices, showSurvey, reduce]);

  function chooseReply(choice: Choice) {
    if (busy) return;
    haptic('tick');
    if (choice.next === 'start') {
      setMessages([]);
    } else {
      setMessages((prev) => [...prev, { id: nextId(), from: 'resident', text: choice.residentSays ?? choice.label }]);
    }
    setChoices(null);
    enterStage(choice.next);
  }

  function answerSurvey(option: string) {
    log('survey_answered', { where: 'whatsapp', question: SURVEY_QUESTION, answer: option });
    haptic('tick');
    setMessages((prev) => [...prev, { id: nextId(), from: 'resident', text: option }]);
    setShowSurvey(false);
    enterStage('done');
  }

  return (
    <div className="min-h-[100svh] flex flex-col" style={{ backgroundColor: 'var(--color-paper)' }}>
      {/* Header — messaging-app style, token-driven */}
      <header
        className="flex items-center gap-3 px-3 py-2 shadow-elevation-1 flex-shrink-0 sticky top-0 z-10"
        style={{ backgroundColor: 'var(--color-green)' }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="w-11 h-11 flex items-center justify-center rounded-pill text-paper-raised"
        >
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
        <div className="w-10 h-10 rounded-pill bg-paper-raised flex items-center justify-center overflow-hidden flex-shrink-0">
          <Vipin mood="hello" size={34} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-paper-raised leading-tight">VIPIN</p>
          <p className="text-xs text-paper-raised/80 leading-tight">{typing ? 'typing…' : 'Push The Pin · online'}</p>
        </div>
        <Phone size={20} className="text-paper-raised/90" aria-hidden="true" />
        <MoreVertical size={20} className="text-paper-raised/90" aria-hidden="true" />
      </header>

      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-2">
        <div className="text-center mb-2">
          <span className="inline-block text-xs text-ink-faint bg-paper-raised rounded-md px-3 py-1">
            This is a preview of the WhatsApp bot — the real front door of Push The Pin.
          </span>
        </div>

        {messages.map((m) => (
          <ChatBubble key={m.id} msg={m} />
        ))}

        {typing && <TypingBubble />}

        {showSurvey && <SurveyCard question={SURVEY_QUESTION} options={SURVEY_OPTIONS} onAnswer={answerSurvey} />}

        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {choices && (
        <div className="flex-shrink-0 px-3 py-3 flex flex-wrap gap-2 justify-end border-t border-line bg-paper">
          {choices.map((c) => (
            <button
              key={c.label}
              onClick={() => chooseReply(c)}
              className="min-h-[44px] px-4 rounded-pill border border-cobalt text-cobalt bg-paper-raised text-sm font-semibold hover:bg-cobalt hover:text-paper-raised transition-colors"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatBubble({ msg }: { msg: Msg }) {
  const isVipin = msg.from === 'vipin';
  return (
    <div className={`flex items-end gap-2 ${isVipin ? 'justify-start' : 'justify-end'}`}>
      {isVipin && (
        <div className="w-7 h-7 rounded-pill bg-paper-raised border border-line flex items-center justify-center overflow-hidden flex-shrink-0">
          <Vipin mood="hello" size={22} />
        </div>
      )}
      <div
        className="max-w-[78%] rounded-lg px-3 py-2 shadow-elevation-1"
        style={{
          backgroundColor: isVipin ? 'var(--color-paper-raised)' : 'color-mix(in srgb, var(--color-green) 18%, var(--color-paper-raised))',
          borderTopLeftRadius: isVipin ? 4 : undefined,
          borderTopRightRadius: isVipin ? undefined : 4,
        }}
      >
        {msg.image ? <AfterImage caption={msg.image.caption} /> : <p className="text-base text-ink leading-relaxed whitespace-pre-line">{msg.text}</p>}
      </div>
    </div>
  );
}

function AfterImage({ caption }: { caption: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="w-52 h-36 rounded-md flex items-center justify-center"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-green) 22%, var(--color-paper))' }}
      >
        <span className="w-12 h-12 rounded-pill flex items-center justify-center" style={{ backgroundColor: 'var(--color-green)' }}>
          <Check size={26} color="var(--color-paper-raised)" strokeWidth={3} aria-hidden="true" />
        </span>
      </div>
      <span className="text-xs text-ink-faint">{caption}</span>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-2 justify-start" aria-label="VIPIN is typing">
      <div className="w-7 h-7 rounded-pill bg-paper-raised border border-line flex items-center justify-center overflow-hidden flex-shrink-0">
        <Vipin mood="hello" size={22} />
      </div>
      <div className="rounded-lg px-3 py-3 bg-paper-raised shadow-elevation-1" style={{ borderTopLeftRadius: 4 }}>
        <span className="flex gap-1">
          <Dot delay={0} />
          <Dot delay={0.2} />
          <Dot delay={0.4} />
        </span>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="w-2 h-2 rounded-pill bg-ink-faint inline-block"
      style={{ animation: `ptp-typing 1.2s ${delay}s infinite ease-in-out` }}
    />
  );
}

function SurveyCard({ question, options, onAnswer }: { question: string; options: string[]; onAnswer: (o: string) => void }) {
  return (
    <div className="self-start max-w-[85%] rounded-lg bg-paper-raised border border-line shadow-elevation-1 p-3 flex flex-col gap-2">
      <p className="text-sm font-semibold text-ink">{question}</p>
      <div className="flex flex-col gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onAnswer(o)}
            className="min-h-[44px] px-3 rounded-md border border-line text-sm font-medium text-cobalt hover:bg-cobalt hover:text-paper-raised transition-colors text-left"
          >
            {o}
          </button>
        ))}
      </div>
      <span className="text-xs text-ink-faint">One tap, never stored against you.</span>
    </div>
  );
}
