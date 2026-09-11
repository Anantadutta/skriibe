import React from 'react';

/**
 * Returns an SVG icon corresponding to the creator's expertise category.
 * If the category is 'Others', set via 'Others', or not recognized, returns null (no icon).
 */
export const getExpertiseIcon = (exp, size = 12) => {
  if (!exp || typeof exp !== 'string') return null;
  const eLower = exp.trim().toLowerCase();

  // If user selected Others or it's a custom expertise from Others, no icon is shown
  if (eLower === 'others' || eLower === 'other') return null;

  // Comedy -> Joker / Jester Hat with bells
  if (eLower.includes('comedy') || eLower.includes('joker') || eLower.includes('joke')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 18c4.5-1.5 13.5-1.5 18 0" />
        <path d="M6 17C4 11 1.5 9 2 6c2 0 3.5 2.5 4.5 7" />
        <circle cx="2.2" cy="5.5" r="1.5" fill="currentColor" />
        <path d="M9.5 13.5 12 4.5l2.5 9" />
        <circle cx="12" cy="4" r="1.5" fill="currentColor" />
        <path d="M18 17c2-6 4.5-8 4-11-2 0-3.5 2.5-4.5 7" />
        <circle cx="21.8" cy="5.5" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  // Lifestyle -> Dress
  if (eLower.includes('lifestyle')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 3h1.5a3 3 0 0 0 5 0H16l2 4-2.5 4h-7L6 7l2-4z" />
        <path d="M8.5 11 5 21c4.5 1.5 9.5 1.5 14 0l-3.5-10" />
        <line x1="8.5" y1="11" x2="15.5" y2="11" />
      </svg>
    );
  }

  // Finance & Entrepreneurship -> Money (Banknote)
  if (
    eLower.includes('finance') ||
    eLower.includes('money') ||
    eLower.includes('entrepreneur') ||
    eLower.includes('netreneur') ||
    eLower.includes('startup')
  ) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="12" x="2" y="6" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    );
  }

  // Tech -> Computer
  if (
    eLower.includes('tech') ||
    eLower.includes('computer') ||
    eLower.includes('code') ||
    eLower.includes('software')
  ) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="12" x="3" y="4" rx="2" />
        <line x1="9" x2="15" y1="20" y2="20" />
        <line x1="12" x2="12" y1="16" y2="20" />
      </svg>
    );
  }

  // Education -> Books
  if (
    eLower.includes('education') ||
    eLower.includes('book') ||
    eLower.includes('study') ||
    eLower.includes('learn')
  ) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    );
  }

  // Motivation -> Fist
  if (
    eLower.includes('motivation') ||
    eLower.includes('fist') ||
    eLower.includes('spirituality')
  ) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 10.5V7a1.5 1.5 0 0 0-3 0v1.5" />
        <path d="M16 7V5.5a1.5 1.5 0 0 0-3 0V8" />
        <path d="M13 6V4.5a1.5 1.5 0 0 0-3 0V9" />
        <path d="M10 7.5V6a1.5 1.5 0 0 0-3 0v5.5" />
        <path d="M7 11.5a2.5 2.5 0 0 0-2.5 2.5v1a7 7 0 0 0 7 7h1a7 7 0 0 0 7-7v-4.5" />
        <path d="M4.5 14h5a1.5 1.5 0 0 1 1.5 1.5v0" />
      </svg>
    );
  }

  // Fitness / Health -> Dumbbell
  if (eLower.includes('fitness') || eLower.includes('health') || eLower.includes('gym')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="6" y1="5" x2="6" y2="19" />
        <line x1="18" y1="5" x2="18" y2="19" />
        <line x1="6" y1="12" x2="18" y2="12" />
        <line x1="2" y1="9" x2="2" y2="15" />
        <line x1="22" y1="9" x2="22" y2="15" />
      </svg>
    );
  }

  // Beauty / Fashion -> Sparkles
  if (eLower.includes('beauty') || eLower.includes('fashion')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
      </svg>
    );
  }

  // Dating -> Heart
  if (eLower.includes('dating') || eLower.includes('relationship')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    );
  }

  // Food -> Utensils
  if (eLower.includes('food') || eLower.includes('cooking')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
        <path d="M15 2v19" />
        <path d="M5 2v10a3 3 0 0 0 3 3v6" />
        <path d="M8 2v5" />
      </svg>
    );
  }

  // Travel -> Plane
  if (eLower.includes('travel')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
      </svg>
    );
  }

  // Music -> Note
  if (eLower.includes('music')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    );
  }

  // Gaming -> Gamepad
  if (eLower.includes('gaming') || eLower.includes('game')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="6" x2="10" y1="12" y2="12" />
        <line x1="8" x2="8" y1="10" y2="14" />
        <line x1="15" x2="15.01" y1="13" y2="13" />
        <line x1="18" x2="18.01" y1="11" y2="11" />
        <rect width="20" height="12" x="2" y="6" rx="6" />
      </svg>
    );
  }

  // All other categories, custom categories entered via 'Others', or unidentified -> No icon
  return null;
};
