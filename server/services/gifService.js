// High-grade, family-safe curated GIF library with category indexing
const GIF_CATALOG = [
  { id: 'g1', category: 'reactions', title: 'Mind Blown', url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif' },
  { id: 'g2', category: 'reactions', title: 'Popcorn Excited', url: 'https://media.giphy.com/media/GLbiGvv9RiNpPdzy5a/giphy.gif' },
  { id: 'g3', category: 'reactions', title: 'Thumbs Up Good Job', url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif' },
  { id: 'g4', category: 'reactions', title: 'High Five', url: 'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif' },
  { id: 'g5', category: 'memes', title: 'Cat Jamming Beat', url: 'https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif' },
  { id: 'g6', category: 'memes', title: 'Doge Wow', url: 'https://media.giphy.com/media/oBQZIgNobc7EWQDNg0/giphy.gif' },
  { id: 'g7', category: 'memes', title: 'This Is Fine Dog', url: 'https://media.giphy.com/media/9M5jK4GXmD5o1irGrF/giphy.gif' },
  { id: 'g8', category: 'gaming', title: 'GG Good Game', url: 'https://media.giphy.com/media/hpAISDrAk9LTURqhCu/giphy.gif' },
  { id: 'g9', category: 'gaming', title: 'Victory Dance', url: 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif' },
  { id: 'g10', category: 'anime', title: 'Anime Excited Sparkles', url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif' },
  { id: 'g11', category: 'anime', title: 'Anime Salute', url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif' },
  { id: 'g12', category: 'hype', title: 'Party Confetti Celebration', url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif' },
];

const STICKER_CATALOG = [
  { id: 's1', pack: 'Mascot', name: 'Crowd Wave', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=wave&radius=10' },
  { id: 's2', pack: 'Mascot', name: 'Crowd Heart', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=heart&radius=10' },
  { id: 's3', pack: 'Mascot', name: 'Crowd Cool', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=sunglasses&radius=10' },
  { id: 's4', pack: 'Pixel', name: 'Pixel Sword', url: 'https://api.dicebear.com/7.x/identicon/svg?seed=sword' },
  { id: 's5', pack: 'Pixel', name: 'Pixel Potion', url: 'https://api.dicebear.com/7.x/identicon/svg?seed=potion' },
  { id: 's6', pack: 'Cute', name: 'Star Sparkle', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=star' },
  { id: 's7', pack: 'Cute', name: 'Fire Flame', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=fire' },
];

function searchGifs(query = '', category = '') {
  let list = GIF_CATALOG;
  if (category) {
    list = list.filter(g => g.category.toLowerCase() === category.toLowerCase());
  }
  if (query) {
    const q = query.toLowerCase();
    list = list.filter(g => g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q));
  }
  return list;
}

function getStickers() {
  return STICKER_CATALOG;
}

module.exports = { searchGifs, getStickers };
