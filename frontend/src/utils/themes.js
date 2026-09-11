import studioBg from '../assets/images/studio-bg.jpg';
import techBg from '../assets/images/tech-bg.png';

export const CHAT_THEMES = {
  default: {
    id: 'default',
    name: 'Default',
    emoji: '🎨',
    background: 'url("https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg")',
    backgroundColor: 'rgba(239, 234, 226, 0.85)',
    headerBackground: '#3BA8D8',
    headerColor: '#fff',
    senderBubble: '#dcf8c6',
    senderText: '#111',
    receiverBubble: '#fff',
    receiverText: '#111'
  },
  tech: {
    id: 'tech',
    name: 'Cyber Tech',
    emoji: '💻',
    background: `url(${techBg})`,
    backgroundColor: 'rgba(5, 10, 25, 0.95)',
    headerBackground: '#020617',
    headerColor: '#38bdf8',
    senderBubble: '#0ea5e9',
    senderText: '#fff',
    receiverBubble: '#0f172a',
    receiverText: '#bae6fd'
  },
  romance: {
    id: 'romance',
    name: 'Romance',
    emoji: '❤️',
    background: 'url("https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop")',
    backgroundColor: 'rgba(255, 230, 235, 0.8)',
    headerBackground: '#e63946',
    headerColor: '#fff',
    senderBubble: '#e63946',
    senderText: '#fff',
    receiverBubble: '#fff',
    receiverText: '#e63946'
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Water',
    emoji: '🌊',
    background: 'url("https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?q=80&w=1000&auto=format&fit=crop")',
    backgroundColor: 'rgba(230, 235, 235, 0.6)',
    headerBackground: '#5e9ca0',
    headerColor: '#ffffff',
    senderBubble: '#7db1b1',
    senderText: '#ffffff',
    receiverBubble: '#ffffff',
    receiverText: '#1f2937'
  },
  nature: {
    id: 'nature',
    name: 'Nature & Zen',
    emoji: '🌲',
    background: 'url("https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1000&auto=format&fit=crop")',
    backgroundColor: 'rgba(40, 60, 40, 0.85)',
    headerBackground: '#2d6a4f',
    headerColor: '#fff',
    senderBubble: '#40916c',
    senderText: '#fff',
    receiverBubble: '#d8f3dc',
    receiverText: '#081c15'
  },
  photography: {
    id: 'photography',
    name: 'Studio Pro',
    emoji: '📸',
    background: `url(${studioBg})`,
    backgroundPosition: 'center bottom',
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
    headerBackground: '#1a1a1a',
    headerColor: '#ffffff',
    senderBubble: '#c99b6d',
    senderText: '#1a1a1a',
    receiverBubble: '#ffffff',
    receiverText: '#1a1a1a'
  },
  business: {
    id: 'business',
    name: 'Entrepreneur',
    emoji: '🚀',
    background: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop")',
    backgroundColor: 'rgba(240, 244, 248, 0.9)',
    headerBackground: '#1e293b',
    headerColor: '#f8fafc',
    senderBubble: '#0f172a',
    senderText: '#e2e8f0',
    receiverBubble: '#fff',
    receiverText: '#0f172a'
  },
  rain: {
    id: 'rain',
    name: 'Rainy Night',
    emoji: '🌧️',
    background: 'url("https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1000&auto=format&fit=crop")',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    headerBackground: '#334155',
    headerColor: '#cbd5e1',
    senderBubble: '#475569',
    senderText: '#f8fafc',
    receiverBubble: '#1e293b',
    receiverText: '#94a3b8'
  },
  horror: {
    id: 'horror',
    name: 'Horror / Spooky',
    emoji: '👻',
    background: 'url("https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=1000&auto=format&fit=crop")',
    backgroundColor: 'rgba(5, 0, 0, 0.95)',
    headerBackground: '#2a0800',
    headerColor: '#ff0000',
    senderBubble: '#8a0303',
    senderText: '#fff',
    receiverBubble: '#1a1a1a',
    receiverText: '#ff4d4d'
  }
};
