export const EXPERTISE_OPTIONS = [
  'Lifestyle',
  'Beauty',
  'Fitness',
  'Finance',
  'Tech',
  'Entrepreneurship',
  'Education',
  'Motivation',
  'Dating',
  'Food',
  'Travel',
  'Music',
  'Gaming',
  'Comedy',
  'Others'
];

export const EXPERTISE_MAPPING = {
  'career & finance': 'Finance',
  'career and finance': 'Finance',
  'career': 'Finance',
  'finance': 'Finance',
  'health & fitness': 'Fitness',
  'health and fitness': 'Fitness',
  'health': 'Fitness',
  'fitness': 'Fitness',
  'tech & skills': 'Tech',
  'tech and skills': 'Tech',
  'tech': 'Tech',
  'fashion & lifestyle': 'Lifestyle',
  'fashion and lifestyle': 'Lifestyle',
  'fashion': 'Lifestyle',
  'lifestyle': 'Lifestyle',
  'life': 'Lifestyle',
  'lifestyel': 'Lifestyle',
  'entertainment': 'Comedy',
  'comedy': 'Comedy',
  'education': 'Education',
  'entrepreneurship': 'Entrepreneurship',
  'entreprenuership': 'Entrepreneurship',
  'relationships': 'Dating',
  'relationship': 'Dating',
  'dating': 'Dating',
  'spirituality': 'Motivation',
  'motivation': 'Motivation',
  'beauty': 'Beauty',
  'food': 'Food',
  'travel': 'Travel',
  'music': 'Music',
  'gaming': 'Gaming',
  'others': 'Others'
};

export const normalizeExpertiseItem = (item) => {
  if (!item || typeof item !== 'string') return item;
  const key = item.trim().toLowerCase();
  return EXPERTISE_MAPPING[key] || item.trim();
};

export const normalizeExpertiseList = (list) => {
  if (!Array.isArray(list)) return [];
  return Array.from(new Set(list.map(normalizeExpertiseItem).filter(Boolean)));
};
