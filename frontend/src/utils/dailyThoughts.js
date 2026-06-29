export const dailyThoughts = [
  "SIPs confusing you again? Ask an expert today.",
  "Resume not getting callbacks? Ask for honest feedback.",
  "Starting your diet tomorrow? Maybe ask for a realistic plan today ☕",
  "Startup idea stuck? Get feedback before you build.",
  "LinkedIn profile looking weak? Ask how to improve it.",
  "Still thinking about that business idea? Ask now 👀",
  "Mutual funds confusing? Ask in simple language today.",
  "Out of content ideas? Ask what to post next.",
  "Thinking of switching careers? Ask before you decide.",
  "Skin acting up? Ask for a simple routine that works.",
  "Salary disappears too fast? Ask for money clarity.",
  "Something personal on your mind? Ask without overthinking.",
  "Still confused about SIPs? Let's fix that today.",
  "Wardrobe crisis again? Ask for styling help today.",
  "Views dropped? Ask what’s hurting your content growth.",
  "Study plan failing again? Ask for a better one.",
  "Belly fat being stubborn? Ask what actually works.",
  "Thinking of quitting your job? Ask before you act.",
  "Life feeling chaotic lately? Ask for some clarity.",
  "Want brutally honest startup feedback? Ask today.",
  "Mixed signals? Confused by someone? Ask privately.",
  "Sleep schedule broken? Ask how to fix it realistically.",
  "Want to upskill but confused where to start? Ask today.",
  "Money disappears too fast? Ask how to manage it better.",
  "No reel ideas left? Ask what to create next.",
  "Manifesting but feeling stuck? Ask for some clarity.",
  "Want to grow faster as a creator? Ask for practical tips.",
  "Confused about studying abroad? Ask before deciding.",
  "Feeling stuck or messy lately? Ask for some perspective.",
  "Got something you can’t ask publicly? Ask privately here."
];

export const getThoughtOfTheDay = () => {
  // IST offset in milliseconds (5 hours and 30 minutes)
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  
  // Current time shifted to IST timezone
  const nowIST = Date.now() + IST_OFFSET_MS;
  
  // Total days since Unix epoch in IST
  const currentDayNumber = Math.floor(nowIST / (1000 * 60 * 60 * 24));
  
  // 20633 is the IST day number for June 29, 2026.
  // We subtract it so that June 29, 2026 equals index 0 (the 1st thought).
  // Math.max(0, ...) ensures we don't get negative indices if tested before this date.
  const daysPassed = Math.max(0, currentDayNumber - 20633);
  
  const index = daysPassed % dailyThoughts.length;
  return dailyThoughts[index];
};
