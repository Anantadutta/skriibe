export const mockCreator = {
  username: 'anantadutta',  // ← must match exactly
  displayName: 'Ananta Dutta',
  avatarInitial: 'T',
  pricePerQuestion: 99,
  isLive: true,
  weeklyEarnings: 890,
  replyRate: 94,
  bankLinked: false,
};

export const mockQuestions = [
  {
    id: '1',
    followerName: 'Amit Kumar',
    pricePaid: 99,
    questionText: 'I earn Rs.30,000/month. How do I build a 3-month emergency fund and start my first SIP?',
    askedAt: '2h ago',
    slaHoursLeft: 4,
    slaStatus: 'urgent',
  },
  {
    id: '2',
    followerName: 'Priya Shah',
    pricePaid: 99,
    questionText: 'Best mutual fund for Rs.5K monthly SIP for 10 years?',
    askedAt: '5h ago',
    slaHoursLeft: 19,
    slaStatus: 'ok',
  },
  {
    id: '3',
    followerName: 'Rohan M.',
    pricePaid: 99,
    questionText: 'NPS vs PPF for retirement corpus — which is better for a 28-year-old?',
    askedAt: '8h ago',
    slaHoursLeft: 16,
    slaStatus: 'ok',
  },
];
