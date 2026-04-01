/**
 * Script to inject missing Phase 1-3 translations into all 13 non-Korean locales.
 * Run: node scripts/inject-translations.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const LOCALES_DIR = join(import.meta.dirname, '..', 'src', 'i18n', 'locales');

const LOCALES = ['en','ja','zh-CN','zh-TW','es','fr','pt','de','it','hi','ar','bn','ru','tr'];

// ============================================================
// FORTUNE.JSON TRANSLATIONS
// ============================================================

const personalDaily = {
  en: {
    elementName: { '木': 'Wood', '火': 'Fire', '土': 'Earth', '金': 'Metal', '水': 'Water' },
    elementLabel: "Today's Energy",
    fallbackPrefix: "A whisper from the stars"
  },
  ja: {
    elementName: { '木': '木', '火': '火', '土': '土', '金': '金', '水': '水' },
    elementLabel: "今日のエネルギー",
    fallbackPrefix: "星からのささやき"
  },
  'zh-CN': {
    elementName: { '木': '木', '火': '火', '土': '土', '金': '金', '水': '水' },
    elementLabel: "今日能量",
    fallbackPrefix: "来自星辰的低语"
  },
  'zh-TW': {
    elementName: { '木': '木', '火': '火', '土': '土', '金': '金', '水': '水' },
    elementLabel: "今日能量",
    fallbackPrefix: "來自星辰的低語"
  },
  es: {
    elementName: { '木': 'Madera', '火': 'Fuego', '土': 'Tierra', '金': 'Metal', '水': 'Agua' },
    elementLabel: "Energía de hoy",
    fallbackPrefix: "Un susurro de las estrellas"
  },
  fr: {
    elementName: { '木': 'Bois', '火': 'Feu', '土': 'Terre', '金': 'Métal', '水': 'Eau' },
    elementLabel: "Énergie du jour",
    fallbackPrefix: "Un murmure des étoiles"
  },
  pt: {
    elementName: { '木': 'Madeira', '火': 'Fogo', '土': 'Terra', '金': 'Metal', '水': 'Água' },
    elementLabel: "Energia de hoje",
    fallbackPrefix: "Um sussurro das estrelas"
  },
  de: {
    elementName: { '木': 'Holz', '火': 'Feuer', '土': 'Erde', '金': 'Metall', '水': 'Wasser' },
    elementLabel: "Energie des Tages",
    fallbackPrefix: "Ein Flüstern der Sterne"
  },
  it: {
    elementName: { '木': 'Legno', '火': 'Fuoco', '土': 'Terra', '金': 'Metallo', '水': 'Acqua' },
    elementLabel: "Energia di oggi",
    fallbackPrefix: "Un sussurro dalle stelle"
  },
  hi: {
    elementName: { '木': 'लकड़ी', '火': 'अग्नि', '土': 'पृथ्वी', '金': 'धातु', '水': 'जल' },
    elementLabel: "आज की ऊर्जा",
    fallbackPrefix: "सितारों की फुसफुसाहट"
  },
  ar: {
    elementName: { '木': 'الخشب', '火': 'النار', '土': 'الأرض', '金': 'المعدن', '水': 'الماء' },
    elementLabel: "طاقة اليوم",
    fallbackPrefix: "همسة من النجوم"
  },
  bn: {
    elementName: { '木': 'কাঠ', '火': 'আগুন', '土': 'মাটি', '金': 'ধাতু', '水': 'জল' },
    elementLabel: "আজকের শক্তি",
    fallbackPrefix: "তারাদের ফিসফিস"
  },
  ru: {
    elementName: { '木': 'Дерево', '火': 'Огонь', '土': 'Земля', '金': 'Металл', '水': 'Вода' },
    elementLabel: "Энергия дня",
    fallbackPrefix: "Шёпот звёзд"
  },
  tr: {
    elementName: { '木': 'Ağaç', '火': 'Ateş', '土': 'Toprak', '金': 'Metal', '水': 'Su' },
    elementLabel: "Bugünün Enerjisi",
    fallbackPrefix: "Yıldızlardan bir fısıltı"
  },
};

// personalDaily interaction messages — template with {{name}} and {{element}}
const pdMessages = {
  en: {
    generate: {
      new: "{{name}}, today {{element}} energy opens a new flow. Quietly plant a seed.",
      waxing: "{{name}}, {{element}} energy is nurturing your possibilities today. Ride the flow.",
      full: "{{name}}, {{element}} energy has reached its peak. What you attempt today will shine.",
      waning: "{{name}}, {{element}} energy gently wraps around you today. Take a moment to reflect on what you've achieved."
    },
    generated: {
      new: "{{name}}, today is a day when {{element}} energy quietly replenishes. Take time to care for yourself.",
      waxing: "{{name}}, {{element}} energy is slowly rising. A receptive attitude will invite good fortune.",
      full: "{{name}}, {{element}} energy is overflowing. Someone's kindness may find its way to you today.",
      waning: "{{name}}, warm {{element}} energy lingers. Think of things you're grateful for."
    },
    same: {
      new: "{{name}}, today {{element}} energy and you are connected as one. Trust your instincts.",
      waxing: "{{name}}, the resonance of {{element}} grows stronger. Don't let the ideas that come to you slip away.",
      full: "{{name}}, {{element}} energy is at its clearest today. The most 'you' choice is the best choice.",
      waning: "{{name}}, your rhythm and {{element}}'s rhythm align well today. Let yourself flow comfortably."
    },
    restrain: {
      new: "{{name}}, today is a day when {{element}} energy faces a test. It's okay to take a beat.",
      waxing: "{{name}}, there's opposing energy against {{element}}, but you can grow stronger within it.",
      full: "{{name}}, if you feel tension, gather your {{element}} strength. Standing firm is also courage.",
      waning: "{{name}}, today's friction is preparation for tomorrow's growth. Trust in {{element}}'s roots."
    },
    restrained: {
      new: "{{name}}, today is a day when {{element}} energy draws inward. No need to push yourself.",
      waxing: "{{name}}, {{element}} may feel a bit suppressed, but starting small opens the way.",
      full: "{{name}}, save your {{element}} strength today. Waiting for the right moment is also strategy.",
      waning: "{{name}}, {{element}} energy is resting now. Empty your heart for tomorrow."
    }
  },
  ja: {
    generate: {
      new: "{{name}}さん、今日{{element}}の気が新しい流れを開いてくれます。静かに種を蒔きましょう。",
      waxing: "{{name}}さん、{{element}}の力が今日のあなたの可能性を育んでいます。流れに乗りましょう。",
      full: "{{name}}さん、{{element}}のエネルギーが絶頂に達しています。今日試みることは光を浴びるでしょう。",
      waning: "{{name}}さん、{{element}}の気が穏やかに包んでくれる日です。成し遂げたことを振り返ってみましょう。"
    },
    generated: {
      new: "{{name}}さん、今日は{{element}}の気が静かに満ちてくる日です。自分を労る時間を過ごしましょう。",
      waxing: "{{name}}さん、{{element}}のエネルギーがゆっくりと満ちています。受け入れる姿勢が幸運を呼びます。",
      full: "{{name}}さん、{{element}}の気が充満しています。誰かの好意があなたに届く日かもしれません。",
      waning: "{{name}}さん、{{element}}の温かい気が留まっています。感謝を思い浮かべてみましょう。"
    },
    same: {
      new: "{{name}}さん、今日は{{element}}の気とあなたが一つに繋がっています。直感を信じましょう。",
      waxing: "{{name}}さん、{{element}}の共鳴が大きくなっています。浮かぶ考えを逃さないでください。",
      full: "{{name}}さん、{{element}}の気が最も鮮明な日です。あなたらしい選択が最良の選択です。",
      waning: "{{name}}さん、{{element}}のリズムとあなたのリズムが合う日です。心地よく流れましょう。"
    },
    restrain: {
      new: "{{name}}さん、今日は{{element}}の気が試される日です。一拍休んでも大丈夫です。",
      waxing: "{{name}}さん、{{element}}に逆らう気がありますが、その中で強くなれます。",
      full: "{{name}}さん、緊張を感じたら{{element}}の力を整えましょう。耐えることも勇気です。",
      waning: "{{name}}さん、今日の摩擦は明日の成長への準備です。{{element}}の根を信じましょう。"
    },
    restrained: {
      new: "{{name}}さん、今日は{{element}}の気が少し縮こまる日です。無理しなくて大丈夫です。",
      waxing: "{{name}}さん、{{element}}が少し抑えられる気ですが、小さなことから始めれば道が開けます。",
      full: "{{name}}さん、今日は{{element}}の力を蓄えましょう。時を待つのも戦略です。",
      waning: "{{name}}さん、{{element}}の気が休んでいる時間です。明日のために心を空にしましょう。"
    }
  },
  'zh-CN': {
    generate: {
      new: "{{name}}，今天{{element}}的气为你打开新的流向。安静地播下种子吧。",
      waxing: "{{name}}，{{element}}的力量正在培养你今天的可能性。顺势而行吧。",
      full: "{{name}}，{{element}}的能量达到了顶峰。今天尝试的事情将会闪耀。",
      waning: "{{name}}，{{element}}的气温柔地环绕着你。回顾一下你已取得的成就吧。"
    },
    generated: {
      new: "{{name}}，今天是{{element}}的气悄然充盈的日子。花些时间照顾自己吧。",
      waxing: "{{name}}，{{element}}的能量正在缓缓上升。接纳的姿态将带来好运。",
      full: "{{name}}，{{element}}的气充沛满溢。也许今天会有人的善意降临到你身上。",
      waning: "{{name}}，{{element}}温暖的气息仍在停留。想想那些让你感恩的事物吧。"
    },
    same: {
      new: "{{name}}，今天{{element}}的气与你连为一体。相信你的直觉吧。",
      waxing: "{{name}}，{{element}}的共鸣越来越强。不要错过脑海中浮现的想法。",
      full: "{{name}}，今天{{element}}的气最为鲜明。最像你的选择就是最好的选择。",
      waning: "{{name}}，你的节奏与{{element}}的节奏今天很合拍。舒适地随波逐流吧。"
    },
    restrain: {
      new: "{{name}}，今天是{{element}}的气受到考验的日子。休息一拍也没关系。",
      waxing: "{{name}}，有股力量在对抗{{element}}，但你可以在其中变得更强。",
      full: "{{name}}，如果感到紧张，就调整{{element}}的力量吧。坚守也是一种勇气。",
      waning: "{{name}}，今天的摩擦是为明天的成长做准备。相信{{element}}的根基吧。"
    },
    restrained: {
      new: "{{name}}，今天是{{element}}的气略微收缩的日子。不必勉强自己。",
      waxing: "{{name}}，{{element}}可能感觉有些受压，但从小事开始就能打开道路。",
      full: "{{name}}，今天就积蓄{{element}}的力量吧。等待时机也是一种策略。",
      waning: "{{name}}，{{element}}的气正在休息。为明天腾空你的心吧。"
    }
  },
  'zh-TW': {
    generate: {
      new: "{{name}}，今天{{element}}的氣為你打開新的流向。安靜地播下種子吧。",
      waxing: "{{name}}，{{element}}的力量正在培育你今天的可能性。順勢而行吧。",
      full: "{{name}}，{{element}}的能量已達頂峰。今天嘗試的事情將會閃耀。",
      waning: "{{name}}，{{element}}的氣溫柔地環繞著你。回顧一下你已取得的成就吧。"
    },
    generated: {
      new: "{{name}}，今天是{{element}}的氣悄然充盈的日子。花些時間照顧自己吧。",
      waxing: "{{name}}，{{element}}的能量正在緩緩上升。接納的姿態將帶來好運。",
      full: "{{name}}，{{element}}的氣充沛滿溢。也許今天會有人的善意降臨到你身上。",
      waning: "{{name}}，{{element}}溫暖的氣息仍在停留。想想那些讓你感恩的事物吧。"
    },
    same: {
      new: "{{name}}，今天{{element}}的氣與你連為一體。相信你的直覺吧。",
      waxing: "{{name}}，{{element}}的共鳴越來越強。不要錯過腦海中浮現的想法。",
      full: "{{name}}，今天{{element}}的氣最為鮮明。最像你的選擇就是最好的選擇。",
      waning: "{{name}}，你的節奏與{{element}}的節奏今天很合拍。舒適地隨波逐流吧。"
    },
    restrain: {
      new: "{{name}}，今天是{{element}}的氣受到考驗的日子。休息一拍也沒關係。",
      waxing: "{{name}}，有股力量在對抗{{element}}，但你可以在其中變得更強。",
      full: "{{name}}，如果感到緊張，就調整{{element}}的力量吧。堅守也是一種勇氣。",
      waning: "{{name}}，今天的摩擦是為明天的成長做準備。相信{{element}}的根基吧。"
    },
    restrained: {
      new: "{{name}}，今天是{{element}}的氣略微收縮的日子。不必勉強自己。",
      waxing: "{{name}}，{{element}}可能感覺有些受壓，但從小事開始就能打開道路。",
      full: "{{name}}，今天就積蓄{{element}}的力量吧。等待時機也是一種策略。",
      waning: "{{name}}，{{element}}的氣正在休息。為明天騰空你的心吧。"
    }
  },
  es: {
    generate: {
      new: "{{name}}, hoy la energía de {{element}} abre un nuevo flujo. Planta una semilla en silencio.",
      waxing: "{{name}}, la energía de {{element}} nutre tus posibilidades hoy. Déjate llevar.",
      full: "{{name}}, la energía de {{element}} ha alcanzado su cima. Lo que intentes hoy brillará.",
      waning: "{{name}}, la energía de {{element}} te envuelve suavemente hoy. Reflexiona sobre lo logrado."
    },
    generated: {
      new: "{{name}}, hoy la energía de {{element}} se renueva en silencio. Cuídate.",
      waxing: "{{name}}, la energía de {{element}} crece lentamente. Una actitud receptiva atraerá fortuna.",
      full: "{{name}}, la energía de {{element}} desborda. La amabilidad de alguien podría llegar a ti hoy.",
      waning: "{{name}}, la cálida energía de {{element}} permanece. Piensa en lo que agradeces."
    },
    same: {
      new: "{{name}}, hoy la energía de {{element}} y tú están conectados. Confía en tu intuición.",
      waxing: "{{name}}, la resonancia de {{element}} se fortalece. No dejes escapar las ideas que surjan.",
      full: "{{name}}, la energía de {{element}} es la más clara hoy. La elección más auténtica es la mejor.",
      waning: "{{name}}, tu ritmo y el de {{element}} están en armonía hoy. Fluye con comodidad."
    },
    restrain: {
      new: "{{name}}, hoy la energía de {{element}} enfrenta una prueba. Está bien tomar un respiro.",
      waxing: "{{name}}, hay energía opuesta a {{element}}, pero puedes fortalecerte en ella.",
      full: "{{name}}, si sientes tensión, recoge la fuerza de {{element}}. Resistir también es valentía.",
      waning: "{{name}}, la fricción de hoy prepara el crecimiento de mañana. Confía en las raíces de {{element}}."
    },
    restrained: {
      new: "{{name}}, hoy la energía de {{element}} se repliega. No necesitas forzarte.",
      waxing: "{{name}}, {{element}} puede sentirse algo reprimido, pero empezar en pequeño abre caminos.",
      full: "{{name}}, guarda la fuerza de {{element}} hoy. Esperar el momento justo también es estrategia.",
      waning: "{{name}}, la energía de {{element}} descansa ahora. Vacía tu corazón para mañana."
    }
  },
  fr: {
    generate: {
      new: "{{name}}, aujourd'hui l'énergie de {{element}} ouvre un nouveau flux. Plantez une graine en silence.",
      waxing: "{{name}}, l'énergie de {{element}} nourrit vos possibilités aujourd'hui. Laissez-vous porter.",
      full: "{{name}}, l'énergie de {{element}} a atteint son apogée. Ce que vous tentez aujourd'hui brillera.",
      waning: "{{name}}, l'énergie de {{element}} vous enveloppe doucement. Prenez un moment pour contempler vos réalisations."
    },
    generated: {
      new: "{{name}}, aujourd'hui l'énergie de {{element}} se renouvelle en silence. Prenez soin de vous.",
      waxing: "{{name}}, l'énergie de {{element}} monte lentement. Une attitude réceptive attirera la chance.",
      full: "{{name}}, l'énergie de {{element}} déborde. La bienveillance de quelqu'un pourrait vous trouver aujourd'hui.",
      waning: "{{name}}, la chaleur de {{element}} persiste. Pensez aux choses dont vous êtes reconnaissant."
    },
    same: {
      new: "{{name}}, aujourd'hui l'énergie de {{element}} et vous ne faites qu'un. Fiez-vous à votre instinct.",
      waxing: "{{name}}, la résonance de {{element}} grandit. Ne laissez pas échapper les idées qui surgissent.",
      full: "{{name}}, l'énergie de {{element}} est la plus claire aujourd'hui. Le choix le plus authentique est le meilleur.",
      waning: "{{name}}, votre rythme et celui de {{element}} s'accordent aujourd'hui. Laissez-vous couler."
    },
    restrain: {
      new: "{{name}}, aujourd'hui l'énergie de {{element}} est mise à l'épreuve. C'est normal de ralentir.",
      waxing: "{{name}}, une force s'oppose à {{element}}, mais vous pouvez en sortir plus fort.",
      full: "{{name}}, si vous sentez une tension, rassemblez la force de {{element}}. Tenir bon est aussi du courage.",
      waning: "{{name}}, la friction d'aujourd'hui prépare la croissance de demain. Faites confiance aux racines de {{element}}."
    },
    restrained: {
      new: "{{name}}, aujourd'hui l'énergie de {{element}} se replie. Pas besoin de vous forcer.",
      waxing: "{{name}}, {{element}} peut sembler un peu freiné, mais commencer petit ouvre la voie.",
      full: "{{name}}, conservez la force de {{element}} aujourd'hui. Attendre le bon moment est aussi stratégique.",
      waning: "{{name}}, l'énergie de {{element}} se repose. Videz votre cœur pour demain."
    }
  },
  pt: {
    generate: {
      new: "{{name}}, hoje a energia de {{element}} abre um novo fluxo. Plante uma semente em silêncio.",
      waxing: "{{name}}, a energia de {{element}} nutre suas possibilidades hoje. Siga o fluxo.",
      full: "{{name}}, a energia de {{element}} atingiu seu pico. O que tentar hoje vai brilhar.",
      waning: "{{name}}, a energia de {{element}} envolve você suavemente hoje. Reflita sobre o que conquistou."
    },
    generated: {
      new: "{{name}}, hoje a energia de {{element}} se renova em silêncio. Cuide de si.",
      waxing: "{{name}}, a energia de {{element}} cresce lentamente. Uma atitude receptiva atrairá boa sorte.",
      full: "{{name}}, a energia de {{element}} transborda. A gentileza de alguém pode chegar até você hoje.",
      waning: "{{name}}, o calor de {{element}} permanece. Pense nas coisas pelas quais é grato."
    },
    same: {
      new: "{{name}}, hoje a energia de {{element}} e você estão conectados. Confie na intuição.",
      waxing: "{{name}}, a ressonância de {{element}} se fortalece. Não deixe as ideias escaparem.",
      full: "{{name}}, a energia de {{element}} está mais clara hoje. A escolha mais autêntica é a melhor.",
      waning: "{{name}}, seu ritmo e o de {{element}} estão alinhados hoje. Deixe-se fluir."
    },
    restrain: {
      new: "{{name}}, hoje a energia de {{element}} enfrenta um teste. Tudo bem fazer uma pausa.",
      waxing: "{{name}}, há energia oposta a {{element}}, mas você pode se fortalecer nela.",
      full: "{{name}}, se sentir tensão, reúna a força de {{element}}. Resistir também é coragem.",
      waning: "{{name}}, o atrito de hoje prepara o crescimento de amanhã. Confie nas raízes de {{element}}."
    },
    restrained: {
      new: "{{name}}, hoje a energia de {{element}} se recolhe. Não precisa se forçar.",
      waxing: "{{name}}, {{element}} pode parecer um pouco contido, mas começar pequeno abre caminhos.",
      full: "{{name}}, guarde a força de {{element}} hoje. Esperar o momento certo também é estratégia.",
      waning: "{{name}}, a energia de {{element}} descansa agora. Esvazie o coração para amanhã."
    }
  },
  de: {
    generate: {
      new: "{{name}}, heute öffnet die Energie von {{element}} einen neuen Fluss. Pflanze still einen Samen.",
      waxing: "{{name}}, die Energie von {{element}} nährt heute deine Möglichkeiten. Lass dich tragen.",
      full: "{{name}}, die Energie von {{element}} hat ihren Höhepunkt erreicht. Was du heute versuchst, wird leuchten.",
      waning: "{{name}}, die Energie von {{element}} umhüllt dich sanft heute. Blicke auf das Erreichte zurück."
    },
    generated: {
      new: "{{name}}, heute füllt sich die Energie von {{element}} still auf. Nimm dir Zeit für dich.",
      waxing: "{{name}}, die Energie von {{element}} steigt langsam. Eine empfangende Haltung bringt Glück.",
      full: "{{name}}, die Energie von {{element}} fließt über. Jemandes Freundlichkeit könnte dich heute erreichen.",
      waning: "{{name}}, die warme Energie von {{element}} verweilt. Denke an das, wofür du dankbar bist."
    },
    same: {
      new: "{{name}}, heute sind die Energie von {{element}} und du eins. Vertraue deiner Intuition.",
      waxing: "{{name}}, die Resonanz von {{element}} wird stärker. Lass die Ideen nicht entwischen.",
      full: "{{name}}, die Energie von {{element}} ist heute am klarsten. Die authentischste Wahl ist die beste.",
      waning: "{{name}}, dein Rhythmus und der von {{element}} harmonieren heute. Fließe bequem dahin."
    },
    restrain: {
      new: "{{name}}, heute wird die Energie von {{element}} auf die Probe gestellt. Eine Pause ist in Ordnung.",
      waxing: "{{name}}, es gibt Widerstand gegen {{element}}, aber du kannst darin stärker werden.",
      full: "{{name}}, wenn du Spannung spürst, sammle die Kraft von {{element}}. Standhalten ist auch Mut.",
      waning: "{{name}}, die heutige Reibung bereitet das Wachstum von morgen vor. Vertraue den Wurzeln von {{element}}."
    },
    restrained: {
      new: "{{name}}, heute zieht sich die Energie von {{element}} zurück. Du musst dich nicht zwingen.",
      waxing: "{{name}}, {{element}} fühlt sich vielleicht etwas gedämpft an, aber klein anfangen öffnet Wege.",
      full: "{{name}}, spare heute die Kraft von {{element}}. Den richtigen Moment abzuwarten ist auch Strategie.",
      waning: "{{name}}, die Energie von {{element}} ruht jetzt. Leere dein Herz für morgen."
    }
  },
  it: {
    generate: {
      new: "{{name}}, oggi l'energia di {{element}} apre un nuovo flusso. Pianta un seme in silenzio.",
      waxing: "{{name}}, l'energia di {{element}} nutre le tue possibilità oggi. Cavalca il flusso.",
      full: "{{name}}, l'energia di {{element}} ha raggiunto il culmine. Ciò che tenti oggi brillerà.",
      waning: "{{name}}, l'energia di {{element}} ti avvolge dolcemente oggi. Rifletti su ciò che hai raggiunto."
    },
    generated: {
      new: "{{name}}, oggi l'energia di {{element}} si rinnova in silenzio. Prenditi cura di te.",
      waxing: "{{name}}, l'energia di {{element}} sale lentamente. Un atteggiamento ricettivo attirerà fortuna.",
      full: "{{name}}, l'energia di {{element}} trabocca. La gentilezza di qualcuno potrebbe raggiungerti oggi.",
      waning: "{{name}}, il calore di {{element}} permane. Pensa alle cose di cui sei grato."
    },
    same: {
      new: "{{name}}, oggi l'energia di {{element}} e tu siete connessi. Fidati del tuo istinto.",
      waxing: "{{name}}, la risonanza di {{element}} si rafforza. Non lasciar sfuggire le idee che emergono.",
      full: "{{name}}, l'energia di {{element}} è la più chiara oggi. La scelta più autentica è la migliore.",
      waning: "{{name}}, il tuo ritmo e quello di {{element}} sono in armonia oggi. Lasciati scorrere."
    },
    restrain: {
      new: "{{name}}, oggi l'energia di {{element}} affronta una prova. Va bene prendersi una pausa.",
      waxing: "{{name}}, c'è energia contraria a {{element}}, ma puoi rafforzarti in essa.",
      full: "{{name}}, se senti tensione, raccogli la forza di {{element}}. Resistere è anche coraggio.",
      waning: "{{name}}, l'attrito di oggi prepara la crescita di domani. Fidati delle radici di {{element}}."
    },
    restrained: {
      new: "{{name}}, oggi l'energia di {{element}} si ritira. Non c'è bisogno di forzarti.",
      waxing: "{{name}}, {{element}} può sembrare un po' soffocato, ma iniziare in piccolo apre la strada.",
      full: "{{name}}, conserva la forza di {{element}} oggi. Aspettare il momento giusto è anche strategia.",
      waning: "{{name}}, l'energia di {{element}} riposa ora. Svuota il cuore per domani."
    }
  },
  hi: {
    generate: {
      new: "{{name}}, आज {{element}} की ऊर्जा एक नया प्रवाह खोलती है। चुपचाप एक बीज बोइए।",
      waxing: "{{name}}, {{element}} की शक्ति आज आपकी संभावनाओं को पोषित कर रही है। प्रवाह में बहिए।",
      full: "{{name}}, {{element}} की ऊर्जा अपने चरम पर है। आज जो भी प्रयास करेंगे वह चमकेगा।",
      waning: "{{name}}, {{element}} की ऊर्जा आज आपको कोमलता से लपेट रही है। अपनी उपलब्धियों पर चिंतन करें।"
    },
    generated: {
      new: "{{name}}, आज {{element}} की ऊर्जा शांति से भर रही है। अपना ख्याल रखने का समय निकालें।",
      waxing: "{{name}}, {{element}} की ऊर्जा धीरे-धीरे बढ़ रही है। ग्रहणशील रवैया सौभाग्य लाएगा।",
      full: "{{name}}, {{element}} की ऊर्जा भरपूर है। किसी की दयालुता आज आप तक पहुंच सकती है।",
      waning: "{{name}}, {{element}} की गर्म ऊर्जा बनी हुई है। जिन चीज़ों के लिए आभारी हैं उन पर विचार करें।"
    },
    same: {
      new: "{{name}}, आज {{element}} की ऊर्जा और आप एक हैं। अपनी अंतर्ज्ञान पर भरोसा करें।",
      waxing: "{{name}}, {{element}} का अनुनाद मज़बूत हो रहा है। आने वाले विचारों को जाने न दें।",
      full: "{{name}}, आज {{element}} की ऊर्जा सबसे स्पष्ट है। सबसे सच्चा चुनाव सबसे अच्छा है।",
      waning: "{{name}}, आपकी लय और {{element}} की लय आज मेल खा रही है। आराम से बहें।"
    },
    restrain: {
      new: "{{name}}, आज {{element}} की ऊर्जा परीक्षा का सामना कर रही है। रुकना भी ठीक है।",
      waxing: "{{name}}, {{element}} के विरुद्ध ऊर्जा है, लेकिन आप इसमें मज़बूत हो सकते हैं।",
      full: "{{name}}, तनाव महसूस हो तो {{element}} की शक्ति एकत्र करें। डटे रहना भी साहस है।",
      waning: "{{name}}, आज का घर्षण कल की वृद्धि की तैयारी है। {{element}} की जड़ों पर भरोसा करें।"
    },
    restrained: {
      new: "{{name}}, आज {{element}} की ऊर्जा भीतर की ओर मुड़ रही है। ज़बरदस्ती की ज़रूरत नहीं।",
      waxing: "{{name}}, {{element}} थोड़ा दबा हुआ लग सकता है, लेकिन छोटी शुरुआत रास्ता खोलती है।",
      full: "{{name}}, आज {{element}} की शक्ति बचाकर रखें। सही समय की प्रतीक्षा भी रणनीति है।",
      waning: "{{name}}, {{element}} की ऊर्जा अभी विश्राम कर रही है। कल के लिए हृदय खाली करें।"
    }
  },
  ar: {
    generate: {
      new: "{{name}}، اليوم طاقة {{element}} تفتح تدفقًا جديدًا. ازرع بذرة بهدوء.",
      waxing: "{{name}}، طاقة {{element}} ترعى إمكانياتك اليوم. اركب الموجة.",
      full: "{{name}}، طاقة {{element}} بلغت ذروتها. ما تحاوله اليوم سيتألق.",
      waning: "{{name}}، طاقة {{element}} تحتضنك بلطف اليوم. تأمل فيما حققته."
    },
    generated: {
      new: "{{name}}، اليوم طاقة {{element}} تتجدد بصمت. خذ وقتًا للعناية بنفسك.",
      waxing: "{{name}}، طاقة {{element}} ترتفع ببطء. الموقف المتقبل يجلب الحظ.",
      full: "{{name}}، طاقة {{element}} تفيض. لطف شخص ما قد يصل إليك اليوم.",
      waning: "{{name}}، دفء {{element}} لا يزال حاضرًا. فكر فيما تشعر بالامتنان تجاهه."
    },
    same: {
      new: "{{name}}، اليوم طاقة {{element}} وأنت متصلان. ثق بحدسك.",
      waxing: "{{name}}، صدى {{element}} يزداد قوة. لا تدع الأفكار التي تراودك تفلت.",
      full: "{{name}}، طاقة {{element}} في أوضح حالاتها اليوم. الخيار الأكثر أصالة هو الأفضل.",
      waning: "{{name}}، إيقاعك وإيقاع {{element}} متناغمان اليوم. انسجم براحة."
    },
    restrain: {
      new: "{{name}}، اليوم طاقة {{element}} تواجه اختبارًا. لا بأس في أخذ استراحة.",
      waxing: "{{name}}، هناك طاقة معارضة لـ{{element}}، لكن يمكنك أن تصبح أقوى من خلالها.",
      full: "{{name}}، إذا شعرت بالتوتر، اجمع قوة {{element}}. الصمود أيضًا شجاعة.",
      waning: "{{name}}، احتكاك اليوم يُعد لنمو الغد. ثق بجذور {{element}}."
    },
    restrained: {
      new: "{{name}}، اليوم طاقة {{element}} تنسحب للداخل. لا حاجة لإجهاد نفسك.",
      waxing: "{{name}}، قد يبدو {{element}} مكبوتًا قليلاً، لكن البداية الصغيرة تفتح الطريق.",
      full: "{{name}}، وفّر قوة {{element}} اليوم. انتظار اللحظة المناسبة أيضًا استراتيجية.",
      waning: "{{name}}، طاقة {{element}} ترتاح الآن. أفرغ قلبك للغد."
    }
  },
  bn: {
    generate: {
      new: "{{name}}, আজ {{element}}-এর শক্তি নতুন প্রবাহ খুলে দিচ্ছে। নীরবে একটি বীজ বপন করুন।",
      waxing: "{{name}}, {{element}}-এর শক্তি আজ আপনার সম্ভাবনা লালন করছে। প্রবাহে ভেসে যান।",
      full: "{{name}}, {{element}}-এর শক্তি চরমে পৌঁছেছে। আজ যা চেষ্টা করবেন তা উজ্জ্বল হবে।",
      waning: "{{name}}, {{element}}-এর শক্তি আজ আপনাকে কোমলভাবে জড়িয়ে রাখছে। অর্জনগুলো ফিরে দেখুন।"
    },
    generated: {
      new: "{{name}}, আজ {{element}}-এর শক্তি নীরবে পূর্ণ হচ্ছে। নিজের যত্ন নিন।",
      waxing: "{{name}}, {{element}}-এর শক্তি ধীরে উঠছে। গ্রহণশীল মনোভাব সৌভাগ্য আনবে।",
      full: "{{name}}, {{element}}-এর শক্তি উপচে পড়ছে। কারো দয়া আজ আপনার কাছে পৌঁছতে পারে।",
      waning: "{{name}}, {{element}}-এর উষ্ণতা রয়ে গেছে। কৃতজ্ঞতার বিষয়গুলো ভাবুন।"
    },
    same: {
      new: "{{name}}, আজ {{element}}-এর শক্তি আর আপনি একাকার। প্রবৃত্তিতে বিশ্বাস রাখুন।",
      waxing: "{{name}}, {{element}}-এর অনুরণন শক্তিশালী হচ্ছে। মনে আসা ভাবনা হারাবেন না।",
      full: "{{name}}, আজ {{element}}-এর শক্তি সবচেয়ে স্পষ্ট। সবচেয়ে আপনার মতো পছন্দই সেরা।",
      waning: "{{name}}, আপনার ছন্দ আর {{element}}-এর ছন্দ আজ মিলে যাচ্ছে। স্বচ্ছন্দে ভাসুন।"
    },
    restrain: {
      new: "{{name}}, আজ {{element}}-এর শক্তি পরীক্ষার মুখে। একটু থামা ঠিক আছে।",
      waxing: "{{name}}, {{element}}-এর বিরুদ্ধে শক্তি আছে, তবে এর মধ্যেই শক্তিশালী হতে পারেন।",
      full: "{{name}}, টান অনুভব করলে {{element}}-এর শক্তি সংগ্রহ করুন। দাঁড়িয়ে থাকাও সাহস।",
      waning: "{{name}}, আজকের ঘর্ষণ আগামীকালের বৃদ্ধির প্রস্তুতি। {{element}}-এর শিকড়ে বিশ্বাস রাখুন।"
    },
    restrained: {
      new: "{{name}}, আজ {{element}}-এর শক্তি ভেতরে গুটিয়ে যাচ্ছে। জোর করার দরকার নেই।",
      waxing: "{{name}}, {{element}} একটু চাপা মনে হতে পারে, তবে ছোট শুরু পথ খোলে।",
      full: "{{name}}, আজ {{element}}-এর শক্তি সঞ্চয় করুন। সঠিক মুহূর্তের অপেক্ষাও কৌশল।",
      waning: "{{name}}, {{element}}-এর শক্তি এখন বিশ্রামে। আগামীর জন্য হৃদয় খালি করুন।"
    }
  },
  ru: {
    generate: {
      new: "{{name}}, сегодня энергия {{element}} открывает новый поток. Посейте семя в тишине.",
      waxing: "{{name}}, энергия {{element}} питает ваши возможности сегодня. Плывите по течению.",
      full: "{{name}}, энергия {{element}} достигла пика. То, что вы попробуете сегодня, засияет.",
      waning: "{{name}}, энергия {{element}} мягко обволакивает вас сегодня. Оглянитесь на достигнутое."
    },
    generated: {
      new: "{{name}}, сегодня энергия {{element}} тихо восполняется. Уделите время заботе о себе.",
      waxing: "{{name}}, энергия {{element}} медленно растёт. Открытость привлечёт удачу.",
      full: "{{name}}, энергия {{element}} переполняет. Чья-то доброта может найти вас сегодня.",
      waning: "{{name}}, тёплая энергия {{element}} ещё здесь. Подумайте о том, за что благодарны."
    },
    same: {
      new: "{{name}}, сегодня энергия {{element}} и вы — одно целое. Доверьтесь интуиции.",
      waxing: "{{name}}, резонанс {{element}} усиливается. Не упускайте приходящие идеи.",
      full: "{{name}}, энергия {{element}} сегодня яснее всего. Самый искренний выбор — лучший.",
      waning: "{{name}}, ваш ритм и ритм {{element}} сегодня совпадают. Плывите с комфортом."
    },
    restrain: {
      new: "{{name}}, сегодня энергия {{element}} проходит испытание. Можно сделать паузу.",
      waxing: "{{name}}, есть сопротивление {{element}}, но вы можете стать сильнее через него.",
      full: "{{name}}, если чувствуете напряжение, соберите силу {{element}}. Стойкость — тоже мужество.",
      waning: "{{name}}, сегодняшнее трение готовит завтрашний рост. Доверьтесь корням {{element}}."
    },
    restrained: {
      new: "{{name}}, сегодня энергия {{element}} уходит вглубь. Не нужно себя заставлять.",
      waxing: "{{name}}, {{element}} может казаться подавленным, но начать с малого — это путь.",
      full: "{{name}}, сберегите силу {{element}} сегодня. Ждать подходящий момент — тоже стратегия.",
      waning: "{{name}}, энергия {{element}} отдыхает. Освободите сердце для завтра."
    }
  },
  tr: {
    generate: {
      new: "{{name}}, bugün {{element}} enerjisi yeni bir akış açıyor. Sessizce bir tohum ek.",
      waxing: "{{name}}, {{element}} enerjisi bugün olanaklarını besliyor. Akışa kapıl.",
      full: "{{name}}, {{element}} enerjisi zirveye ulaştı. Bugün denediğin şey parlayacak.",
      waning: "{{name}}, {{element}} enerjisi bugün seni yumuşakça sarıyor. Başardıklarını düşün."
    },
    generated: {
      new: "{{name}}, bugün {{element}} enerjisi sessizce doluyor. Kendine zaman ayır.",
      waxing: "{{name}}, {{element}} enerjisi yavaşça yükseliyor. Alıcı bir tutum şans getirir.",
      full: "{{name}}, {{element}} enerjisi taşıyor. Birinin iyiliği bugün sana ulaşabilir.",
      waning: "{{name}}, {{element}} sıcaklığı hâlâ burada. Minnet duyduğun şeyleri düşün."
    },
    same: {
      new: "{{name}}, bugün {{element}} enerjisi ve sen birsiniz. Sezgilerine güven.",
      waxing: "{{name}}, {{element}} rezonansı güçleniyor. Aklına gelen fikirleri kaçırma.",
      full: "{{name}}, {{element}} enerjisi bugün en berrak haliyle. En 'sen' olan seçim en iyisidir.",
      waning: "{{name}}, senin ritmin ve {{element}} ritmi bugün uyumlu. Rahatça ak."
    },
    restrain: {
      new: "{{name}}, bugün {{element}} enerjisi sınanıyor. Bir nefes almak sorun değil.",
      waxing: "{{name}}, {{element}}'e karşı bir enerji var ama onun içinde güçlenebilirsin.",
      full: "{{name}}, gerginlik hissedersen {{element}} gücünü topla. Direnmek de cesarettir.",
      waning: "{{name}}, bugünkü sürtünme yarının büyümesine hazırlık. {{element}} köklerine güven."
    },
    restrained: {
      new: "{{name}}, bugün {{element}} enerjisi içe çekiliyor. Kendini zorlamana gerek yok.",
      waxing: "{{name}}, {{element}} biraz bastırılmış hissedebilir ama küçük başlangıçlar yol açar.",
      full: "{{name}}, bugün {{element}} gücünü biriktir. Doğru anı beklemek de stratejidir.",
      waning: "{{name}}, {{element}} enerjisi şimdi dinleniyor. Yarın için kalbini boşalt."
    }
  },
};

// Tarot deep archetypes (22 cards) - translate archetype and context
const tarotDeep = {
  en: { // already in file
    "0": { archetype: "The Pure Adventurer", context: "This card awakens the fearless child within you. If there's something you want to start anew, that's exactly why this card appeared." },
  },
  ja: {
    "0": { archetype: "純粋な冒険者", context: "このカードはあなたの中の恐れ知らずの子供を目覚めさせます。今新しく始めたいことがあるなら、それがこのカードが来た理由です。" },
    "1": { archetype: "意志の錬金術師", context: "必要なものはすでに揃っていると告げています。散らばったものを一つに集めて集中しましょう。" },
    "2": { archetype: "内なる導き手", context: "今は理性より直感に従う時です。言葉にできない知があなたにあることを伝えています。" },
    "3": { archetype: "豊穣の母", context: "育みと創造のエネルギーがあなたを呼んでいます。何かを育てたり創り出す時間です。" },
    "4": { archetype: "秩序の守護者", context: "揺れるものに構造を与えましょう。あなたが柱になるべき時だと告げています。" },
    "5": { archetype: "智慧の伝達者", context: "誰かの助言や教えが今あなたに必要かもしれません。あるいはあなたがその役割です。" },
    "6": { archetype: "岐路の選択者", context: "頭ではなく心が答えを知っています。本当に大切なものは何かを問いかけています。" },
    "7": { archetype: "突破する戦士", context: "相反する力を一つにまとめて前進しましょう。意志さえあれば道は開けます。" },
    "8": { archetype: "柔らかな支配者", context: "抑え込むのではなく受け入れることが本当の強さです。忍耐の価値を教えています。" },
    "9": { archetype: "道の賢者", context: "今は一人の時間が必要な時です。孤独の中で見つかる答えがあります。" },
    "10": { archetype: "運命の転換者", context: "車輪は常に回ります。今の状況は永遠ではなく、それが希望です。" },
    "11": { archetype: "真実の審判者", context: "今あなたには公正な目が必要です。偏見を手放し、ありのままを見ましょう。" },
    "12": { archetype: "自発的犠牲者", context: "立ち止まることは後退ではありません。視点を変えれば見えなかったものが見えます。" },
    "13": { archetype: "変容の門番", context: "何かを手放さなければ新しいものは入りません。終わりではなく変身の始まりです。" },
    "14": { archetype: "調和の錬金術師", context: "極端の間で中心を取りましょう。急がず、しかし着実に混ぜ合わせましょう。" },
    "15": { archetype: "影の鏡", context: "恐れているものは外ではなく内にあります。向き合ってこそ自由になれます。" },
    "16": { archetype: "解放の稲妻", context: "崩れるものは間違って積まれたものです。苦しくても必要な解体を告げています。" },
    "17": { archetype: "希望の守護者", context: "闇の中でも光は消えていません。最も暗い時に最も明るい星が昇ります。" },
    "18": { archetype: "無意識の案内人", context: "今見えているものが全てではありません。不安の裏に隠れた直感のメッセージを伝えます。" },
    "19": { archetype: "内なる光", context: "あなたはすでに答えを知っています。自信を取り戻し、ありのまま輝きましょう。" },
    "20": { archetype: "覚醒のラッパ", context: "過去を振り返りつつも後悔ではなく気づきとして。真の自分として立ち上がりましょう。" },
    "21": { archetype: "完成の踊り手", context: "一つの旅が完結しようとしています。成就を祝い、次の扉を開く準備をしましょう。" }
  },
  'zh-CN': {
    "0": { archetype: "纯真的冒险者", context: "这张牌唤醒了你内心无畏的孩童。如果有什么想重新开始的，那就是这张牌出现的原因。" },
    "1": { archetype: "意志的炼金术士", context: "你需要的一切已经具备。将散落的碎片汇聚一处，集中精力。" },
    "2": { archetype: "内在的引导者", context: "现在是跟随直觉而非理性的时候。你拥有一种无法言说的智慧。" },
    "3": { archetype: "丰饶之母", context: "养育与创造的能量在召唤你。是时候培育或创造些什么了。" },
    "4": { archetype: "秩序的守护者", context: "为动摇的事物赋予结构。现在是你成为支柱的时候。" },
    "5": { archetype: "智慧的传递者", context: "某人的建议或教导也许正是你现在所需。或许你就是那个角色。" },
    "6": { archetype: "十字路口的选择者", context: "心而非脑知道答案。这张牌在问你什么才是真正重要的。" },
    "7": { archetype: "突破的战士", context: "将对立的力量合而为一，勇往直前。只要有意志，路就会打开。" },
    "8": { archetype: "温柔的主宰者", context: "真正的力量不在于压制，而在于接纳。这张牌唤醒忍耐的价值。" },
    "9": { archetype: "路上的贤者", context: "现在需要独处的时间。在孤独中有等待被发现的答案。" },
    "10": { archetype: "命运的转换者", context: "轮子永远在转。当下的处境不会永恒，这本身就是希望。" },
    "11": { archetype: "真理的审判者", context: "你现在需要公正的目光。放下偏见，如实观察。" },
    "12": { archetype: "自愿的牺牲者", context: "停下不是后退。换个角度就能看见隐藏的事物。" },
    "13": { archetype: "蜕变的守门人", context: "放手旧物，新事物才能进来。这不是终结，而是变身的开始。" },
    "14": { archetype: "调和的炼金术士", context: "在极端之间找到中心。不急不缓，稳步调和。" },
    "15": { archetype: "阴影之镜", context: "你所恐惧的不在外面而在内心。直面它才能获得自由。" },
    "16": { archetype: "解放之雷", context: "崩塌的是建错的东西。虽然痛苦但这是必要的拆解。" },
    "17": { archetype: "希望的守护者", context: "即使在黑暗中光也未曾消失。最暗的时刻最亮的星升起。" },
    "18": { archetype: "潜意识的向导", context: "你看到的不是全部。不安背后隐藏着直觉的信息。" },
    "19": { archetype: "内在之光", context: "你已经知道答案。恢复信心，做最真实的自己。" },
    "20": { archetype: "觉醒的号角", context: "回顾过去，不是后悔而是领悟。以真实的自我站起来。" },
    "21": { archetype: "圆满的舞者", context: "一段旅程正在完结。庆祝成就，准备打开下一扇门。" }
  },
};

// For languages not explicitly defined, derive from English with locale-specific label translations
const tarotLabels = {
  en: { deepLabel: "Why this card came to you now", flowLabel: "The flow the cards convey", flowPastToFuture: "From the past {{past}}, through the present {{present}}, the future moves toward {{future}}. Trust the flow.", flowSingle: "In this very moment, the energy of {{card}} surrounds you." },
  ja: { deepLabel: "このカードが今あなたに来た理由", flowLabel: "カードが伝える流れ", flowPastToFuture: "過去の{{past}}から現在の{{present}}を経て、未来は{{future}}へ向かっています。流れを信じましょう。", flowSingle: "今この瞬間、{{card}}のエネルギーがあなたを包んでいます。" },
  'zh-CN': { deepLabel: "这张牌此刻来到你身边的原因", flowLabel: "牌传达的流向", flowPastToFuture: "从过去的{{past}}，经过现在的{{present}}，未来朝着{{future}}前行。相信这个流向。", flowSingle: "此刻，{{card}}的能量环绕着你。" },
  'zh-TW': { deepLabel: "這張牌此刻來到你身邊的原因", flowLabel: "牌傳達的流向", flowPastToFuture: "從過去的{{past}}，經過現在的{{present}}，未來朝著{{future}}前行。相信這個流向。", flowSingle: "此刻，{{card}}的能量環繞著你。" },
  es: { deepLabel: "Por qué esta carta vino a ti ahora", flowLabel: "El flujo que transmiten las cartas", flowPastToFuture: "Desde el pasado {{past}}, a través del presente {{present}}, el futuro se mueve hacia {{future}}. Confía en el flujo.", flowSingle: "En este preciso momento, la energía de {{card}} te rodea." },
  fr: { deepLabel: "Pourquoi cette carte est venue à vous maintenant", flowLabel: "Le flux que transmettent les cartes", flowPastToFuture: "Du passé {{past}}, à travers le présent {{present}}, l'avenir se dirige vers {{future}}. Faites confiance au flux.", flowSingle: "En cet instant même, l'énergie de {{card}} vous entoure." },
  pt: { deepLabel: "Por que esta carta veio a você agora", flowLabel: "O fluxo que as cartas transmitem", flowPastToFuture: "Do passado {{past}}, através do presente {{present}}, o futuro caminha para {{future}}. Confie no fluxo.", flowSingle: "Neste exato momento, a energia de {{card}} envolve você." },
  de: { deepLabel: "Warum diese Karte jetzt zu dir kam", flowLabel: "Der Fluss, den die Karten vermitteln", flowPastToFuture: "Von der Vergangenheit {{past}}, durch die Gegenwart {{present}}, bewegt sich die Zukunft in Richtung {{future}}. Vertraue dem Fluss.", flowSingle: "In diesem Moment umgibt dich die Energie von {{card}}." },
  it: { deepLabel: "Perché questa carta è venuta a te ora", flowLabel: "Il flusso che le carte trasmettono", flowPastToFuture: "Dal passato {{past}}, attraverso il presente {{present}}, il futuro si muove verso {{future}}. Fidati del flusso.", flowSingle: "In questo preciso momento, l'energia di {{card}} ti circonda." },
  hi: { deepLabel: "यह कार्ड अभी आपके पास क्यों आया", flowLabel: "कार्ड जो प्रवाह बताते हैं", flowPastToFuture: "अतीत {{past}} से, वर्तमान {{present}} के माध्यम से, भविष्य {{future}} की ओर बढ़ रहा है। प्रवाह पर भरोसा करें।", flowSingle: "इस क्षण, {{card}} की ऊर्जा आपको घेरे हुए है।" },
  ar: { deepLabel: "لماذا جاءت هذه الورقة إليك الآن", flowLabel: "التدفق الذي تنقله الأوراق", flowPastToFuture: "من الماضي {{past}}، عبر الحاضر {{present}}، يتجه المستقبل نحو {{future}}. ثق بالتدفق.", flowSingle: "في هذه اللحظة بالذات، طاقة {{card}} تحيط بك." },
  bn: { deepLabel: "এই কার্ড এখন আপনার কাছে কেন এসেছে", flowLabel: "কার্ডগুলো যে প্রবাহ বহন করে", flowPastToFuture: "অতীতের {{past}} থেকে, বর্তমানের {{present}} হয়ে, ভবিষ্যৎ {{future}}-এর দিকে এগিয়ে যাচ্ছে। প্রবাহে বিশ্বাস রাখুন।", flowSingle: "এই মুহূর্তে, {{card}}-এর শক্তি আপনাকে ঘিরে রেখেছে।" },
  ru: { deepLabel: "Почему эта карта пришла к вам сейчас", flowLabel: "Поток, который несут карты", flowPastToFuture: "Из прошлого {{past}}, через настоящее {{present}}, будущее движется к {{future}}. Доверьтесь потоку.", flowSingle: "В этот самый момент энергия {{card}} окружает вас." },
  tr: { deepLabel: "Bu kart neden şimdi sana geldi", flowLabel: "Kartların aktardığı akış", flowPastToFuture: "Geçmişteki {{past}}'den, şimdiki {{present}} aracılığıyla, gelecek {{future}}'e doğru ilerliyor. Akışa güven.", flowSingle: "Tam bu anda, {{card}} enerjisi seni sarıyor." },
};

// Sign context — zodiac traits (abbreviated for non-CJK; full data in English file)
const signContextTitle = {
  en: "Your Zodiac Sign", ja: "あなたの星座", 'zh-CN': "你的星座", 'zh-TW': "你的星座",
  es: "Tu signo zodiacal", fr: "Votre signe du zodiaque", pt: "Seu signo do zodíaco",
  de: "Dein Sternzeichen", it: "Il tuo segno zodiacale", hi: "आपकी राशि",
  ar: "برجك", bn: "আপনার রাশি", ru: "Ваш знак зодиака", tr: "Burcun"
};

const signElements = {
  en: { fire: "Fire", earth: "Earth", air: "Air", water: "Water" },
  ja: { fire: "火", earth: "土", air: "風", water: "水" },
  'zh-CN': { fire: "火", earth: "土", air: "风", water: "水" },
  'zh-TW': { fire: "火", earth: "土", air: "風", water: "水" },
  es: { fire: "Fuego", earth: "Tierra", air: "Aire", water: "Agua" },
  fr: { fire: "Feu", earth: "Terre", air: "Air", water: "Eau" },
  pt: { fire: "Fogo", earth: "Terra", air: "Ar", water: "Água" },
  de: { fire: "Feuer", earth: "Erde", air: "Luft", water: "Wasser" },
  it: { fire: "Fuoco", earth: "Terra", air: "Aria", water: "Acqua" },
  hi: { fire: "अग्नि", earth: "पृथ्वी", air: "वायु", water: "जल" },
  ar: { fire: "النار", earth: "الأرض", air: "الهواء", water: "الماء" },
  bn: { fire: "আগুন", earth: "মাটি", air: "বায়ু", water: "জল" },
  ru: { fire: "Огонь", earth: "Земля", air: "Воздух", water: "Вода" },
  tr: { fire: "Ateş", earth: "Toprak", air: "Hava", water: "Su" },
};

const signMap = { aries: 'fire', taurus: 'earth', gemini: 'air', cancer: 'water', leo: 'fire', virgo: 'earth', libra: 'air', scorpio: 'water', sagittarius: 'fire', capricorn: 'earth', aquarius: 'air', pisces: 'water' };

// Sign traits — use English as fallback for languages not explicitly listed
const signTraits = {
  en: {
    aries: "Pioneer energy. Quick to act and fearless. You blaze trails where no one else dares. Your starting power is the strongest of all twelve signs, but patience is your challenge. Your spark is the first flame that moves the world.",
    taurus: "The star of senses. You love stability and are drawn to beauty. Slow to change, but once decided, unbreakable as steel. A flower that blooms slowly but lasts the longest.",
    gemini: "The star of curiosity. Versatile and brilliant at communication. Your talent lies in crossing between worlds. Free as the wind — wherever you pass, something changes.",
    cancer: "Guardian of emotions. You place deep meaning in family and bonds. Hard shell outside, softer than anyone within. Your embrace is someone's safest harbor.",
    leo: "A luminous being. Most alive on stage, most powerful when loved. A sun-like sign with innate charisma. When you shine, everything around you shines too.",
    virgo: "The artisan of perfection. You catch details others miss. You find fulfillment in helping others. Your weakness is being too hard on yourself.",
    libra: "Seeker of harmony. You love balance and beauty. Decisions are hard, but that depth is your fairness. Where you are, harmony dwells.",
    scorpio: "Explorer of depths. Eyes that see beneath the surface. Once you give your heart, its depth is oceanic. Your courage to face darkness is your greatest power.",
    sagittarius: "Explorer of freedom. You love the wide world and grand questions. Your honesty sometimes stings, but it's always real.",
    capricorn: "The climber toward the summit. Once you set a goal, you climb surely. Serious in youth, uniquely younger with age. Time is always on your side.",
    aquarius: "Pioneer of the future. You see the world differently. Independent yet harboring love for all humanity. Those ahead of their time walk alone at first.",
    pisces: "The boundless dreamer. You move between reality and dreams, with empathy deeper than anyone. Your gentleness is the very strength this world needs most."
  },
  ja: {
    aries: "開拓者のエネルギー。行動が速く恐れを知りません。誰も歩かない道を切り開き、不可能に見えることにも果敢に飛び込みます。始める力は12星座で最も強いですが、忍耐が課題です。あなたの炎は世界を動かす最初の火花です。",
    taurus: "感覚の星。安定を愛し、美しいものに本能的に惹かれます。変化は遅いですが、一度決めたら鋼のように強い。ゆっくり咲くけれど、最も長く咲く花です。",
    gemini: "好奇心の星。多才で、コミュニケーションに優れ、どこでも場を明るくする人。一つの世界に留まるより、多くの世界を行き来することがあなたの才能です。風のように自由に、しかしあなたが通り過ぎた場所には必ず何かが変わっています。",
    cancer: "感情の守護者。家族と親密な関係に深い意味を置き、大切な人を守るためなら限りなく強くなります。外は硬い殻で守っていますが、中は誰よりも柔らかく温かい。あなたの懐は誰かにとって世界で最も安全な港です。",
    leo: "輝く存在。舞台の上で最も生き生きとし、愛される時に最も強い力を発揮します。生まれ持ったカリスマと温かい寛大さで人々を引き寄せます。あなたが輝く時、周りも共に輝きます。",
    virgo: "完璧の職人。他の人が見逃すディテールを捉え、混沌の中から秩序を生み出す天賦の才能があります。人を助けることに心からの喜びを感じます。自分に厳しすぎることが弱点です。",
    libra: "調和の追求者。バランスと美を愛し、世界の不均衡を本能的に感じ取ります。決断は難しいですが、その深い思慮こそがあなたの公正さです。あなたがいるところに調和が宿ります。",
    scorpio: "深みの探求者。表面の下を見透かす目を持ち、一度心を預ければその深さは海のようです。破壊と再生を繰り返しながら強くなる不死鳥のような星座。闇に向き合う勇気があなたの最大の力です。",
    sagittarius: "自由の冒険家。広い世界と大きな問いを愛し、人生を一つの壮大な冒険として捉えます。楽観的で率直、時に遠くまで走りすぎることも。あなたの正直さは時に痛いですが、常に真実です。",
    capricorn: "頂上を目指す登山家。目標を定めたら黙々と、しかし必ず登り切る人です。若い頃は同年代より真面目で、年齢とともにむしろ若くなる特別な星座。時間は常にあなたの味方です。",
    aquarius: "未来の先駆者。他の人とは異なる視点で世界を見て、まだ来ない明日を想像する天才です。自由と平等を重んじ独立的ですが、その心の奥には人類全体への愛があります。時代を先行く人は最初は常に一人です。",
    pisces: "境界のない夢想家。現実と夢の間を自由に行き来し、共感能力が誰よりも深い。他人の痛みを自分のもののように感じる巨大な心の持ち主であり、芸術的霊感の源泉です。あなたの優しさこそ、この世界に最も必要な力です。"
  },
};

// Resonance deep messages
const resonanceDeep = {
  en: { aligned: "The Sun and Moon are on the same wavelength. Today, intuition and action naturally become one.", approaching: "The Sun and Moon are drawing toward each other. A day when new inspiration or encounters may arrive.", neutral: "The Sun and Moon are walking their own paths. Today, focus inward rather than outward.", distant: "Tension between the Sun and Moon is felt today. Try to find balance between emotion and reason." },
  ja: { aligned: "太陽と月が同じ波長にあります。今日は直感と行動が自然に一つになります。", approaching: "太陽と月が引き合っています。新しいインスピレーションや出会いが訪れるかもしれない日です。", neutral: "太陽と月がそれぞれの道を歩んでいます。今日は外より内に集中しましょう。", distant: "太陽と月の間に緊張が感じられる日です。感情と理性のバランスを取ってみましょう。" },
  'zh-CN': { aligned: "太阳和月亮在同一频率上。今天直觉与行动自然合一。", approaching: "太阳和月亮正在彼此靠近。新的灵感或际遇可能到来的一天。", neutral: "太阳和月亮各走各的路。今天专注于内心而非外在。", distant: "今天感受到太阳与月亮之间的张力。试着在情感与理性之间找到平衡。" },
  'zh-TW': { aligned: "太陽和月亮在同一頻率上。今天直覺與行動自然合一。", approaching: "太陽和月亮正在彼此靠近。新的靈感或際遇可能到來的一天。", neutral: "太陽和月亮各走各的路。今天專注於內心而非外在。", distant: "今天感受到太陽與月亮之間的張力。試著在情感與理性之間找到平衡。" },
  es: { aligned: "El Sol y la Luna están en la misma longitud de onda. Hoy la intuición y la acción se unen naturalmente.", approaching: "El Sol y la Luna se acercan. Un día donde nueva inspiración o encuentros pueden llegar.", neutral: "El Sol y la Luna caminan por sus propios senderos. Hoy, enfócate hacia dentro.", distant: "Se siente tensión entre el Sol y la Luna hoy. Busca equilibrio entre emoción y razón." },
  fr: { aligned: "Le Soleil et la Lune sont sur la même longueur d'onde. Aujourd'hui, intuition et action ne font qu'un.", approaching: "Le Soleil et la Lune se rapprochent. Un jour où de nouvelles inspirations ou rencontres peuvent arriver.", neutral: "Le Soleil et la Lune suivent leurs propres chemins. Concentrez-vous sur l'intérieur aujourd'hui.", distant: "Une tension entre le Soleil et la Lune se fait sentir aujourd'hui. Cherchez l'équilibre entre émotion et raison." },
  pt: { aligned: "O Sol e a Lua estão na mesma frequência. Hoje intuição e ação se unem naturalmente.", approaching: "O Sol e a Lua se aproximam. Um dia em que novas inspirações ou encontros podem chegar.", neutral: "O Sol e a Lua seguem seus próprios caminhos. Hoje, foque para dentro.", distant: "Tensão entre o Sol e a Lua é sentida hoje. Tente encontrar equilíbrio entre emoção e razão." },
  de: { aligned: "Sonne und Mond sind auf derselben Wellenlänge. Heute werden Intuition und Handeln natürlich eins.", approaching: "Sonne und Mond nähern sich einander. Ein Tag, an dem neue Inspiration oder Begegnungen kommen können.", neutral: "Sonne und Mond gehen ihre eigenen Wege. Heute nach innen schauen statt nach außen.", distant: "Spannung zwischen Sonne und Mond ist heute spürbar. Versuche Balance zwischen Gefühl und Verstand zu finden." },
  it: { aligned: "Sole e Luna sono sulla stessa lunghezza d'onda. Oggi intuizione e azione si fondono naturalmente.", approaching: "Sole e Luna si avvicinano. Un giorno in cui nuove ispirazioni o incontri possono arrivare.", neutral: "Sole e Luna camminano per i propri sentieri. Oggi, concentrati verso l'interno.", distant: "Tensione tra Sole e Luna si avverte oggi. Cerca l'equilibrio tra emozione e ragione." },
  hi: { aligned: "सूर्य और चंद्रमा एक ही तरंगदैर्ध्य पर हैं। आज अंतर्ज्ञान और क्रिया स्वाभाविक रूप से एक हो जाते हैं।", approaching: "सूर्य और चंद्रमा एक-दूसरे की ओर खिंच रहे हैं। नई प्रेरणा या मुलाकात आ सकती है।", neutral: "सूर्य और चंद्रमा अपने-अपने रास्ते चल रहे हैं। आज बाहर की बजाय भीतर ध्यान दें।", distant: "आज सूर्य और चंद्रमा के बीच तनाव महसूस हो रहा है। भावना और तर्क के बीच संतुलन खोजें।" },
  ar: { aligned: "الشمس والقمر على نفس الموجة. اليوم تتحد الحدس والفعل بشكل طبيعي.", approaching: "الشمس والقمر يقتربان من بعضهما. يوم قد يحمل إلهامًا أو لقاءات جديدة.", neutral: "الشمس والقمر يسيران في طريقيهما. اليوم ركز على الداخل بدلاً من الخارج.", distant: "توتر بين الشمس والقمر محسوس اليوم. حاول إيجاد توازن بين العاطفة والعقل." },
  bn: { aligned: "সূর্য ও চন্দ্র একই তরঙ্গদৈর্ঘ্যে আছে। আজ অন্তর্জ্ঞান ও কর্ম স্বাভাবিকভাবে একাকার হয়।", approaching: "সূর্য ও চন্দ্র পরস্পরের দিকে আসছে। নতুন অনুপ্রেরণা বা সাক্ষাৎ আসতে পারে।", neutral: "সূর্য ও চন্দ্র নিজ নিজ পথে চলছে। আজ বাইরের বদলে ভেতরে মনোযোগ দিন।", distant: "আজ সূর্য ও চন্দ্রের মধ্যে টানাপোড়েন অনুভূত হচ্ছে। আবেগ ও যুক্তির মধ্যে ভারসাম্য খুঁজুন।" },
  ru: { aligned: "Солнце и Луна на одной волне. Сегодня интуиция и действие естественно сливаются.", approaching: "Солнце и Луна притягиваются друг к другу. День, когда может прийти новое вдохновение или встреча.", neutral: "Солнце и Луна идут своими путями. Сегодня сосредоточьтесь на внутреннем.", distant: "Сегодня чувствуется напряжение между Солнцем и Луной. Постарайтесь найти баланс между чувством и разумом." },
  tr: { aligned: "Güneş ve Ay aynı dalga boyundalar. Bugün sezgi ve eylem doğal olarak birleşiyor.", approaching: "Güneş ve Ay birbirine yaklaşıyor. Yeni ilham veya karşılaşmalar gelebilecek bir gün.", neutral: "Güneş ve Ay kendi yollarında yürüyor. Bugün dışarıya değil içeriye odaklan.", distant: "Bugün Güneş ve Ay arasında gerilim hissediliyor. Duygu ve akıl arasında denge bulmaya çalış." },
};

// Element Deep
const elementDeep = {
  en: { excess: { '木': "When Wood is excessive, plans multiply but action blurs. Metal's decisiveness helps prune the branches.", '火': "When Fire is excessive, passion can consume you. Water's stillness restores your center.", '土': "When Earth is excessive, you fear change. Wood's growth energy breaks through and creates renewal.", '金': "When Metal is excessive, perfectionism can chill relationships. Fire's warmth melts the cold steel.", '水': "When Water is excessive, you drown in thought and cannot move. Earth's stability gives direction to the flowing water." }, deficient: { '木': "When Wood is lacking, courage for new beginnings fades. Green spaces, walks, and tending plants can help.", '火': "When Fire is lacking, passion and confidence weaken. Warm colors, active exercise, and socializing rekindle the flame.", '土': "When Earth is lacking, your center wavers and anxiety grows. Regular routines, cooking, and nature walks bring stability.", '金': "When Metal is lacking, decisions become difficult. Organizing, playing instruments, and setting clear goals help.", '水': "When Water is lacking, intuition and flexibility diminish. Walks by water, meditation, and reading replenish wisdom." }, balanceTitle: "What your Five Elements reveal" },
  ja: { excess: { '木': "木が過剰になると計画ばかり増え実行が薄れます。金の決断力が枝を剪定してくれます。", '火': "火が過剰になると情熱が自分を焼き尽くすことがあります。水の静けさが中心を取り戻してくれます。", '土': "土が過剰になると変化を恐れるようになります。木の成長エネルギーが地面を突き破り新しさを生みます。", '金': "金が過剰になると完璧主義が人間関係を冷たくすることがあります。火の温かさが冷たい金属を溶かします。", '水': "水が過剰になると考えに溺れて動けなくなります。土の安定感が流れる水に方向を与えます。" }, deficient: { '木': "木が不足すると新しい始まりへの勇気が減ります。緑の空間、散歩、植物の世話が助けになります。", '火': "火が不足すると情熱と自信が弱まります。暖かい色、活発な運動、交流が炎を蘇らせます。", '土': "土が不足すると中心が揺らぎ不安が増します。規則正しい生活、料理、自然の中の散歩が安定をもたらします。", '金': "金が不足すると決断が難しくなります。整理整頓、楽器演奏、明確な目標設定が助けになります。", '水': "水が不足すると直感と柔軟性が減ります。水辺の散歩、瞑想、読書が知恵を補います。" }, balanceTitle: "五行が語るあなたのこと" },
  'zh-CN': { excess: { '木': "木过旺时计划增多但行动模糊。金的果断帮助修剪枝叶。", '火': "火过旺时热情可能灼伤自己。水的宁静恢复你的中心。", '土': "土过旺时会害怕改变。木的生长能量破土而出带来新生。", '金': "金过旺时完美主义可能使关系冰冷。火的温暖融化冰冷的金属。", '水': "水过旺时沉溺于思考而无法行动。土的稳定给流水以方向。" }, deficient: { '木': "木不足时开始新事物的勇气减弱。绿色空间、散步、养植物有帮助。", '火': "火不足时热情和信心减弱。暖色调、积极运动、社交活动重燃火焰。", '土': "土不足时中心动摇、焦虑增加。规律生活、烹饪、自然散步带来稳定。", '金': "金不足时难以做决定。整理、演奏乐器、设定明确目标有帮助。", '水': "水不足时直觉和灵活性降低。水边散步、冥想、阅读补充智慧。" }, balanceTitle: "你的五行揭示了什么" },
  'zh-TW': { excess: { '木': "木過旺時計劃增多但行動模糊。金的果斷幫助修剪枝葉。", '火': "火過旺時熱情可能灼傷自己。水的寧靜恢復你的中心。", '土': "土過旺時會害怕改變。木的生長能量破土而出帶來新生。", '金': "金過旺時完美主義可能使關係冰冷。火的溫暖融化冰冷的金屬。", '水': "水過旺時沉溺於思考而無法行動。土的穩定給流水以方向。" }, deficient: { '木': "木不足時開始新事物的勇氣減弱。綠色空間、散步、養植物有幫助。", '火': "火不足時熱情和信心減弱。暖色調、積極運動、社交活動重燃火焰。", '土': "土不足時中心動搖、焦慮增加。規律生活、烹飪、自然散步帶來穩定。", '金': "金不足時難以做決定。整理、演奏樂器、設定明確目標有幫助。", '水': "水不足時直覺和靈活性降低。水邊散步、冥想、閱讀補充智慧。" }, balanceTitle: "你的五行揭示了什麼" },
  es: { excess: { '木': "Cuando la Madera es excesiva, los planes se multiplican pero la acción se nubla. La decisión del Metal poda las ramas.", '火': "Cuando el Fuego es excesivo, la pasión puede consumirte. La quietud del Agua restaura tu centro.", '土': "Cuando la Tierra es excesiva, temes al cambio. La energía de crecimiento de la Madera rompe y renueva.", '金': "Cuando el Metal es excesivo, el perfeccionismo enfría las relaciones. El calor del Fuego derrite el acero frío.", '水': "Cuando el Agua es excesiva, te ahogas en pensamientos. La estabilidad de la Tierra da dirección." }, deficient: { '木': "Cuando falta Madera, el coraje para nuevos comienzos se desvanece. Espacios verdes y caminar ayudan.", '火': "Cuando falta Fuego, la pasión se debilita. Colores cálidos y ejercicio reavivan la llama.", '土': "Cuando falta Tierra, tu centro vacila. Rutinas regulares y cocinar traen estabilidad.", '金': "Cuando falta Metal, las decisiones se dificultan. Organizar y fijar metas claras ayudan.", '水': "Cuando falta Agua, la intuición disminuye. Caminar junto al agua y meditar reponen sabiduría." }, balanceTitle: "Lo que revelan tus Cinco Elementos" },
  fr: { excess: { '木': "Quand le Bois est en excès, les plans se multiplient mais l'action se brouille. La décision du Métal élague.", '火': "Quand le Feu est en excès, la passion peut vous consumer. Le calme de l'Eau restaure votre centre.", '土': "Quand la Terre est en excès, vous craignez le changement. L'énergie du Bois perce et renouvelle.", '金': "Quand le Métal est en excès, le perfectionnisme refroidit les relations. La chaleur du Feu fond l'acier.", '水': "Quand l'Eau est en excès, vous vous noyez dans les pensées. La stabilité de la Terre donne direction." }, deficient: { '木': "Quand le Bois manque, le courage de recommencer s'estompe. Espaces verts et promenades aident.", '火': "Quand le Feu manque, passion et confiance faiblissent. Couleurs chaudes et exercice ravivent la flamme.", '土': "Quand la Terre manque, votre centre vacille. Routines régulières et cuisine apportent stabilité.", '金': "Quand le Métal manque, les décisions deviennent difficiles. Organiser et fixer des objectifs clairs aide.", '水': "Quand l'Eau manque, l'intuition diminue. Promenades au bord de l'eau et méditation restaurent la sagesse." }, balanceTitle: "Ce que révèlent vos Cinq Éléments" },
  pt: { excess: { '木': "Quando a Madeira é excessiva, os planos se multiplicam mas a ação se turva. A decisão do Metal poda os galhos.", '火': "Quando o Fogo é excessivo, a paixão pode consumir você. A quietude da Água restaura seu centro.", '土': "Quando a Terra é excessiva, você teme a mudança. A energia da Madeira rompe e renova.", '金': "Quando o Metal é excessivo, o perfeccionismo esfria relações. O calor do Fogo derrete o aço frio.", '水': "Quando a Água é excessiva, você se afoga em pensamentos. A estabilidade da Terra dá direção." }, deficient: { '木': "Quando falta Madeira, a coragem para novos começos se dissipa. Espaços verdes e caminhadas ajudam.", '火': "Quando falta Fogo, paixão e confiança enfraquecem. Cores quentes e exercício reacendem a chama.", '土': "Quando falta Terra, seu centro vacila. Rotinas regulares e cozinhar trazem estabilidade.", '金': "Quando falta Metal, as decisões se dificultam. Organizar e definir metas claras ajuda.", '水': "Quando falta Água, a intuição diminui. Caminhar perto da água e meditar repõem sabedoria." }, balanceTitle: "O que seus Cinco Elementos revelam" },
  de: { excess: { '木': "Wenn Holz im Überfluss ist, häufen sich Pläne aber Handeln wird unklar. Metalls Entschlossenheit beschneidet die Äste.", '火': "Wenn Feuer im Überfluss ist, kann Leidenschaft dich verbrennen. Wassers Stille stellt dein Zentrum her.", '土': "Wenn Erde im Überfluss ist, fürchtest du Veränderung. Holz bricht durch und erneuert.", '金': "Wenn Metall im Überfluss ist, kühlt Perfektionismus Beziehungen ab. Feuers Wärme schmilzt das kalte Metall.", '水': "Wenn Wasser im Überfluss ist, ertrinkst du in Gedanken. Erdes Stabilität gibt Richtung." }, deficient: { '木': "Wenn Holz fehlt, schwindet der Mut für Neues. Grüne Räume und Spaziergänge helfen.", '火': "Wenn Feuer fehlt, schwächen sich Leidenschaft und Vertrauen. Warme Farben und Bewegung entfachen die Flamme.", '土': "Wenn Erde fehlt, wankt dein Zentrum. Regelmäßige Routinen und Kochen bringen Stabilität.", '金': "Wenn Metall fehlt, werden Entscheidungen schwer. Ordnung schaffen und klare Ziele helfen.", '水': "Wenn Wasser fehlt, nimmt Intuition ab. Spaziergänge am Wasser und Meditation füllen Weisheit." }, balanceTitle: "Was deine Fünf Elemente verraten" },
  it: { excess: { '木': "Quando il Legno è in eccesso, i piani si moltiplicano ma l'azione si offusca. La decisione del Metallo pota i rami.", '火': "Quando il Fuoco è in eccesso, la passione può consumarti. La quiete dell'Acqua ripristina il centro.", '土': "Quando la Terra è in eccesso, temi il cambiamento. L'energia del Legno rompe e rinnova.", '金': "Quando il Metallo è in eccesso, il perfezionismo raffredda le relazioni. Il calore del Fuoco scioglie l'acciaio freddo.", '水': "Quando l'Acqua è in eccesso, ti anneghi nei pensieri. La stabilità della Terra dà direzione." }, deficient: { '木': "Quando manca il Legno, il coraggio di ricominciare svanisce. Spazi verdi e passeggiate aiutano.", '火': "Quando manca il Fuoco, passione e fiducia si indeboliscono. Colori caldi e esercizio ravvivano la fiamma.", '土': "Quando manca la Terra, il centro vacilla. Routine regolari e cucinare portano stabilità.", '金': "Quando manca il Metallo, le decisioni diventano difficili. Organizzare e fissare obiettivi chiari aiuta.", '水': "Quando manca l'Acqua, l'intuizione diminuisce. Passeggiate vicino all'acqua e meditazione ripristinano saggezza." }, balanceTitle: "Cosa rivelano i tuoi Cinque Elementi" },
  hi: { excess: { '木': "जब लकड़ी अधिक हो, योजनाएं बढ़ती हैं लेकिन क्रिया धुंधली होती है। धातु का निर्णय शाखाओं की छंटनी करता है।", '火': "जब अग्नि अधिक हो, जुनून आपको जला सकता है। जल की शांति आपका केंद्र बहाल करती है।", '土': "जब पृथ्वी अधिक हो, आप बदलाव से डरते हैं। लकड़ी की ऊर्जा तोड़कर नवीनता लाती है।", '金': "जब धातु अधिक हो, पूर्णतावाद संबंधों को ठंडा करता है। अग्नि की गर्मी ठंडे इस्पात को पिघलाती है।", '水': "जब जल अधिक हो, विचारों में डूब जाते हैं। पृथ्वी की स्थिरता दिशा देती है।" }, deficient: { '木': "जब लकड़ी कम हो, नई शुरुआत का साहस घटता है। हरे स्थान और सैर मदद करते हैं।", '火': "जब अग्नि कम हो, जुनून कमजोर होता है। गर्म रंग और व्यायाम लौ जलाते हैं।", '土': "जब पृथ्वी कम हो, केंद्र डगमगाता है। नियमित दिनचर्या स्थिरता लाती है।", '金': "जब धातु कम हो, निर्णय कठिन होते हैं। व्यवस्थित करना और लक्ष्य निर्धारित करना मदद करता है।", '水': "जब जल कम हो, अंतर्ज्ञान घटता है। जल के पास टहलना और ध्यान ज्ञान भरते हैं।" }, balanceTitle: "आपके पंचतत्व क्या बताते हैं" },
  ar: { excess: { '木': "عندما يفرط الخشب، تتكاثر الخطط لكن الفعل يضبب. حسم المعدن يقلّم الأغصان.", '火': "عندما تفرط النار، قد يحرقك الشغف. سكون الماء يعيد توازنك.", '土': "عندما تفرط الأرض، تخشى التغيير. طاقة نمو الخشب تخترق وتجدد.", '金': "عندما يفرط المعدن، الكمالية تبرد العلاقات. دفء النار يذيب المعدن البارد.", '水': "عندما يفرط الماء، تغرق في الأفكار. استقرار الأرض يعطي اتجاهاً." }, deficient: { '木': "عندما ينقص الخشب، تتلاشى الشجاعة للبدايات. المساحات الخضراء والمشي يساعدان.", '火': "عندما تنقص النار، يضعف الشغف. الألوان الدافئة والتمارين تشعل اللهب.", '土': "عندما تنقص الأرض، يتزعزع مركزك. الروتين والطبخ يجلبان الاستقرار.", '金': "عندما ينقص المعدن، تصعب القرارات. التنظيم وتحديد الأهداف يساعدان.", '水': "عندما ينقص الماء، تقل الحدس. المشي قرب الماء والتأمل يملآن الحكمة." }, balanceTitle: "ما تكشفه عناصرك الخمسة" },
  bn: { excess: { '木': "কাঠ অতিরিক্ত হলে পরিকল্পনা বাড়ে কিন্তু কাজ ঝাপসা হয়। ধাতুর দৃঢ়তা শাখা ছাঁটাই করে।", '火': "আগুন অতিরিক্ত হলে আবেগ পুড়িয়ে দিতে পারে। জলের স্থিরতা কেন্দ্র পুনরুদ্ধার করে।", '土': "মাটি অতিরিক্ত হলে পরিবর্তনে ভয় পান। কাঠের শক্তি ভেদ করে নতুনত্ব আনে।", '金': "ধাতু অতিরিক্ত হলে পরিপূর্ণতাবাদ সম্পর্ক ঠান্ডা করে। আগুনের উষ্ণতা গলায়।", '水': "জল অতিরিক্ত হলে চিন্তায় ডুবে যান। মাটির স্থিরতা দিশা দেয়।" }, deficient: { '木': "কাঠ কম হলে নতুন শুরুর সাহস কমে। সবুজ জায়গা ও হাঁটা সাহায্য করে।", '火': "আগুন কম হলে আবেগ দুর্বল হয়। উষ্ণ রঙ ও ব্যায়াম শিখা জ্বালায়।", '土': "মাটি কম হলে কেন্দ্র টলমল করে। নিয়মিত রুটিন স্থিরতা আনে।", '金': "ধাতু কম হলে সিদ্ধান্ত কঠিন হয়। গোছানো ও লক্ষ্য নির্ধারণ সাহায্য করে।", '水': "জল কম হলে অন্তর্জ্ঞান কমে। জলের ধারে হাঁটা ও ধ্যান জ্ঞান পূরণ করে।" }, balanceTitle: "আপনার পঞ্চভূত কী বলে" },
  ru: { excess: { '木': "Когда Дерево в избытке, планы множатся, но действия размываются. Решительность Металла помогает подрезать ветви.", '火': "Когда Огонь в избытке, страсть может сжечь вас. Покой Воды восстанавливает центр.", '土': "Когда Земля в избытке, вы боитесь перемен. Энергия роста Дерева прорывается и обновляет.", '金': "Когда Металл в избытке, перфекционизм охлаждает отношения. Тепло Огня плавит холодную сталь.", '水': "Когда Вода в избытке, вы тонете в мыслях. Стабильность Земли даёт направление." }, deficient: { '木': "Когда Дерева недостаёт, убывает смелость для нового. Зелёные пространства и прогулки помогают.", '火': "Когда Огня недостаёт, слабеют страсть и уверенность. Тёплые цвета и движение разжигают пламя.", '土': "Когда Земли недостаёт, центр шатается. Регулярный распорядок приносит стабильность.", '金': "Когда Металла недостаёт, решения даются трудно. Порядок и ясные цели помогают.", '水': "Когда Воды недостаёт, интуиция убывает. Прогулки у воды и медитация восполняют мудрость." }, balanceTitle: "Что открывают ваши Пять Стихий" },
  tr: { excess: { '木': "Ağaç fazla olduğunda planlar artar ama eylem bulanıklaşır. Metalin kararlılığı dalları budar.", '火': "Ateş fazla olduğunda tutku seni yakabilir. Suyun dinginliği merkezini geri getirir.", '土': "Toprak fazla olduğunda değişimden korkarsın. Ağacın büyüme enerjisi toprağı yarıp yenilenme yaratır.", '金': "Metal fazla olduğunda mükemmeliyetçilik ilişkileri soğutur. Ateşin sıcaklığı soğuk çeliği eritir.", '水': "Su fazla olduğunda düşüncelere boğulursun. Toprağın istikrarı akan suya yön verir." }, deficient: { '木': "Ağaç eksik olduğunda yeni başlangıçlara cesaret azalır. Yeşil alanlar ve yürüyüşler yardımcı olur.", '火': "Ateş eksik olduğunda tutku zayıflar. Sıcak renkler ve egzersiz alevi canlandırır.", '土': "Toprak eksik olduğunda merkez sallanır. Düzenli rutinler istikrar getirir.", '金': "Metal eksik olduğunda kararlar zorlaşır. Düzen ve net hedefler yardımcı olur.", '水': "Su eksik olduğunda sezgi azalır. Su kenarı yürüyüşleri ve meditasyon bilgeliği doldurur." }, balanceTitle: "Beş Elementin ne diyor" },
};

// Rank guide
const rankGuide = {
  en: { title: "What this fortune means", daikichi: { meaning: "Supreme fortune. Everything flows like wind in your sails.", advice: "Share this good fortune. Good energy lingers longer when shared." }, kichi: { meaning: "Good fortune. Steady effort will lead to fine results.", advice: "Don't overreach — follow the flow. The best fruit ripens in its own time." }, chukichi: { meaning: "Moderate fortune. Quiet joys beyond your expectations will find you.", advice: "Pay attention to the unseen blessings. True happiness hides in the small things." }, shokichi: { meaning: "Small fortune. A gentle, warm luck surrounds you.", advice: "Small actions outshine big ambitions right now. Step by step, fortune follows." }, suekichi: { meaning: "Late fortune. Slow now, but a good ending awaits.", advice: "The waiting itself is part of the fortune. Flowers bloom in unexpected moments." }, kyo: { meaning: "Misfortune. A time that calls for caution, but avoidable.", advice: "Avoid rash actions and postpone important decisions." }, daikyo: { meaning: "Great misfortune. The deepest bottom — but nowhere further to fall.", advice: "Once you hit the bottom, the only way is up. Spend the day humbly." } },
  ja: { title: "この運勢が意味するもの", daikichi: { meaning: "最上の吉運。すべてが順風満帆に流れる時です。", advice: "この幸運を分かち合いましょう。良い気は分けるほど長く留まります。" }, kichi: { meaning: "吉運。着実に進めば良い結果を迎えます。", advice: "無理せず流れに従いましょう。最良の果実は自然に熟します。" }, chukichi: { meaning: "中程度の吉。期待以上の小さな喜びが訪れます。", advice: "見えない幸せに注目しましょう。本当の幸福は些細なものに宿ります。" }, shokichi: { meaning: "小さな吉。穏やかで温かい運気に包まれています。", advice: "今は小さな実践が大きな野心より輝きます。一歩ずつ進みましょう。" }, suekichi: { meaning: "遅れて来る吉。今は遅くとも最終的に良い結末を迎えます。", advice: "待つこと自体が運の一部です。思いがけない瞬間に花は咲きます。" }, kyo: { meaning: "凶。注意が必要な時期ですが、避けられる不運です。", advice: "軽率な行動を控え、重要な決断は先送りしましょう。" }, daikyo: { meaning: "大凶。最も深い底ですが、これ以上下がる所はありません。", advice: "底を打てば上がるだけです。謙虚に一日を過ごしましょう。" } },
  'zh-CN': { title: "这个运势意味着什么", daikichi: { meaning: "最上吉运。万事如顺风扬帆。", advice: "分享这份好运。好的能量分享越多停留越久。" }, kichi: { meaning: "吉运。踏实前行会有好结果。", advice: "不必急躁——顺势而为。最好的果实自然成熟。" }, chukichi: { meaning: "中吉。超出期待的小喜悦会找到你。", advice: "留意看不见的祝福。真正的幸福藏在小事里。" }, shokichi: { meaning: "小吉。温和暖意的运气围绕着你。", advice: "现在小行动比大抱负更闪耀。一步一步，运气跟随。" }, suekichi: { meaning: "末吉。现在虽慢但好结局在等待。", advice: "等待本身也是运势的一部分。花会在意想不到的时刻绽放。" }, kyo: { meaning: "凶。需要谨慎但可以避免的厄运。", advice: "避免冲动行为，推迟重要决定。" }, daikyo: { meaning: "大凶。最深的谷底——但没有更低的地方了。", advice: "触底之后只有上升。谦逊度过这一天。" } },
  'zh-TW': { title: "這個運勢意味著什麼", daikichi: { meaning: "最上吉運。萬事如順風揚帆。", advice: "分享這份好運。好的能量分享越多停留越久。" }, kichi: { meaning: "吉運。踏實前行會有好結果。", advice: "不必急躁——順勢而為。最好的果實自然成熟。" }, chukichi: { meaning: "中吉。超出期待的小喜悅會找到你。", advice: "留意看不見的祝福。真正的幸福藏在小事裡。" }, shokichi: { meaning: "小吉。溫和暖意的運氣圍繞著你。", advice: "現在小行動比大抱負更閃耀。一步一步，運氣跟隨。" }, suekichi: { meaning: "末吉。現在雖慢但好結局在等待。", advice: "等待本身也是運勢的一部分。花會在意想不到的時刻綻放。" }, kyo: { meaning: "凶。需要謹慎但可以避免的厄運。", advice: "避免衝動行為，推遲重要決定。" }, daikyo: { meaning: "大凶。最深的谷底——但沒有更低的地方了。", advice: "觸底之後只有上升。謙遜度過這一天。" } },
  es: { title: "Lo que significa esta fortuna", daikichi: { meaning: "Fortuna suprema. Todo fluye como viento en tus velas.", advice: "Comparte esta buena fortuna. La energía compartida permanece más." }, kichi: { meaning: "Buena fortuna. El esfuerzo constante traerá buenos resultados.", advice: "No te excedas — sigue el flujo." }, chukichi: { meaning: "Fortuna moderada. Alegrías inesperadas te encontrarán.", advice: "Presta atención a las bendiciones invisibles." }, shokichi: { meaning: "Pequeña fortuna. Una suerte suave y cálida te rodea.", advice: "Las pequeñas acciones brillan más que las grandes ambiciones ahora." }, suekichi: { meaning: "Fortuna tardía. Lenta ahora, pero un buen final espera.", advice: "La espera misma es parte de la fortuna." }, kyo: { meaning: "Infortunio. Un tiempo de cautela, pero evitable.", advice: "Evita acciones precipitadas y posterga decisiones importantes." }, daikyo: { meaning: "Gran infortunio. El fondo más profundo — pero no hay más abajo.", advice: "Desde el fondo, solo se puede subir. Pasa el día con humildad." } },
  fr: { title: "Ce que signifie cette fortune", daikichi: { meaning: "Fortune suprême. Tout coule comme le vent dans vos voiles.", advice: "Partagez cette bonne fortune. L'énergie partagée persiste plus longtemps." }, kichi: { meaning: "Bonne fortune. L'effort constant mènera à de bons résultats.", advice: "Ne forcez pas — suivez le flux." }, chukichi: { meaning: "Fortune modérée. Des joies inattendues vous trouveront.", advice: "Prêtez attention aux bénédictions invisibles." }, shokichi: { meaning: "Petite fortune. Une chance douce et chaleureuse vous entoure.", advice: "Les petites actions brillent plus que les grandes ambitions maintenant." }, suekichi: { meaning: "Fortune tardive. Lente maintenant, mais une bonne fin attend.", advice: "L'attente elle-même fait partie de la fortune." }, kyo: { meaning: "Malchance. Un temps de prudence, mais évitable.", advice: "Évitez les actions précipitées et reportez les décisions importantes." }, daikyo: { meaning: "Grande malchance. Le fond le plus profond — mais impossible de descendre plus.", advice: "Au fond, il ne reste qu'à remonter. Passez la journée humblement." } },
  pt: { title: "O que esta fortuna significa", daikichi: { meaning: "Fortuna suprema. Tudo flui como vento em suas velas.", advice: "Compartilhe esta boa fortuna. Energia compartilhada permanece mais." }, kichi: { meaning: "Boa fortuna. Esforço constante trará bons resultados.", advice: "Não se exceda — siga o fluxo." }, chukichi: { meaning: "Fortuna moderada. Alegrias inesperadas encontrarão você.", advice: "Preste atenção às bênçãos invisíveis." }, shokichi: { meaning: "Pequena fortuna. Uma sorte suave e calorosa envolve você.", advice: "Pequenas ações brilham mais que grandes ambições agora." }, suekichi: { meaning: "Fortuna tardia. Devagar agora, mas um bom final espera.", advice: "A espera em si é parte da fortuna." }, kyo: { meaning: "Infortúnio. Um tempo de cautela, mas evitável.", advice: "Evite ações precipitadas e adie decisões importantes." }, daikyo: { meaning: "Grande infortúnio. O fundo mais profundo — mas não há mais para onde cair.", advice: "Do fundo, só se sobe. Passe o dia com humildade." } },
  de: { title: "Was dieses Schicksal bedeutet", daikichi: { meaning: "Höchstes Glück. Alles fließt wie Wind in deinen Segeln.", advice: "Teile dieses Glück. Geteilte Energie bleibt länger." }, kichi: { meaning: "Gutes Glück. Stetige Mühe führt zu guten Ergebnissen.", advice: "Überfordere dich nicht — folge dem Fluss." }, chukichi: { meaning: "Mäßiges Glück. Unerwartete kleine Freuden werden dich finden.", advice: "Achte auf die unsichtbaren Segnungen." }, shokichi: { meaning: "Kleines Glück. Ein sanftes, warmes Glück umgibt dich.", advice: "Kleine Taten überstrahlen jetzt große Ambitionen." }, suekichi: { meaning: "Spätes Glück. Langsam jetzt, aber ein gutes Ende wartet.", advice: "Das Warten selbst ist Teil des Glücks." }, kyo: { meaning: "Unglück. Eine Zeit der Vorsicht, aber vermeidbar.", advice: "Vermeide übereilte Handlungen und verschiebe wichtige Entscheidungen." }, daikyo: { meaning: "Großes Unglück. Der tiefste Punkt — aber tiefer geht es nicht.", advice: "Vom Boden aus geht es nur nach oben. Verbringe den Tag bescheiden." } },
  it: { title: "Cosa significa questa fortuna", daikichi: { meaning: "Fortuna suprema. Tutto scorre come vento nelle tue vele.", advice: "Condividi questa buona fortuna. L'energia condivisa rimane più a lungo." }, kichi: { meaning: "Buona fortuna. Lo sforzo costante porterà buoni risultati.", advice: "Non esagerare — segui il flusso." }, chukichi: { meaning: "Fortuna moderata. Gioie inaspettate ti troveranno.", advice: "Presta attenzione alle benedizioni invisibili." }, shokichi: { meaning: "Piccola fortuna. Una fortuna dolce e calda ti circonda.", advice: "Le piccole azioni brillano più delle grandi ambizioni ora." }, suekichi: { meaning: "Fortuna tardiva. Lenta ora, ma un buon finale attende.", advice: "L'attesa stessa è parte della fortuna." }, kyo: { meaning: "Sfortuna. Un tempo di cautela, ma evitabile.", advice: "Evita azioni avventate e rimanda le decisioni importanti." }, daikyo: { meaning: "Grande sfortuna. Il fondo più profondo — ma non si può scendere oltre.", advice: "Dal fondo si può solo salire. Trascorri la giornata con umiltà." } },
  hi: { title: "इस भाग्य का अर्थ", daikichi: { meaning: "सर्वोच्च भाग्य। सब कुछ पाल में हवा की तरह बहता है।", advice: "इस शुभ भाग्य को बांटें। बांटी हुई ऊर्जा लंबे समय तक रहती है।" }, kichi: { meaning: "शुभ भाग्य। निरंतर प्रयास अच्छे परिणाम लाएगा।", advice: "ज़्यादा न करें — प्रवाह का अनुसरण करें।" }, chukichi: { meaning: "मध्यम भाग्य। अप्रत्याशित छोटी खुशियां आपको मिलेंगी।", advice: "अदृश्य आशीर्वादों पर ध्यान दें।" }, shokichi: { meaning: "छोटा भाग्य। हल्का, गर्म सौभाग्य आपको घेरता है।", advice: "अभी छोटे कार्य बड़ी महत्वाकांक्षाओं से अधिक चमकते हैं।" }, suekichi: { meaning: "देर से आने वाला भाग्य। अभी धीमा, लेकिन अच्छा अंत प्रतीक्षा करता है।", advice: "प्रतीक्षा स्वयं भाग्य का हिस्सा है।" }, kyo: { meaning: "दुर्भाग्य। सावधानी का समय, लेकिन टाला जा सकता है।", advice: "जल्दबाज़ी से बचें और महत्वपूर्ण निर्णय स्थगित करें।" }, daikyo: { meaning: "महा दुर्भाग्य। सबसे गहरा तल — लेकिन और नीचे गिरने की जगह नहीं।", advice: "तल से केवल ऊपर जाया जा सकता है। विनम्रता से दिन बिताएं।" } },
  ar: { title: "ما يعنيه هذا الحظ", daikichi: { meaning: "حظ أعلى. كل شيء يجري كالريح في أشرعتك.", advice: "شارك هذا الحظ الجيد. الطاقة المشتركة تبقى أطول." }, kichi: { meaning: "حظ جيد. الجهد المستمر يؤدي لنتائج طيبة.", advice: "لا تبالغ — اتبع التدفق." }, chukichi: { meaning: "حظ معتدل. أفراح غير متوقعة ستجدك.", advice: "انتبه للبركات غير المرئية." }, shokichi: { meaning: "حظ صغير. حظ لطيف ودافئ يحيط بك.", advice: "الأفعال الصغيرة تتألق أكثر من الطموحات الكبيرة الآن." }, suekichi: { meaning: "حظ متأخر. بطيء الآن لكن نهاية جيدة تنتظر.", advice: "الانتظار نفسه جزء من الحظ." }, kyo: { meaning: "سوء حظ. وقت يحتاج حذراً لكنه قابل للتجنب.", advice: "تجنب الأفعال المتسرعة وأجّل القرارات المهمة." }, daikyo: { meaning: "سوء حظ كبير. أعمق قاع — لكن لا مكان أدنى.", advice: "من القاع لا يبقى إلا الصعود. اقض اليوم بتواضع." } },
  bn: { title: "এই ভাগ্যের অর্থ", daikichi: { meaning: "সর্বোচ্চ ভাগ্য। সবকিছু পালে বাতাসের মতো বইছে।", advice: "এই শুভ ভাগ্য ভাগ করুন। ভাগ করা শক্তি দীর্ঘস্থায়ী হয়।" }, kichi: { meaning: "শুভ ভাগ্য। অবিচল প্রচেষ্টা ভালো ফল আনবে।", advice: "বেশি করবেন না — প্রবাহ অনুসরণ করুন।" }, chukichi: { meaning: "মাঝারি ভাগ্য। অপ্রত্যাশিত ছোট আনন্দ আপনাকে খুঁজে পাবে।", advice: "অদৃশ্য আশীর্বাদে মনোযোগ দিন।" }, shokichi: { meaning: "ছোট ভাগ্য। মৃদু, উষ্ণ সৌভাগ্য আপনাকে ঘিরে আছে।", advice: "এখন ছোট কাজ বড় উচ্চাকাঙ্ক্ষার চেয়ে উজ্জ্বল।" }, suekichi: { meaning: "দেরিতে আসা ভাগ্য। এখন ধীর, কিন্তু ভালো শেষ অপেক্ষা করছে।", advice: "অপেক্ষা নিজেই ভাগ্যের অংশ।" }, kyo: { meaning: "দুর্ভাগ্য। সতর্কতার সময়, কিন্তু এড়ানো যায়।", advice: "তাড়াহুড়ো করবেন না এবং গুরুত্বপূর্ণ সিদ্ধান্ত পিছিয়ে দিন।" }, daikyo: { meaning: "মহা দুর্ভাগ্য। সবচেয়ে গভীর তল — কিন্তু আর নিচে যাওয়ার জায়গা নেই।", advice: "তল থেকে শুধু উপরে ওঠা যায়। বিনম্রভাবে দিন কাটান।" } },
  ru: { title: "Что означает это предсказание", daikichi: { meaning: "Высшая удача. Всё течёт как ветер в ваших парусах.", advice: "Поделитесь этой удачей. Разделённая энергия сохраняется дольше." }, kichi: { meaning: "Хорошая удача. Упорный труд приведёт к хорошим результатам.", advice: "Не переусердствуйте — следуйте потоку." }, chukichi: { meaning: "Умеренная удача. Неожиданные маленькие радости найдут вас.", advice: "Обратите внимание на невидимые благословения." }, shokichi: { meaning: "Малая удача. Мягкая, тёплая удача окружает вас.", advice: "Сейчас малые действия сияют ярче больших амбиций." }, suekichi: { meaning: "Поздняя удача. Медленно сейчас, но хороший конец ждёт.", advice: "Само ожидание — часть удачи." }, kyo: { meaning: "Неудача. Время осторожности, но избежимое.", advice: "Избегайте поспешных действий и отложите важные решения." }, daikyo: { meaning: "Великая неудача. Самое дно — но ниже падать некуда.", advice: "Со дна можно только подняться. Проведите день скромно." } },
  tr: { title: "Bu talihin anlamı", daikichi: { meaning: "En yüksek talih. Her şey yelkenlerindeki rüzgâr gibi akıyor.", advice: "Bu iyi talihi paylaş. Paylaşılan enerji daha uzun kalır." }, kichi: { meaning: "İyi talih. İstikrarlı çaba güzel sonuçlar getirecek.", advice: "Abartma — akışı takip et." }, chukichi: { meaning: "Orta talih. Beklenmedik küçük sevinçler seni bulacak.", advice: "Görünmez bereketlere dikkat et." }, shokichi: { meaning: "Küçük talih. Nazik, sıcak bir şans seni sarıyor.", advice: "Şu an küçük eylemler büyük hırslardan daha parlak." }, suekichi: { meaning: "Geç gelen talih. Şimdi yavaş ama güzel bir son bekliyor.", advice: "Beklemenin kendisi talihin bir parçası." }, kyo: { meaning: "Talihsizlik. Dikkat gerektiren ama kaçınılabilir bir zaman.", advice: "Acele eylemlerden kaçın ve önemli kararları ertele." }, daikyo: { meaning: "Büyük talihsizlik. En derin dip — ama daha aşağısı yok.", advice: "Dipten sonra sadece yukarı çıkılır. Günü alçakgönüllülükle geçir." } },
};

// Common.json translations
const commonTranslations = {
  en: { memo: { prompt: "How did this fortune make you feel?", placeholder: "Write a short note...", save: "Save", saved: "Saved", addNote: "Add a note", tapToEdit: "Tap to edit" }, weekly: { title: "Your flow this week", elementFlow: "Key energy this week", moodDedicated: "A week of steady dialogue with fate", moodActive: "A week of actively reading the flow", moodCurious: "A week of quietly gazing at the stars" }, historyExtra: { today: "Today", yesterday: "Yesterday", thisWeek: "This week", earlier: "Earlier" } },
  ja: { memo: { prompt: "この運勢を見てどう感じましたか？", placeholder: "短いメモを書いてください...", save: "保存", saved: "保存しました", addNote: "メモを追加", tapToEdit: "タップして編集" }, weekly: { title: "今週のあなたの流れ", elementFlow: "今週の中心エネルギー", moodDedicated: "運命と着実に対話する一週間", moodActive: "流れを積極的に読み取る一週間", moodCurious: "静かに星を見つめる一週間" }, historyExtra: { today: "今日", yesterday: "昨日", thisWeek: "今週", earlier: "以前" } },
  'zh-CN': { memo: { prompt: "这个运势让你感觉如何？", placeholder: "写一条简短笔记...", save: "保存", saved: "已保存", addNote: "添加笔记", tapToEdit: "点击编辑" }, weekly: { title: "你这周的流向", elementFlow: "本周核心能量", moodDedicated: "与命运稳定对话的一周", moodActive: "积极阅读流向的一周", moodCurious: "静静注视星星的一周" }, historyExtra: { today: "今天", yesterday: "昨天", thisWeek: "本周", earlier: "更早" } },
  'zh-TW': { memo: { prompt: "這個運勢讓你感覺如何？", placeholder: "寫一條簡短筆記...", save: "儲存", saved: "已儲存", addNote: "新增筆記", tapToEdit: "點擊編輯" }, weekly: { title: "你這週的流向", elementFlow: "本週核心能量", moodDedicated: "與命運穩定對話的一週", moodActive: "積極閱讀流向的一週", moodCurious: "靜靜注視星星的一週" }, historyExtra: { today: "今天", yesterday: "昨天", thisWeek: "本週", earlier: "更早" } },
  es: { memo: { prompt: "¿Cómo te hizo sentir esta fortuna?", placeholder: "Escribe una nota breve...", save: "Guardar", saved: "Guardado", addNote: "Añadir nota", tapToEdit: "Toca para editar" }, weekly: { title: "Tu flujo esta semana", elementFlow: "Energía clave esta semana", moodDedicated: "Una semana de diálogo constante con el destino", moodActive: "Una semana leyendo activamente el flujo", moodCurious: "Una semana contemplando las estrellas en silencio" }, historyExtra: { today: "Hoy", yesterday: "Ayer", thisWeek: "Esta semana", earlier: "Antes" } },
  fr: { memo: { prompt: "Qu'avez-vous ressenti face à cette fortune ?", placeholder: "Écrivez une courte note...", save: "Sauvegarder", saved: "Sauvegardé", addNote: "Ajouter une note", tapToEdit: "Toucher pour modifier" }, weekly: { title: "Votre flux cette semaine", elementFlow: "Énergie clé cette semaine", moodDedicated: "Une semaine de dialogue constant avec le destin", moodActive: "Une semaine de lecture active du flux", moodCurious: "Une semaine à contempler les étoiles en silence" }, historyExtra: { today: "Aujourd'hui", yesterday: "Hier", thisWeek: "Cette semaine", earlier: "Plus tôt" } },
  pt: { memo: { prompt: "Como esta fortuna fez você se sentir?", placeholder: "Escreva uma nota curta...", save: "Salvar", saved: "Salvo", addNote: "Adicionar nota", tapToEdit: "Toque para editar" }, weekly: { title: "Seu fluxo esta semana", elementFlow: "Energia-chave esta semana", moodDedicated: "Uma semana de diálogo constante com o destino", moodActive: "Uma semana lendo ativamente o fluxo", moodCurious: "Uma semana contemplando as estrelas em silêncio" }, historyExtra: { today: "Hoje", yesterday: "Ontem", thisWeek: "Esta semana", earlier: "Antes" } },
  de: { memo: { prompt: "Wie hat dich dieses Schicksal fühlen lassen?", placeholder: "Schreibe eine kurze Notiz...", save: "Speichern", saved: "Gespeichert", addNote: "Notiz hinzufügen", tapToEdit: "Zum Bearbeiten tippen" }, weekly: { title: "Dein Fluss diese Woche", elementFlow: "Schlüsselenergie diese Woche", moodDedicated: "Eine Woche des stetigen Dialogs mit dem Schicksal", moodActive: "Eine Woche des aktiven Lesens des Flusses", moodCurious: "Eine Woche des stillen Sternebetrachtens" }, historyExtra: { today: "Heute", yesterday: "Gestern", thisWeek: "Diese Woche", earlier: "Früher" } },
  it: { memo: { prompt: "Come ti ha fatto sentire questa fortuna?", placeholder: "Scrivi una breve nota...", save: "Salva", saved: "Salvato", addNote: "Aggiungi nota", tapToEdit: "Tocca per modificare" }, weekly: { title: "Il tuo flusso questa settimana", elementFlow: "Energia chiave questa settimana", moodDedicated: "Una settimana di dialogo costante col destino", moodActive: "Una settimana di lettura attiva del flusso", moodCurious: "Una settimana a contemplare le stelle in silenzio" }, historyExtra: { today: "Oggi", yesterday: "Ieri", thisWeek: "Questa settimana", earlier: "Prima" } },
  hi: { memo: { prompt: "इस भाग्य ने आपको कैसा महसूस कराया?", placeholder: "एक छोटा नोट लिखें...", save: "सहेजें", saved: "सहेजा गया", addNote: "नोट जोड़ें", tapToEdit: "संपादित करने के लिए टैप करें" }, weekly: { title: "इस सप्ताह आपका प्रवाह", elementFlow: "इस सप्ताह की मुख्य ऊर्जा", moodDedicated: "भाग्य के साथ निरंतर संवाद का सप्ताह", moodActive: "प्रवाह को सक्रिय रूप से पढ़ने का सप्ताह", moodCurious: "चुपचाप तारों को निहारने का सप्ताह" }, historyExtra: { today: "आज", yesterday: "कल", thisWeek: "इस सप्ताह", earlier: "पहले" } },
  ar: { memo: { prompt: "كيف شعرت تجاه هذا الحظ؟", placeholder: "اكتب ملاحظة قصيرة...", save: "حفظ", saved: "تم الحفظ", addNote: "أضف ملاحظة", tapToEdit: "انقر للتعديل" }, weekly: { title: "تدفقك هذا الأسبوع", elementFlow: "الطاقة الأساسية هذا الأسبوع", moodDedicated: "أسبوع من الحوار المستمر مع القدر", moodActive: "أسبوع من القراءة النشطة للتدفق", moodCurious: "أسبوع من التأمل الهادئ في النجوم" }, historyExtra: { today: "اليوم", yesterday: "أمس", thisWeek: "هذا الأسبوع", earlier: "سابقاً" } },
  bn: { memo: { prompt: "এই ভাগ্য আপনাকে কেমন অনুভব করাল?", placeholder: "একটি সংক্ষিপ্ত নোট লিখুন...", save: "সংরক্ষণ", saved: "সংরক্ষিত", addNote: "নোট যোগ করুন", tapToEdit: "সম্পাদনা করতে ট্যাপ করুন" }, weekly: { title: "এই সপ্তাহে আপনার প্রবাহ", elementFlow: "এই সপ্তাহের মূল শক্তি", moodDedicated: "ভাগ্যের সাথে অবিচল সংলাপের সপ্তাহ", moodActive: "সক্রিয়ভাবে প্রবাহ পড়ার সপ্তাহ", moodCurious: "নীরবে তারা দেখার সপ্তাহ" }, historyExtra: { today: "আজ", yesterday: "গতকাল", thisWeek: "এই সপ্তাহ", earlier: "আগে" } },
  ru: { memo: { prompt: "Какие чувства вызвало это предсказание?", placeholder: "Напишите короткую заметку...", save: "Сохранить", saved: "Сохранено", addNote: "Добавить заметку", tapToEdit: "Нажмите для редактирования" }, weekly: { title: "Ваш поток на этой неделе", elementFlow: "Ключевая энергия этой недели", moodDedicated: "Неделя постоянного диалога с судьбой", moodActive: "Неделя активного чтения потока", moodCurious: "Неделя тихого созерцания звёзд" }, historyExtra: { today: "Сегодня", yesterday: "Вчера", thisWeek: "На этой неделе", earlier: "Ранее" } },
  tr: { memo: { prompt: "Bu talih seni nasıl hissettirdi?", placeholder: "Kısa bir not yaz...", save: "Kaydet", saved: "Kaydedildi", addNote: "Not ekle", tapToEdit: "Düzenlemek için dokun" }, weekly: { title: "Bu haftaki akışın", elementFlow: "Bu haftanın anahtar enerjisi", moodDedicated: "Kaderle istikrarlı bir diyalog haftası", moodActive: "Akışı aktif olarak okuyan bir hafta", moodCurious: "Sessizce yıldızları seyreden bir hafta" }, historyExtra: { today: "Bugün", yesterday: "Dün", thisWeek: "Bu hafta", earlier: "Daha önce" } },
};

// DayMaster direction/relationship for non-English locales
const dayMasterExtra = {
  ja: {
    '甲': { direction: "組織を率いるか、新しい道を切り開く方向で輝きます", relationship: "頼りがいのある責任感のあるパートナー。ただし自分のやり方にこだわることがあります" },
    '乙': { direction: "芸術、デザイン、外交、相談など人と感性を扱う方向が合います", relationship: "相手の心をよく読む温かいパートナー。時には自分の感情をもっと表現しても良いでしょう" },
    '丙': { direction: "舞台の上、リーダーの座、教育者など人前に立つ役割で輝きます", relationship: "一緒にいると楽しく温かいパートナー。ただし全てを与えようとして自分を燃やすことも" },
    '丁': { direction: "研究、戦略、執筆、コンサルティングなど深い思考が必要な方向が合います", relationship: "真心を込めて寄り添うパートナー。表面の表現は少なくても中は誰よりも深い" },
    '戊': { direction: "経営、管理、不動産、教育など安定した基盤を作る役割が合います", relationship: "信頼できる支えのようなパートナー。言葉は不器用でも行動で示す人です" },
    '己': { direction: "ケア、教育、料理、HR等、人を育てて世話をする方向で幸せを感じます", relationship: "相手のために黙々と献身するパートナー。たまには自分を先に大切にしても良いですよ" },
    '庚': { direction: "法律、軍事、競争のあるビジネス、手術など決断が必要な場で真価を発揮します", relationship: "情が深く義理堅いパートナー。鋭い言葉の裏に温かい心が隠れています" },
    '辛': { direction: "宝石、ファッション、金融、技術職人、芸術など精密さと美的感覚が必要な場が合います", relationship: "真心を尽くして愛する純粋なパートナー。心の扉を開くまでに少し時間が必要です" },
    '壬': { direction: "旅行、貿易、哲学、メディア、自由業など広い世界と出会う方向が合います", relationship: "自由で開放的なパートナー。縛ろうとすると遠ざかりますが、信じれば必ず戻ってきます" },
    '癸': { direction: "心理、占術、芸術、研究、ヒーリングなど直感と感受性が資産になる場が合います", relationship: "言葉なしに相手を理解する深いパートナー。時には自分の感情も言葉で表現するとさらに良い" },
  },
};

// ============================================================
// INJECTION LOGIC
// ============================================================

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function getOrFallback(map, locale, fallback = 'en') {
  return map[locale] || map[fallback];
}

let updated = 0;
let errors = 0;

for (const locale of LOCALES) {
  if (locale === 'en') continue; // English already done manually

  const fortunePath = join(LOCALES_DIR, locale, 'fortune.json');
  const commonPath = join(LOCALES_DIR, locale, 'common.json');

  try {
    // === FORTUNE.JSON ===
    const fortune = readJson(fortunePath);

    // 1. personalDaily
    if (!fortune.personalDaily) {
      const pd = getOrFallback(personalDaily, locale);
      const msgs = getOrFallback(pdMessages, locale);
      fortune.personalDaily = { ...pd, ...msgs };
    }

    // 2. tarot.deep + labels
    if (fortune.tarot && !fortune.tarot.deep) {
      const deep = getOrFallback(tarotDeep, locale);
      fortune.tarot.deep = deep;
      const labels = getOrFallback(tarotLabels, locale);
      fortune.tarot.deepLabel = labels.deepLabel;
      fortune.tarot.flowLabel = labels.flowLabel;
      fortune.tarot.flowPastToFuture = labels.flowPastToFuture;
      fortune.tarot.flowSingle = labels.flowSingle;
    }

    // 3. signContext
    if (!fortune.signContext) {
      const elems = getOrFallback(signElements, locale);
      const traits = getOrFallback(signTraits, locale);
      const res = getOrFallback(resonanceDeep, locale);
      const title = signContextTitle[locale] || signContextTitle.en;

      fortune.signContext = {};
      for (const [sign, elemKey] of Object.entries(signMap)) {
        fortune.signContext[sign] = {
          element: elems[elemKey],
          trait: traits[sign]
        };
      }
      fortune.signContext.resonanceDeep = res;
      fortune.signContext.title = title;
    }

    // 4. elementDeep
    if (!fortune.elementDeep) {
      fortune.elementDeep = getOrFallback(elementDeep, locale);
    }

    // 5. rankGuide
    if (!fortune.rankGuide) {
      fortune.rankGuide = getOrFallback(rankGuide, locale);
    }

    // 6. dayMaster direction/relationship — read from English file as fallback
    if (fortune.dayMaster) {
      const extra = dayMasterExtra[locale];
      const enFortune = readJson(join(LOCALES_DIR, 'en', 'fortune.json'));
      for (const stem of Object.keys(fortune.dayMaster)) {
        if (!fortune.dayMaster[stem].direction) {
          if (extra && extra[stem]) {
            fortune.dayMaster[stem].direction = extra[stem].direction;
            fortune.dayMaster[stem].relationship = extra[stem].relationship;
          } else if (enFortune.dayMaster && enFortune.dayMaster[stem]) {
            fortune.dayMaster[stem].direction = enFortune.dayMaster[stem].direction;
            fortune.dayMaster[stem].relationship = enFortune.dayMaster[stem].relationship;
          }
        }
      }
    }

    writeJson(fortunePath, fortune);

    // === COMMON.JSON ===
    const common = readJson(commonPath);
    const ct = getOrFallback(commonTranslations, locale);

    if (!common.memo) common.memo = ct.memo;
    if (!common.weekly) common.weekly = ct.weekly;
    if (common.history && !common.history.today) {
      Object.assign(common.history, ct.historyExtra);
    }

    writeJson(commonPath, common);

    updated++;
    console.log(`✓ ${locale} updated`);
  } catch (e) {
    errors++;
    console.error(`✗ ${locale}: ${e.message}`);
  }
}

console.log(`\nDone: ${updated} locales updated, ${errors} errors`);
