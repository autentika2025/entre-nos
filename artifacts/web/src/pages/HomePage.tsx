 import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
 ArrowUpRight,
  BadgeCheck,
  Camera,
  ChevronRight,
  Check,
  Crown,
  CircleHelp,
  Hash,
  HeartHandshake,
  ImageIcon,
  Info,
  LockKeyhole,
  MessageCircle,
  Mic2,
  Music2,
  PenLine,
  Send,
  Play,
  Pause,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
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
  premium?: boolean;
};

type ChatMessage = {
  id: number;
  author: string;
  text: string;
  time: string;
  isSelf?: boolean;
  gifUrl?: string;
  role?: UserRole;
};
 
type UserRole = 'owner' | 'admin' | 'vip' | 'member' | 'guest';


type GifOption = {
  id: string;
  title: string;
  url: string;
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
    {
      id: 'premium',
      name: 'Sala Exclusiva',
      description: 'Um espaço especial para membros VIP.',
      users: 58,
      icon: Crown,
      tone: 'gold',
      premium: true,
    },
  ];
const seededMessages: ChatMessage[] = [
  {
    id: 1,
    author: 'ENTRE NÓS',
    text: 'Bem-vindo ao ENTRE NÓS! Este é um espaço seguro e livre para conversar, compartilhar ideias e conhecer novas pessoas. Escolha uma sala e junte-se à conversa!',
    time: 'agora',
    role: 'admin',
  },
];

const gifOptions: GifOption[] = [
  {
    id: 'happy-dance',
    title: 'Dança feliz',
    url: 'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif',
  },
  {
    id: 'high-five',
    title: 'Comemoração',
    url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif',
  },
  {
    id: 'laughing',
    title: 'Rindo muito',
    url: 'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif',
  },
  {
    id: 'surprise',
    title: 'Surpresa',
    url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
  },
  {
    id: 'love',
    title: 'Muito amor',
    url: 'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif',
  },
  {
    id: 'clap',
    title: 'Palmas',
    url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
  },
];

const createAvatar = (background: string, accent: string, skin: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" rx="80" fill="${background}"/><circle cx="80" cy="82" r="45" fill="${skin}"/><path d="M36 73c4-39 24-54 48-54 28 0 43 17 43 51-13-11-28-17-48-17-18 0-31 7-43 20z" fill="${accent}"/><circle cx="63" cy="83" r="5" fill="#21172d"/><circle cx="98" cy="83" r="5" fill="#21172d"/><path d="M66 105c9 7 20 7 29 0" fill="none" stroke="#21172d" stroke-linecap="round" stroke-width="5"/><circle cx="30" cy="37" r="10" fill="${accent}" opacity=".75"/><circle cx="130" cy="125" r="16" fill="${accent}" opacity=".45"/></svg>`)}`;

const presetAvatars = [
  // 👦 AVATARES MASCULINOS
  { id: 'm1', label: 'Anime Masc 1', url: 'https://unsplash.com' },
  { id: 'm2', label: 'Anime Masc 2', url: 'https://unsplash.com' },
  { id: 'm3', label: 'Anime Masc 3', url: 'https://unsplash.com' },
  { id: 'm4', label: 'Anime Masc 4', url: 'https://unsplash.com' },
  { id: 'm5', label: 'Anime Masc 5', url: 'https://unsplash.com' },
  { id: 'm6', label: 'Anime Masc 6', url: 'https://unsplash.com' },

  // 👧 AVATARES FEMININOS
  { id: 'f1', label: 'Anime Fem 1', url: 'https://unsplash.com' },
  { id: 'f2', label: 'Anime Fem 2', url: 'https://unsplash.com' },
  { id: 'f3', label: 'Anime Fem 3', url: 'https://unsplash.com' },
  { id: 'f4', label: 'Anime Fem 4', url: 'https://unsplash.com' },
  { id: 'f5', label: 'Anime Fem 5', url: 'https://unsplash.com' },
    { id: 'f6', label: 'Anime Fem 6', url: 'https://unsplash.com'   
    ]);
function  LogoMark() {
  return (
    <div className="flex items-center gap-3" data-testid="brand-logo">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-[13px] bg-primary text-primary-foreground shadow-[4px_4px_0_hsl(var(--accent))]">
        <span className="text-lg font-extrabold tracking-[-0.12em]">EN</span>
        <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-accent" />
      </div>

      <div>
        <p className="text-[13px] font-extrabold leading-none tracking-[0.16em] text-foreground">
          ENTRE NÓS
        </p>

        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          conversa com presença
        </p>
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

function RoleBadge({ role, compact = false }: { role: UserRole; compact?: boolean }) {
  const roleConfig = {
    
      
        owner: {
          label: 'PROPRIETÁRIA DO CHAT',
          shortLabel: 'DONA',
          className: 'border-[#f1c75b]/40 bg-[#f1c75b]/15 text-[#f6d77c]',
          icon: Crown,
        },
        admin: {
          label: 'DONA · ADM',
          shortLabel: 'ADM',
          className: 'border-[#ff786f]/40 bg-[#ff786f]/15 text-[#ff9b94]',
          icon: Shield,
        },
        vip: {
          label: 'VIP',
          shortLabel: 'VIP',
          className: 'border-[#c39aff]/40 bg-[#c39aff]/15 text-[#d8bdff]',
          icon: Star,
        },
        member: {
          label: 'MEMBRO',
          shortLabel: 'MEMBRO',
          className: 'border-card-border bg-secondary text-muted-foreground',
          icon: BadgeCheck,
        },
      };

 const config = roleConfig[role as keyof typeof roleConfig];
const Icon = config.icon;
      return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.06em] ${config.className}`}
      title={config.label}
      data-testid={`role-badge-${role}`}
    >
      <Icon size={compact ? 9 : 10} />
      {compact ? config.shortLabel : config.label}
    </span>
  );
}

function getUserRole(nickname: string): UserRole {
  return nickname.trim().toLocaleLowerCase('pt-BR') === 'autentica' ? 'owner' : 'member';
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
            {room.premium && <span className="rounded-full bg-[#f1c75b]/15 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.06em] text-[#f6d77c]">VIP</span>}
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

function GifPicker({ onSelect }: { onSelect: (gif: GifOption) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);
  const filteredGifs = gifOptions.filter((gif) =>
    gif.title.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')),
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const selectGif = (gif: GifOption) => {
    onSelect(gif);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div ref={pickerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`focus-ring flex h-10 items-center gap-1.5 rounded-[11px] border px-3 text-[11px] font-bold transition ${isOpen ? 'border-primary bg-primary/15 text-primary' : 'border-card-border bg-card text-muted-foreground hover:border-primary hover:text-primary'}`}
        aria-label="Abrir busca de GIFs"
        aria-expanded={isOpen}
        data-testid="button-open-gif-picker"
      >
        <ImageIcon size={15} />
        GIF
      </button>
      {isOpen && (
        <div
          className="animate-rise-in absolute bottom-[calc(100%+12px)] right-0 z-30 w-[min(320px,calc(100vw-40px))] rounded-[18px] border border-card-border bg-[#21172d] p-3 shadow-2xl"
          role="dialog"
          aria-label="Buscar GIF"
          data-testid="gif-picker"
        >
          <div className="flex items-center justify-between gap-3 px-1 pb-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Escolha um GIF</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Busca simulada do Giphy / Tenor</p>
            </div>
            <span className="rounded-md bg-primary/15 px-1.5 py-1 font-mono text-[9px] font-bold text-primary">GIF</span>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="focus-ring mb-3 w-full rounded-[10px] border border-input bg-secondary/80 px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Buscar reação..."
            aria-label="Buscar GIF"
            autoFocus
            data-testid="input-gif-search"
          />
          {filteredGifs.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {filteredGifs.map((gif) => (
                <button
                  key={gif.id}
                  type="button"
                  onClick={() => selectGif(gif)}
                  className="focus-ring group overflow-hidden rounded-[10px] border border-card-border bg-secondary transition hover:border-primary"
                  aria-label={`Enviar GIF: ${gif.title}`}
                  data-testid={`button-send-gif-${gif.id}`}
                >
                  <img src={gif.url} alt="" className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-[10px] bg-secondary px-3 py-4 text-center text-xs text-muted-foreground">Nenhum GIF encontrado.</p>
          )}
          <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">clique para enviar direto na conversa</p>
        </div>
      )}
    </div>
  );
}

function AvatarBubble({
  nickname,
  avatarUrl,
  size = 'md',
  onClick,
}: {
  nickname: string;
  avatarUrl: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}) {
  const sizeClasses = { sm: 'h-8 w-8 text-[9px]', md: 'h-10 w-10 text-[11px]', lg: 'h-20 w-20 text-lg' };
  const content = avatarUrl ? (
    <img src={avatarUrl} alt={`Avatar de ${nickname}`} className="h-full w-full rounded-full object-cover" />
  ) : (
    <span>{nickname.slice(0, 2).toUpperCase()}</span>
  );

  return (
    <span className={`relative flex shrink-0 items-center justify-center rounded-full bg-accent font-mono font-medium text-accent-foreground ${sizeClasses[size]}`}>
      {onClick ? (
        <button type="button" onClick={onClick} className="focus-ring h-full w-full rounded-full" aria-label="Editar meu perfil" data-testid="button-open-profile">
          {content}
        </button>
      ) : content}
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-[#b9ef58]" aria-label="Online" />
    </span>
  );
}

function ProfileDialog({
  nickname,
  avatarUrl,
  onClose,
  onSave,
}: {
  nickname: string;
  avatarUrl: string;
  onClose: () => void;
  onSave: (nextNickname: string, nextAvatarUrl: string) => void;
}) {
  const [draftNickname, setDraftNickname] = useState(nickname);
  const [draftAvatarUrl, setDraftAvatarUrl] = useState(avatarUrl);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanNickname = draftNickname.trim();
    if (cleanNickname.length < 2) return;
    onSave(cleanNickname, draftAvatarUrl.trim());
  };

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setDraftAvatarUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#0c0812]/75 p-5 pt-24 backdrop-blur-sm sm:items-center sm:pt-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        className="animate-rise-in w-full max-w-[390px] rounded-[22px] border border-card-border bg-card p-5 shadow-2xl"
        data-testid="dialog-edit-profile"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">meu espaço</p>
            <h2 id="profile-title" className="mt-2 text-2xl font-bold tracking-[-0.05em] text-foreground">Editar perfil</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Atualize como você aparece nesta conversa.</p>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground" aria-label="Fechar edição de perfil" data-testid="button-close-profile">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={saveProfile} className="mt-6 space-y-4">
          <div className="flex items-center gap-4 rounded-[15px] border border-card-border bg-secondary/60 p-3">
            <AvatarBubble nickname={draftNickname || 'EN'} avatarUrl={draftAvatarUrl} size="lg" />
            <div>
              <p className="text-sm font-semibold text-foreground">{draftNickname.trim() || 'Seu apelido'}</p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#b9ef58]"><span className="h-1.5 w-1.5 rounded-full bg-[#b9ef58]" /> online agora</p>
            </div>
          </div>
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-muted-foreground">apelido</span>
            <input
              value={draftNickname}
              onChange={(event) => setDraftNickname(event.target.value)}
              maxLength={18}
              className="focus-ring w-full rounded-[11px] border border-input bg-secondary/70 px-3 py-3 text-sm text-foreground outline-none"
              aria-label="Editar apelido"
              data-testid="input-profile-nickname"
            />
          </label>
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground"><Camera size={13} /> foto do avatar</span>
            <div className="mb-3 grid grid-cols-4 gap-2">
              {presetAvatars.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setDraftAvatarUrl(avatar.url)}
                  className={`focus-ring relative overflow-hidden rounded-full border-2 transition hover:scale-105 ${draftAvatarUrl === avatar.url ? 'border-primary' : 'border-transparent'}`}
                  aria-label={`Usar ${avatar.label}`}
                  aria-pressed={draftAvatarUrl === avatar.url}
                  data-testid={`button-select-avatar-${avatar.id}`}
                >
                  <img src={avatar.url} alt="" className="aspect-square w-full" />
                  {draftAvatarUrl === avatar.url && <span className="absolute inset-0 flex items-center justify-center bg-[#21172d]/45 text-white"><Check size={15} /></span>}
                </button>
              ))}
            </div>
            <label className="focus-ring flex cursor-pointer items-center justify-center gap-2 rounded-[11px] border border-dashed border-input bg-secondary/50 px-3 py-3 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-primary">
              <Upload size={14} /> adicionar foto do dispositivo
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handlePhotoUpload} className="sr-only" aria-label="Adicionar foto do dispositivo" data-testid="input-upload-avatar" />
            </label>
            <input
              type="url"
              value={draftAvatarUrl.startsWith('data:') ? '' : draftAvatarUrl}
              onChange={(event) => setDraftAvatarUrl(event.target.value)}
              className="focus-ring mt-2 w-full rounded-[11px] border border-input bg-secondary/70 px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="ou cole o link de uma imagem"
              aria-label="Link da foto do avatar"
              data-testid="input-profile-avatar"
            />
            <span className="mt-1.5 block text-[10px] text-muted-foreground">A foto será exibida de forma arredondada.</span>
          </label>
          <button type="submit" disabled={draftNickname.trim().length < 2} className="focus-ring flex w-full items-center justify-center gap-2 rounded-[12px] bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50" data-testid="button-save-profile">
            <Check size={16} /> salvar perfil
          </button>
        </form>
      </section>
    </div>
  );
}

function PrivateChatDialog({ onClose }: { onClose: () => void }) {
  const [recipient, setRecipient] = useState('Lia');
  const [privateMessage, setPrivateMessage] = useState('');
  const [sent, setSent] = useState(false);

  const sendPrivateMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!privateMessage.trim()) return;
    setSent(true);
    setPrivateMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0c0812]/75 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="private-chat-title" className="animate-rise-in w-full max-w-[430px] rounded-t-[22px] border border-card-border bg-card p-5 shadow-2xl sm:rounded-[22px]" data-testid="dialog-private-chat">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">conversa reservada</p>
            <h2 id="private-chat-title" className="mt-2 text-2xl font-bold tracking-[-0.05em] text-foreground">Falar em particular</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Uma conversa só entre você e outra pessoa da comunidade.</p>
          </div>
          <button type="button" onClick={onClose} className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground" aria-label="Fechar conversa reservada"><X size={16} /></button>
        </div>
        <form onSubmit={sendPrivateMessage} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-muted-foreground">enviar para</span>
            <select value={recipient} onChange={(event) => setRecipient(event.target.value)} className="focus-ring w-full rounded-[11px] border border-input bg-secondary/70 px-3 py-3 text-sm text-foreground outline-none" aria-label="Selecionar destinatário">
              <option>Lia</option>
              <option>Rafa</option>
              <option>Autentica</option>
            </select>
          </label>
          <textarea value={privateMessage} onChange={(event) => setPrivateMessage(event.target.value)} className="focus-ring min-h-24 w-full resize-none rounded-[11px] border border-input bg-secondary/70 px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" placeholder="Escreva uma mensagem reservada..." aria-label="Mensagem reservada" />
          {sent && <p className="rounded-[10px] border border-[#b9ef58]/30 bg-[#b9ef58]/10 px-3 py-2 text-xs text-[#d8f58c]">Mensagem enviada para {recipient} nesta prévia.</p>}
          <button type="submit" disabled={!privateMessage.trim()} className="focus-ring flex w-full items-center justify-center gap-2 rounded-[12px] bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">enviar mensagem reservada <ArrowUpRight size={15} /></button>
        </form>
      </section>
    </div>
  );
}

function RoomControlsDialog({ onClose }: { onClose: () => void }) {
  const [background, setBackground] = useState('grid-paper');
  const [saved, setSaved] = useState(false);
  const [newAdmin, setNewAdmin] = useState('');
  const [roomName, setRoomName] = useState('');
  const [createdRoom, setCreatedRoom] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0c0812]/75 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="room-controls-title" className="animate-rise-in max-h-[90dvh] w-full max-w-[470px] overflow-y-auto rounded-t-[22px] border border-card-border bg-card p-5 shadow-2xl sm:rounded-[22px]" data-testid="dialog-room-controls">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">painel da proprietária</p>
            <h2 id="room-controls-title" className="mt-2 text-2xl font-bold tracking-[-0.05em] text-foreground">Personalizar sala</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Controle o clima e a equipe que ajuda a manter a conversa em ordem.</p>
          </div>
          <button type="button" onClick={onClose} className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground" aria-label="Fechar painel da sala"><X size={16} /></button>
        </div>
        <div className="mt-6 space-y-5">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">fundo da sala</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'grid-paper', label: 'Grade', className: 'grid-paper' },
                { id: 'violet-glow', label: 'Violeta', className: 'bg-[#34214d]' },
                { id: 'night', label: 'Noite', className: 'bg-[#111018]' },
              ].map((option) => (
                <button key={option.id} type="button" onClick={() => setBackground(option.id)} className={`focus-ring h-16 rounded-[12px] border ${option.className} ${background === option.id ? 'border-primary ring-2 ring-primary/30' : 'border-card-border'}`} aria-label={`Usar fundo ${option.label}`} aria-pressed={background === option.id}>
                  <span className="rounded-full bg-[#0c0812]/65 px-2 py-1 font-mono text-[9px] text-white">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">adicionar administradores</p>
            <div className="flex gap-2">
              <input value={newAdmin} onChange={(event) => setNewAdmin(event.target.value)} className="focus-ring min-w-0 flex-1 rounded-[11px] border border-input bg-secondary/70 px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" placeholder="Digite um apelido" aria-label="Novo administrador" />
              <button type="button" onClick={() => setNewAdmin('')} disabled={!newAdmin.trim()} className="focus-ring rounded-[11px] bg-[#ff786f] px-3 text-xs font-bold text-[#2a0d0b] disabled:opacity-40">nomear ADM</button>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">A proprietária escolhe quem pode ajudar na moderação.</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">criar sala nomeada</p>
            <div className="flex gap-2">
              <input value={roomName} onChange={(event) => setRoomName(event.target.value)} className="focus-ring min-w-0 flex-1 rounded-[11px] border border-input bg-secondary/70 px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" placeholder="Ex.: Clube da Leitura" aria-label="Nome da nova sala" />
              <button type="button" onClick={() => { setCreatedRoom(roomName.trim()); setRoomName(''); }} disabled={!roomName.trim()} className="focus-ring rounded-[11px] bg-[#f1c75b] px-3 text-xs font-bold text-[#241a0a] disabled:opacity-40">criar sala</button>
            </div>
            {createdRoom && <p className="mt-2 text-[10px] text-[#f6d77c]">Sala “{createdRoom}” criada e nomeada por você.</p>}
          </div>
          {saved && <p className="rounded-[10px] border border-[#b9ef58]/30 bg-[#b9ef58]/10 px-3 py-2 text-xs text-[#d8f58c]">Preferências da sala atualizadas nesta prévia.</p>}
          <button type="button" onClick={() => setSaved(true)} className="focus-ring flex w-full items-center justify-center gap-2 rounded-[12px] bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-110">salvar personalização <Check size={15} /></button>
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
  const [profileNickname, setProfileNickname] = useState(nickname);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showPrivateChat, setShowPrivateChat] = useState(false);
  const [showRoomControls, setShowRoomControls] = useState(false);
  const [isDj, setIsDj] = useState(false);
  const [volume, setVolume] = useState(65);
  const [roomBackground, setRoomBackground] = useState('grid-paper');
  const profileRole = getUserRole(profileNickname);
  const Icon = room.icon;

  const submitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanMessage = message.trim();
    if (!cleanMessage) return;
    setMessages((current) => [
      ...current,
      { id: Date.now(), author: profileNickname, text: cleanMessage, time: 'agora', isSelf: true, role: profileRole },
    ]);
    setMessage('');
  };

  const sendGif = (gif: GifOption) => {
    setMessages((current) => [
      ...current,
      { id: Date.now(), author: profileNickname, text: '', gifUrl: gif.url, time: 'agora', isSelf: true, role: profileRole },
    ]);
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

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);
  
  return (
    <div className="animate-rise-in grid min-h-[calc(100dvh-124px)] grid-cols-1 overflow-hidden rounded-[26px] border border-card-border bg-card shadow-2xl lg:grid-cols-[1fr_260px]" data-testid="room-preview">
         {/* Player Flutuante da Rádio */}
      <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-24px)] flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 shadow-2xl backdrop-blur-md">
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
        <label className="flex items-center gap-2 text-[10px] text-zinc-400" title="Volume da rádio">
          volume
          <input type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="w-16 accent-violet-500" aria-label="Volume da rádio" />
        </label>
        <button type="button" onClick={() => setIsDj((current) => !current)} className={`rounded-lg border px-2 py-2 text-[10px] font-bold uppercase tracking-[0.08em] transition ${isDj ? 'border-[#f1c75b]/50 bg-[#f1c75b]/15 text-[#f6d77c]' : 'border-zinc-700 text-zinc-400 hover:border-violet-400 hover:text-violet-300'}`} aria-pressed={isDj} data-testid="button-toggle-dj">
          {isDj ? 'DJ ativo' : 'ser DJ'}
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
          <div className="flex items-center gap-2">
            <button type="button" onClick={onBack} className="focus-ring hidden rounded-full border border-card-border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:border-[#ff786f] hover:text-[#ff9b94] sm:block" data-testid="button-leave-room">sair da sala</button>
            <AvatarBubble nickname={profileNickname} avatarUrl={avatarUrl} size="sm" onClick={() => setShowProfile(true)} />
            <button type="button" onClick={onRules} className="focus-ring hidden items-center gap-2 rounded-full border border-card-border px-3 py-2 text-xs text-muted-foreground transition hover:border-primary hover:text-primary sm:flex" data-testid="button-room-info">
              <Info size={14} /> sobre a sala
            </button>
          </div>
        </div>

        <div className={`${roomBackground === 'grid-paper' ? 'grid-paper' : roomBackground === 'violet-glow' ? 'bg-[#34214d]' : 'bg-[#111018]'} soft-scrollbar flex-1 overflow-y-auto p-5 sm:p-8`}>
          <div className="mx-auto flex max-w-[680px] flex-col gap-5">
            <div className="mb-2 flex flex-col items-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-primary/15 text-primary"><Hash size={21} /></span>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">você está em {room.name}</p>
              <p className="mt-1 max-w-[360px] text-sm text-muted-foreground">A porta está aberta. Diga oi para quem chegou antes.</p>
            </div>
            {messages.map((chatMessage) => (
              <div key={chatMessage.id} className={`flex max-w-[480px] gap-3 ${chatMessage.isSelf ? 'ml-auto flex-row-reverse' : ''}`} data-testid={`message-preview-${chatMessage.id}`}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] font-mono text-[10px] font-medium ${chatMessage.isSelf ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'}`}>
                  {chatMessage.isSelf ? <AvatarBubble nickname={profileNickname} avatarUrl={avatarUrl} size="sm" /> : 'EN'}
                </span>
                <div className={chatMessage.isSelf ? 'text-right' : ''}>
                  <div className={`flex items-baseline gap-2 ${chatMessage.isSelf ? 'justify-end' : ''}`}>
                    <span className="text-xs font-semibold text-foreground">{chatMessage.author}</span>
                    {chatMessage.role && <RoleBadge role={chatMessage.role} compact />}
                    <span className="font-mono text-[9px] text-muted-foreground">{chatMessage.time}</span>
                  </div>
                   <div className={`mt-1 overflow-hidden rounded-[14px] ${chatMessage.isSelf ? 'rounded-tr-sm bg-primary text-primary-foreground' : 'rounded-tl-sm bg-secondary text-secondary-foreground'}`}>
                     {chatMessage.gifUrl ? (
                       <img src={chatMessage.gifUrl} alt="GIF enviado na conversa" className="block max-h-48 w-56 object-cover" />
                     ) : (
                       <p className="px-4 py-2.5 text-sm leading-5">{chatMessage.text}</p>
                     )}
                   </div>
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
               placeholder={`Fale como ${profileNickname}...`}
              aria-label="Mensagem demonstrativa"
              data-testid="input-demo-message"
            />
             <GifPicker onSelect={sendGif} />
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
           <AvatarBubble nickname={profileNickname} avatarUrl={avatarUrl} onClick={() => setShowProfile(true)} />
          <div className="min-w-0">
             <div className="flex flex-wrap items-center gap-2">
               <p className="truncate text-sm font-semibold text-foreground">{profileNickname}</p>
               <RoleBadge role={profileRole} compact />
             </div>
            <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-[#b9ef58]"><OnlinePulse /> presente</p>
          </div>
        </div>
         <div className="mt-4 space-y-2">
           <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">participantes em destaque</p>
           {[
             { name: 'Autentica', role: 'owner' as UserRole, initials: 'AU' },
             { name: 'Lia', role: 'vip' as UserRole, initials: 'LI' },
             { name: 'Rafa', role: 'admin' as UserRole, initials: 'RA' },
           ].map((participant) => (
             <div key={participant.name} className="flex items-center gap-2 rounded-[12px] border border-card-border/70 bg-card/60 px-2.5 py-2">
               <span className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[9px] font-bold ${participant.role === 'owner' ? 'bg-[#f1c75b] text-[#241a0a]' : participant.role === 'admin' ? 'bg-[#ff786f] text-[#2a0d0b]' : 'bg-[#c39aff] text-[#241436]'}`}>{participant.initials}</span>
               <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-foreground">{participant.name}</span>
               <RoleBadge role={participant.role} compact />
             </div>
           ))}
         </div>
         <div className="mt-3 grid grid-cols-2 gap-2">
           <button type="button" onClick={() => setShowPrivateChat(true)} className="focus-ring rounded-[11px] border border-primary/30 bg-primary/10 px-2 py-2 text-[10px] font-bold text-primary transition hover:bg-primary/20" data-testid="button-private-chat">conversa reservada</button>
           <button type="button" onClick={onBack} className="focus-ring rounded-[11px] border border-[#ff786f]/30 bg-[#ff786f]/10 px-2 py-2 text-[10px] font-bold text-[#ff9b94] transition hover:bg-[#ff786f]/20" data-testid="button-leave-chat">sair do chat</button>
         </div>
         {profileRole === 'owner' && (
           <button type="button" onClick={() => setShowRoomControls(true)} className="focus-ring mt-3 flex w-full items-center justify-center rounded-[11px] border border-[#f1c75b]/30 bg-[#f1c75b]/10 px-2 py-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#f6d77c] transition hover:bg-[#f1c75b]/20" data-testid="button-open-room-controls">painel da proprietária</button>
         )}
        <div className="mt-8 border-t border-card-border pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">o combinado</p>
          <p className="mt-3 text-[13px] leading-5 text-muted-foreground">Conversa aberta, respeito constante e espaço para todo mundo.</p>
          <button type="button" onClick={onRules} className="focus-ring mt-4 flex items-center gap-2 text-xs font-semibold text-primary transition hover:text-accent" data-testid="button-preview-rules">
            ler regras <ArrowUpRight size={14} />
          </button>
        </div>
      </aside>
      {showProfile && (
        <ProfileDialog
          nickname={profileNickname}
          avatarUrl={avatarUrl}
          onClose={() => setShowProfile(false)}
          onSave={(nextNickname, nextAvatarUrl) => {
            setProfileNickname(nextNickname);
            setAvatarUrl(nextAvatarUrl);
            setShowProfile(false);
          }}
        />
      )}
      {showPrivateChat && <PrivateChatDialog onClose={() => setShowPrivateChat(false)} />}
      {showRoomControls && <RoomControlsDialog onClose={() => setShowRoomControls(false)} />}
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

  const openRoom = (roomId: string) => {
    const cleanNickname = nickname.trim();
    if (cleanNickname.length < 2) {
      setSelectedRoomId(roomId);
      setNicknameError('Escolha um apelido antes de entrar nesta sala.');
      document.getElementById('nickname')?.focus();
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
    setActiveRoomId(roomId);
  };

  const enterChat = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsEntering(true);
    window.setTimeout(() => {
      openRoom(selectedRoom.id);
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
                      <RoomCard key={room.id} room={room} selected={room.id === selectedRoomId} onSelect={() => openRoom(room.id)} />
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
