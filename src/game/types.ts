export type LevelCategory = 
  | 'letters_sounds'       // Fases 1 a 4 (Reconhecimento de letras, nomes, sons e imagens)
  | 'simple_syllables'     // Fases 5 a 8 (Formação de sílabas simples e nome das sílabas)
  | 'complex_syllables'    // Fases 9 a 11 (Formação de sílabas complexas e nome das sílabas)
  | 'simple_words'         // Fases 12 a 15 (Formação de palavras com sílabas simples)
  | 'complex_words'        // Fases 16 a 18 (Formação de palavras com sílaba complexa)
  | 'short_sentences';     // Fases 19 a 20 (Formação de frases curtas)

export type ChallengeType = 
  | 'letter_identify'      // Encontrar a letra pelo som/nome ou imagem
  | 'letter_trace_match'   // Associar som, imagem e letra
  | 'trace_letter'         // NOVO: Cobrir/traçar a letra mágica no canvas com brilho
  | 'missing_letter'       // NOVO: Letra faltante (ex: _ B E L H A ou B _ L A)
  | 'syllable_blend'       // Juntar C + V para fazer sílaba simples
  | 'syllable_identify'    // Identificar a sílaba inicial
  | 'missing_syllable'     // NOVO: Sílaba faltante (ex: CA - ___ - LO -> VA)
  | 'complex_blend'        // Juntar consoantes + vogal (CH, LH, NH, BR, TR, etc.)
  | 'word_build_simple'    // Arrastar/clicar sílabas simples para formar palavra
  | 'word_build_complex'   // Montar palavra com sílaba complexa
  | 'hangman_magic'        // NOVO: Descoberta Mágica / Forca infantil dos Balões
  | 'mini_crossword'       // NOVO: Mini-cruzadinha infantil ilustrada
  | 'sentence_build';      // Organizar palavras para formar frase com sentido

export interface CrosswordClue {
  word: string;
  hint: string;
  emoji: string;
  missingIndex: number;
}

export interface CrosswordData {
  horizontal: CrosswordClue;
  vertical: CrosswordClue;
  sharedChar: string; // Letra ou sílaba compartilhada no cruzamento
}

export interface ChallengeItem {
  id: string;
  type?: ChallengeType;       // Permite tipos específicos por atividade dentro da mesma fase
  prompt: string;             // Texto exibido
  spokenPrompt: string;       // Texto falado para a criança
  targetAnswer: string;       // Resposta correta
  options: string[];          // Opções para a criança escolher ou ordenar
  imageEmoji?: string;        // Emoji amigável
  imageSvgType?: string;      // Identificador de ilustração
  helperHint?: string;        // Dica mágica
  phonemeSound?: string;      // Descrição fônica / som
  audioWord?: string;         // Palavra de referência falada
  syllables?: string[];       // Sílabas se aplicável
  letterToTrace?: string;     // Letra para cobrir no canvas (ex: 'A', 'E', 'B'...)
  wordDisplay?: string;       // Texto com lacuna (ex: "_ B E L H A")
  secretWord?: string;        // Palavra secreta para a Forca dos Balões
  crosswordData?: CrosswordData; // Dados para cruzadinha
}

export interface LevelDef {
  id: number;                 // 1 a 20
  title: string;              // Título da fase
  subtitle: string;           // Descrição pedagógica
  category: LevelCategory;    // Categoria conforme solicitado
  challengeType: ChallengeType; // Tipo base da fase
  pastelTheme: {
    bg: string;
    card: string;
    border: string;
    accent: string;
    text: string;
    badgeBg: string;
    badgeText: string;
  };
  iconName: string;
  items: ChallengeItem[];
}

export interface UserProgress {
  unlockedLevel: number;
  completedLevels: Record<number, { stars: number; highStreak: number }>;
  stickers: string[];
  playerName: string;
  soundEnabled: boolean;
  slowSpeech: boolean;
  textCase: 'UPPER' | 'lower';
}
