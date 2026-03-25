// 和歌 (Waka) — 31-syllable poems as divine metaphors
// Each rank has associated waka that serve as the primary oracle message

export interface Waka {
  japanese: string;
  korean: string;
  meaning: string;
}

const wakaByRank: Record<string, Waka[]> = {
  daikichi: [
    { japanese: '春風に\n花の香りの\n満ちわたり\n天地の恵み\n限りなき日よ', korean: '봄바람에\n꽃향기가\n가득 퍼져\n천지의 은혜\n끝없는 날이여', meaning: '모든 것이 만개하는 시기입니다. 당신이 뿌린 씨앗이 드디어 꽃을 피웁니다.' },
    { japanese: '朝日さす\n峰の白雪\n溶けゆきて\n谷の小川の\n水かさ増すなり', korean: '아침 해 비추는\n봉우리의 흰 눈\n녹아 흘러\n골짜기 시냇물\n수량이 불어나네', meaning: '막혔던 것들이 풀리고 풍요가 흘러들어옵니다.' },
  ],
  kichi: [
    { japanese: '山路来て\n何やらゆかし\nすみれ草', korean: '산길을 걸어와\n왠지 모르게 그리운\n제비꽃이여', meaning: '지금 걷고 있는 길에서 소소한 기쁨을 발견합니다.' },
    { japanese: '風そよぐ\n若葉の影に\n身を寄せて\n心静かなる\n時を待つべし', korean: '바람에 흔들리는\n어린 잎 그늘에\n몸을 기대어\n마음 고요한\n때를 기다리라', meaning: '조급해하지 마세요. 좋은 때가 다가오고 있습니다.' },
  ],
  chukichi: [
    { japanese: '雲間より\nもるる光の\nほのかにて\n行く先遠き\n旅路なりけり', korean: '구름 사이로\n새어드는 빛이\n희미하여\n갈 길 먼\n여정이로구나', meaning: '아직 완전히 밝지는 않지만, 빛은 분명히 있습니다.' },
  ],
  shokichi: [
    { japanese: '秋の田の\n刈穂のいなば\n置く露の\nうちぬるるとも\n心安かれ', korean: '가을 논의\n벤 벼 이파리에\n맺힌 이슬처럼\n젖어들더라도\n마음은 편안하라', meaning: '작은 시련이 있더라도 마음의 평화를 잃지 마세요.' },
  ],
  suekichi: [
    { japanese: '冬枯れの\n野辺にも春の\n気配あり\n地の下深く\n根は生きており', korean: '겨울에 마른\n들판에도 봄의\n기운이 있으니\n땅 아래 깊이\n뿌리는 살아있다', meaning: '지금은 보이지 않지만, 당신의 노력은 땅 밑에서 자라고 있습니다.' },
  ],
  kyo: [
    { japanese: '霧深き\n道に迷いて\n立ち止まる\n風の声聞け\n道は示さん', korean: '안개 짙은\n길에서 헤매어\n멈춰 서니\n바람의 소리를 들으라\n길을 보여주리라', meaning: '혼란 속에서 멈추고 내면의 소리에 귀 기울이세요.' },
  ],
  daikyo: [
    { japanese: '嵐去り\n折れし枝にも\n新芽出づ\n闇の果てには\n必ず光あり', korean: '폭풍이 지나고\n꺾인 가지에도\n새싹이 돋으니\n어둠의 끝에는\n반드시 빛이 있다', meaning: '가장 깊은 어둠 뒤에 반드시 새벽이 옵니다. 지금 이 시련이 성장의 씨앗입니다.' },
  ],
};

export function getWaka(rankKey: string, seed: number): Waka {
  const pool = wakaByRank[rankKey] || wakaByRank['kichi'];
  return pool[seed % pool.length];
}
