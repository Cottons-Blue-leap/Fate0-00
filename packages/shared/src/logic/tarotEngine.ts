import type { TarotCard, TarotReading } from '../types/fortune';
import { majorArcana } from '../data/tarot';

function shuffleDeck(): TarotCard[] {
  const deck = [...majorArcana];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function drawCards(count: 1 | 3): Array<{ card: TarotCard; isReversed: boolean; position: string }> {
  const deck = shuffleDeck();
  const positions = count === 1 ? ['현재'] : ['과거', '현재', '미래'];
  return deck.slice(0, count).map((card, i) => ({
    card,
    isReversed: Math.random() < 0.3,
    position: positions[i],
  }));
}

function generateSummary(cards: Array<{ card: TarotCard; isReversed: boolean; position: string }>): string {
  if (cards.length === 1) {
    const { card, isReversed } = cards[0];
    return `${card.nameKo} 카드가 나왔습니다. ${isReversed ? '역방향으로, ' + card.reversed : card.upright}`;
  }
  const themes = cards.map(c => c.card.keywords[0]).join(', ');
  return `과거-현재-미래를 관통하는 키워드는 "${themes}"입니다. 흐름을 읽고 지혜롭게 대처하세요.`;
}

export function getReading(spread: '1-card' | '3-card'): TarotReading {
  const count = spread === '1-card' ? 1 : 3;
  const cards = drawCards(count as 1 | 3);
  return {
    spread,
    cards,
    summary: generateSummary(cards),
  };
}
