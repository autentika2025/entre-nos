import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  ChevronRight,
  CircleHelp,
  Hash,
  HeartHandshake,
  Info,
  LockKeyhole,
  MessageCircle,
  Mic2,
  Music2,
  PenLine,
  Send,
  Play,
  Pause,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';


type Room = {
  id: string;
  name: string;
  description: string;
  users: number;
  icon: typeof MessageCircle;
  tone: string;
};

type ChatMessage = {
  id: number;
  author: string;
  text: string;
  time: string;
  isSelf?: boolean;
};
// Lista de nomes banidos permanentemente
const BANNED_USERS: string[] = [];
const banUserPrompt = () => {
  const nameToBan = window.prompt("Digite o nome exato do usuário que deseja banir do chat:");
  if (nameToBan) {
    const confirmBan = window.confirm(`Tem certeza que deseja banir "${nameToBan}" permanentemente?`);
    if (confirmBan) {
      BANNED_USERS.push(nameToBan.trim());
      alert(`Usuário "${nameToBan}" foi banido com sucesso e não poderá mandar mensagens!`);
    }
  }
};

const rooms: Room[] = [
  {
    id: 'geral',
    name: 'Papo Geral',
    description: 'De tudo um pouco, sem roteiro.',
    users: 428,
    icon: MessageCircle,
    tone: 'violet',
  },
  {
    id: 'musica',
    name: 'Música',
    description: 'Descobertas, shows e aquela faixa.',
    users: 196,
    icon: Music2,
    tone: 'lime',
  },
  {
    id: 'amizade',
    name: 'Amizade',
    description: 'Gente aberta a conhecer gente.',
    users: 247,
    icon: HeartHandshake,
    tone: 'coral',
  },
  {
    id: 'diversao',
    name: 'Diversão',
    description: 'Leve a conversa, não a diversão.',
    users: 134,
    icon: Sparkles,
    tone: 'gold',
      },
    {
      id: 'regras',
      name: 'Regras da Comunidade',
      description: '1. Respeito mútuo | 2. Sem spam | 3. Proteja seus dados.',
      users: 0,
      icon: ShieldCheck,
      tone: 'violet',
    },
  ];
const seededMessages: ChatMessage[] = [
  {
    id: 1,
    author: 'ENTRE NÓS',
    text: 'Bem-vindo ao ENTRE NÓS! Este é um espaço seguro e livre para conversar, compartilhar ideias e conhecer novas pessoas. Escolha uma sala e junte-se à conversa!',
    time: 'agora',
  },
];

function LogoMark() {
  return (
    <div className="flex items-center gap-3" data-testid="brand-logo">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-[13px] bg-primary text-primary-foreground shadow-[4px_4px_0_hsl(var(--accent))]">
        <span className="text-lg font-extrabold tracking-[-0.12em]">EN</span>
        <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-accent" />
      </div>
      <div>
        <p className="text-[13px] font-extrabold leading-none tracking-[0.16em] text-foreground">ENTRE NÓS</p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">conversa com presença</p>
      </div>
    </div>
  );
}

function OnlinePulse({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" data-testid="status-online">
      <span className={`relative flex h-2.5 w-2.5 items-center justify-center rounded-full ${light ? 'bg-accent' : 'bg-[#b9ef58]'}`}>
        <span className={`absolute h-full w-full animate-pulse-dot rounded-full ${light ? 'bg-accent' : 'bg-[#b9ef58]'}`} />
      </span>
      <span className={light ? 'text-primary-foreground' : 'text-[#b9ef58]'}>online</span>
    </span>
  );
}

function RoomCard({
  room,
  selected,
  onSelect,
}: {
  room: Room;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = room.icon;
  const toneClasses: Record<string, string> = {
    violet: 'bg-[#b995ff]/15 text-[#ceb9ff]',
    lime: 'bg-[#c9ee58]/15 text-[#c9ee58]',
    coral: 'bg-[#ff8f88]/15 text-[#ffaaa4]',
    gold: 'bg-[#f6cf73]/15 text-[#f6cf73]',
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`room-card focus-ring group relative flex w-full items-center gap-4 rounded-[18px] border p-4 text-left ${selected ? 'border-primary bg-[#302345]' : 'border-card-border bg-card/80'}`}
      data-testid={`button-select-room-${room.id}`}
      aria-pressed={selected}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${toneClasses[room.tone]}`}>
        <Icon size={19} strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[15px] font-semibold text-foreground">{room.name}</span>
          {selected && <BadgeCheck size={14} className="shrink-0 text-primary" />}
        </span>
        <span className="mt-1 block truncate text-[12px] text-muted-foreground">{room.description}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-mono text-[11px] text-muted-foreground">{room.users}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-[#b9ef58]" aria-label={`${room.users} usuários online`} />
      </span>
      <ChevronRight size={16} className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
    </button>
  );
}

function RulesDialog({ onClose }: { onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0c0812]/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-title"
        className="animate-rise-in max-h-[90dvh] w-full max-w-[570px] overflow-y-auto rounded-t-[26px] border border-card-border bg-card p-6 shadow-2xl sm:rounded-[26px] sm:p-8"
        data-testid="dialog-community-rules"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">antes de entrar</p>
            <h2 id="rules-title" className="mt-2 text-3xl font-bold tracking-[-0.04em] text-foreground">Regras do encontro</h2>
            <p className="mt-2 max-w-[420px] text-sm leading-6 text-muted-foreground">
              Um espaço bom para conversar é construído por todo mundo. É simples assim.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition hover:text-foreground"
            aria-label="Fechar regras"
            data-testid="button-close-rules"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-7 space-y-3">
          {[
            ['01', 'Respeito primeiro', 'Converse com pessoas, não com rótulos. Diferenças fazem parte da sala.'],
            ['02', 'Privacidade é cuidado', 'Não peça nem compartilhe dados pessoais. Cada pessoa decide o que quer contar.'],
            ['03', 'Sem spam, sem pressão', 'Evite repetição, autopromoção e qualquer atitude que atrapalhe a conversa.'],
            ['04', 'Avise quando algo sair do tom', 'A moderação existe para ajudar. Use a denúncia quando precisar.'],
          ].map(([number, title, description]) => (
            <div key={number} className="flex gap-4 rounded-[16px] border border-card-border bg-secondary/60 p-4">
              <span className="font-mono text-[11px] text-primary">{number}</span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-2 border-t border-card-border pt-5 text-xs text-muted-foreground">
          <ShieldCheck size={15} className="text-primary" />
          <span>A comunidade é moderada para manter a conversa leve e segura.</span>
        </div>
      </section>
    </div>
  );
}

function ChatPreview({
  room,
  nickname,
  onBack,
  onRules,
}: {
  room: Room;
  nickname: string;
  onBack: () => void;
  onRules: () => void;
}) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(seededMessages);
  const Icon = room.icon;

  const submitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanMessage = message.trim();
    if (!cleanMessage) return;
    setMessages((current) => [
      ...current,
      { id: Date.now(), author: nickname, text: cleanMessage, time: 'agora', isSelf: true },
    ]);
    setMessage('');
  };
const [isPlaying, setIsPlaying] = useState(false);
const audioRef = useRef<HTMLAudioElement | null>(null);

const toggleRadio = () => {
  if (!audioRef.current) return;
  if (isPlaying) {
    audioRef.current.pause();
  } else {
    audioRef.current.load();
    audioRef.current.play().catch(err => console.log(err));
  }
  setIsPlaying(!isPlaying);
};
  
  return (
    <div className="animate-rise-in grid min-h-[calc(100dvh-124px)] grid-cols-1 overflow-hidden rounded-[26px] border border-card-border bg-card shadow-2xl lg:grid-cols-[1fr_260px]" data-testid="room-preview">
         {/* Player Flutuante da Rádio */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-violet-400 tracking-wider">RÁDIO AO VIVO</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}`} />
            <span className="text-xs font-medium text-zinc-300">Online</span>
          </div>
        </div>
        <button 
          onClick={toggleRadio}
          className="flex items-center justify-center p-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <audio 
          ref={audioRef} 
          src="https://streamlive.com.br" 
          preload="none"
        />
      </div>
      
      <div className="flex min-h-[570px] flex-col">
        <div className="flex items-center justify-between border-b border-card-border px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack} className="focus-ring mr-1 flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition hover:text-foreground" aria-label="Voltar para seleção de sala" data-testid="button-back-to-rooms">
              <ArrowLeft size={17} />
            </button>
            <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-primary/15 text-primary">
              <Icon size={19} />
            </span>
            <div>
              <h1 className="text-base font-bold text-foreground">{room.name}</h1>
              <p className="mt-0.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <OnlinePulse /> {room.users + 1} por aqui agora
              </p>
            </div>
          </div>
          <button type="button" onClick={onRules} className="focus-ring hidden items-center gap-2 rounded-full border border-card-border px-3 py-2 text-xs text-muted-foreground transition hover:border-primary hover:text-primary sm:flex" data-testid="button-room-info">
            <Info size={14} /> sobre a sala
          </button>
        </div>

        <div className="grid-paper soft-scrollbar flex-1 overflow-y-auto p-5 sm:p-8">
          <div className="mx-auto flex max-w-[680px] flex-col gap-5">
            <div className="mb-2 flex flex-col items-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-primary/15 text-primary"><Hash size={21} /></span>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">você está em {room.name}</p>
              <p className="mt-1 max-w-[360px] text-sm text-muted-foreground">A porta está aberta. Diga oi para quem chegou antes.</p>
            </div>
            {messages.map((chatMessage) => (
              <div key={chatMessage.id} className={`flex max-w-[480px] gap-3 ${chatMessage.isSelf ? 'ml-auto flex-row-reverse' : ''}`} data-testid={`message-preview-${chatMessage.id}`}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] font-mono text-[10px] font-medium ${chatMessage.isSelf ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'}`}>
                  {chatMessage.isSelf ? nickname.slice(0, 2).toUpperCase() : 'EN'}
                </span>
                <div className={chatMessage.isSelf ? 'text-right' : ''}>
                  <div className={`flex items-baseline gap-2 ${chatMessage.isSelf ? 'justify-end' : ''}`}>
                    <span className="text-xs font-semibold text-foreground">{chatMessage.author}</span>
                    <span className="font-mono text-[9px] text-muted-foreground">{chatMessage.time}</span>
                  </div>
                  <p className={`mt-1 rounded-[14px] px-4 py-2.5 text-sm leading-5 ${chatMessage.isSelf ? 'rounded-tr-sm bg-primary text-primary-foreground' : 'rounded-tl-sm bg-secondary text-secondary-foreground'}`}>
                    {chatMessage.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submitMessage} className="border-t border-card-border bg-card p-4 sm:p-5" data-testid="form-demo-message">
          <div className="mx-auto flex max-w-[680px] items-center gap-3 rounded-[15px] border border-input bg-secondary/70 p-2 pl-4 transition focus-within:border-primary">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              placeholder={`Fale como ${nickname}...`}
              aria-label="Mensagem demonstrativa"
              data-testid="input-demo-message"
            />
            <button type="submit" className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-primary text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40" disabled={!message.trim()} aria-label="Enviar mensagem demonstrativa" data-testid="button-send-demo-message">
              <Send size={16} />
            </button>
          </div>
          <p className="mx-auto mt-2 max-w-[680px] px-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">prévia local · suas mensagens não serão salvas</p>
        </form>
      </div>

      <aside className="hidden border-l border-card-border bg-secondary/45 p-5 lg:block">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">na sala</p>
        <div className="mt-4 flex items-center gap-3 rounded-[14px] border border-card-border bg-card p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-mono text-[11px] font-medium text-accent-foreground">{nickname.slice(0, 2).toUpperCase()}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{nickname}</p>
            <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-[#b9ef58]"><OnlinePulse /> presente</p>
          </div>
        </div>
        <div className="mt-8 border-t border-card-border pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">o combinado</p>
          <p className="mt-3 text-[13px] leading-5 text-muted-foreground">Conversa aberta, respeito constante e espaço para todo mundo.</p>
          <button type="button" onClick={onRules} className="focus-ring mt-4 flex items-center gap-2 text-xs font-semibold text-primary transition hover:text-accent" data-testid="button-preview-rules">
            ler regras <ArrowUpRight size={14} />
          </button>
        </div>
      </aside>
    </div>
  );
}

export default function HomePage() {
  const [nickname, setNickname] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('geral');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    document.title = 'ENTRE NÓS — Onde a conversa vira conexão';
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute('content', 'Entre no ENTRE NÓS e encontre uma conversa com personalidade.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Entre no ENTRE NÓS e encontre uma conversa com personalidade.';
      document.head.appendChild(meta);
    }
  }, []);

  const selectedRoom = useMemo(() => rooms.find((room) => room.id === selectedRoomId) ?? rooms[0], [selectedRoomId]);
  const activeRoom = useMemo(() => rooms.find((room) => room.id === activeRoomId) ?? null, [activeRoomId]);
  const totalOnline = rooms.reduce((sum, room) => sum + room.users, 0);

  const enterChat = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanNickname = nickname.trim();
    if (cleanNickname.length < 2) {
      setNicknameError('Escolha um apelido com pelo menos 2 caracteres.');
      return;
    }
    if (cleanNickname.length > 18) {
      setNicknameError('Seu apelido pode ter no máximo 18 caracteres.');
      return;
    }
    if (!/^[\p{L}0-9 _-]+$/u.test(cleanNickname)) {
      setNicknameError('Use apenas letras, números, espaço, hífen ou sublinhado.');
      return;
    }
    setNicknameError('');
    setIsEntering(true);
    window.setTimeout(() => {
      setActiveRoomId(selectedRoom.id);
      setIsEntering(false);
    }, 720);
  };

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    if (nicknameError) setNicknameError('');
  };

  return (
    <div className="noise-layer min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1600px]">
        <aside className="hidden w-[230px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-6 py-7 lg:flex">
          <LogoMark />
          <div className="mt-16">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">um lugar para</p>
            <p className="mt-3 max-w-[150px] text-[26px] font-semibold leading-[1.05] tracking-[-0.06em] text-foreground">falar do seu jeito.</p>
          </div>
          <nav className="mt-auto space-y-1" aria-label="Navegação principal">
            <button type="button" onClick={() => document.getElementById('salas')?.scrollIntoView({ behavior: 'smooth' })} className="focus-ring flex w-full items-center gap-3 rounded-[12px] bg-secondary px-3 py-3 text-left text-sm font-medium text-foreground" data-testid="button-nav-rooms">
              <MessageCircle size={16} className="text-primary" /> salas populares
            </button>
            <button type="button" onClick={() => setShowRules(true)} className="focus-ring flex w-full items-center gap-3 rounded-[12px] px-3 py-3 text-left text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground" data-testid="button-nav-rules">
              <ShieldCheck size={16} /> regras da casa
            </button>
          </nav>
          <div className="mt-7 border-t border-sidebar-border pt-5">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"><LockKeyhole size={12} /> sem cadastro</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Entre com um apelido. Só isso.</p>
          </div>
        </aside>

        <main className="relative min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-card-border px-5 py-5 lg:hidden sm:px-8">
            <LogoMark />
            <button type="button" onClick={() => setShowRules(true)} className="focus-ring flex items-center gap-2 rounded-full border border-card-border px-3 py-2 text-xs font-medium text-muted-foreground" data-testid="button-mobile-rules">
              <ShieldCheck size={14} /> regras
            </button>
          </header>

          <div className="absolute right-[-110px] top-[-110px] h-[340px] w-[340px] rounded-full border border-primary/10 bg-primary/5 blur-[1px] animate-drift" aria-hidden="true" />
          <div className="relative mx-auto w-full max-w-[1180px] px-5 pb-10 pt-8 sm:px-8 lg:px-14 lg:pb-16 lg:pt-12">
            {!activeRoom ? (
              <>
                <div className="animate-rise-in flex flex-wrap items-center justify-between gap-4">
                  <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> a sala está aberta</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground" data-testid="text-total-online"><span className="text-accent">{totalOnline.toLocaleString('pt-BR')}</span> pessoas conversando agora</p>
                </div>

                <section className="mt-14 grid items-end gap-10 lg:mt-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
                  <div className="animate-rise-in delay-1">
                    <div className="mb-6 flex items-center gap-3">
                      <span className="h-px w-10 bg-primary" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">chega mais</span>
                    </div>
                    <h1 className="max-w-[660px] text-[clamp(3.5rem,8vw,7.2rem)] font-extrabold leading-[.86] tracking-[-0.085em] text-foreground">
                      A conversa<br /><span className="text-primary">começa</span> aqui.
                    </h1>
                    <p className="mt-8 max-w-[440px] text-base leading-7 text-muted-foreground sm:text-lg">
                      Um lugar para trocar ideia sem formulário, sem pose e sem precisar conhecer ninguém antes.
                    </p>
                    <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-2"><Users size={15} className="text-primary" /> {totalOnline.toLocaleString('pt-BR')} online</span>
                      <span className="flex items-center gap-2"><HeartHandshake size={15} className="text-primary" /> feito para gente</span>
                    </div>
                  </div>

                  <div className="animate-rise-in delay-2 relative">
                    <div className="absolute -left-4 -top-4 z-10 flex h-12 w-12 -rotate-12 items-center justify-center rounded-[14px] border border-primary/30 bg-[#21172d] text-primary shadow-xl" aria-hidden="true"><PenLine size={19} /></div>
                    <div className="rounded-[25px] border border-card-border bg-card p-5 shadow-2xl sm:p-7">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">01 / entrada rápida</p>
                          <h2 className="mt-3 text-2xl font-bold tracking-[-0.05em] text-foreground">Como quer ser chamado?</h2>
                        </div>
                        <CircleHelp size={18} className="text-muted-foreground" aria-hidden="true" />
                      </div>
                      <form className="mt-7" onSubmit={enterChat} noValidate data-testid="form-enter-chat">
                        <label htmlFor="nickname" className="mb-2 block text-xs font-medium text-muted-foreground">seu apelido</label>
                        <div className={`flex items-center rounded-[14px] border bg-secondary/70 px-4 transition focus-within:border-primary ${nicknameError ? 'border-destructive' : 'border-input'}`}>
                          <span className="font-mono text-sm text-primary">@</span>
                          <input
                            id="nickname"
                            value={nickname}
                            onChange={(event) => handleNicknameChange(event.target.value)}
                            className="min-w-0 flex-1 bg-transparent px-2 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                            placeholder="ex.: lua_de_janeiro"
                            maxLength={18}
                            autoComplete="nickname"
                            aria-invalid={Boolean(nicknameError)}
                            aria-describedby={nicknameError ? 'nickname-error' : 'nickname-help'}
                            data-testid="input-nickname"
                          />
                          <span className="font-mono text-[10px] text-muted-foreground">{nickname.length}/18</span>
                        </div>
                        {nicknameError ? (
                          <p id="nickname-error" className="mt-2 flex items-center gap-1.5 text-xs text-destructive" role="alert" data-testid="status-nickname-error"><Info size={13} /> {nicknameError}</p>
                        ) : (
                          <p id="nickname-help" className="mt-2 text-[11px] text-muted-foreground">Pode trocar depois. Sem cadastro, sem complicação.</p>
                        )}
                        <button type="submit" disabled={isEntering} className="focus-ring mt-6 flex w-full items-center justify-center gap-3 rounded-[14px] bg-primary px-4 py-4 text-sm font-bold tracking-[0.03em] text-primary-foreground transition hover:brightness-110 disabled:cursor-wait disabled:opacity-75" data-testid="button-enter-chat">
                          {isEntering ? (
                            <>abrindo uma sala <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" /></>
                          ) : (
                            <>ENTRAR NO CHAT <ArrowUpRight size={17} /></>
                          )}
                        </button>
                      </form>
                      <div className="mt-6 flex items-center gap-2 border-t border-card-border pt-5 font-mono text-[9px] uppercase tracking-[0.11em] text-muted-foreground"><LockKeyhole size={12} className="text-accent" /> sua entrada é anônima por padrão</div>
                    </div>
                  </div>
                </section>

                <section id="salas" className="mt-24 scroll-mt-8 animate-rise-in delay-3 lg:mt-32">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">02 / escolha seu clima</p>
                      <h2 className="mt-3 text-3xl font-bold tracking-[-0.055em] text-foreground sm:text-4xl">Encontre sua sala.</h2>
                    </div>
                    <p className="max-w-[260px] text-right text-xs leading-5 text-muted-foreground">Cada sala tem seu ritmo.<br />Qual combina com você hoje?</p>
                  </div>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {rooms.map((room) => (
                      <RoomCard key={room.id} room={room} selected={room.id === selectedRoomId} onSelect={() => setSelectedRoomId(room.id)} />
                    ))}
                  </div>
                </section>

                <section className="mt-20 grid gap-5 border-t border-card-border pt-7 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="flex items-start gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-accent text-accent-foreground"><ShieldCheck size={17} /></span>
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">Um combinado rápido</h2>
                      <p className="mt-1 max-w-[520px] text-xs leading-5 text-muted-foreground">Respeito, privacidade e espaço para todo mundo. As regras existem para a conversa continuar gostosa.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowRules(true)} className="focus-ring flex items-center gap-2 self-start rounded-full border border-card-border px-4 py-2.5 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary sm:self-center" data-testid="button-open-rules">
                    ler todas as regras <ArrowUpRight size={14} />
                  </button>
                </section>

                <footer className="mt-24 flex flex-col gap-4 border-t border-card-border pt-6 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-mono uppercase tracking-[0.15em]">ENTRE NÓS · onde a conversa vira conexão</p>
                  <p className="flex items-center gap-2"><Mic2 size={13} /> feito para conversas reais</p>
                </footer>
              </>
            ) : (
              <ChatPreview room={activeRoom} nickname={nickname.trim()} onBack={() => setActiveRoomId(null)} onRules={() => setShowRules(true)} />
            )}
          </div>
        </main>
      </div>
      {showRules && <RulesDialog onClose={() => setShowRules(false)} />}
    </div>
  );
}