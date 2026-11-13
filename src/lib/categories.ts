import type { CategoryId } from './types';

export interface Category {
  id: CategoryId;
  name: string;
  blurb: string;
  /** Accent hue (OKLCH hue angle) used for the category's color. */
  hue: number;
  /** Inline SVG path(s) for a 24×24 stroke icon. */
  icon: string;
  /** <title> override for the category page. */
  seoTitle?: string;
  /** <meta description> override for the category page. */
  metaDescription?: string;
  /** Show a pill nav of every calculator in this category on each calculator page (topic clusters). */
  cluster?: boolean;
  /** Short label for the cluster nav, e.g. "FIRE toolkit". */
  clusterLabel?: string;
  /** Slugs in the order the cluster nav should list them (others follow alphabetically). */
  clusterOrder?: string[];
  /** Guide content rendered on the category page (hub pages). */
  guide?: { heading: string; paragraphs: string[] }[];
  faq?: { q: string; a: string }[];
}

export const CATEGORIES: Category[] = [
  { id: 'math', name: 'Math', blurb: 'Percentages, algebra, geometry and more.', hue: 262, icon: '<path d="M5 12h14M12 5v14"/><path d="M5 5l4 4M9 5L5 9"/><circle cx="17" cy="17" r="2.5"/>' },
  { id: 'finance', name: 'Finance', blurb: 'Loans, interest, salary, tax and investing.', hue: 155, icon: '<path d="M12 3v18"/><path d="M17 7.5c0-1.9-2.2-3-5-3s-5 1.1-5 3 2.2 2.6 5 3.1 5 1.4 5 3.4-2.2 3.4-5 3.4-5-1.2-5-3.1"/>' },
  {
    id: 'fire',
    name: 'FIRE',
    blurb: 'Financial independence, Coast FIRE, safe withdrawal rates and more.',
    hue: 28,
    icon: '<path d="M12 21c-3.9 0-7-2.7-7-6.5 0-3.4 2.4-5.6 4-7.5.4 1.8 1.4 3 2.6 3.6C11.4 7 12.6 4.3 15 3c-.3 2.6.7 4.4 2 6 1.2 1.5 2 3.2 2 5.5 0 3.8-3.1 6.5-7 6.5z"/><path d="M12 21c-1.7 0-3-1.2-3-3 0-1.6 1.2-2.6 2-3.5.3 1 .9 1.6 1.6 1.9.4-.9 1-1.8 1.8-2.4.1 1.2.6 2.1 1 3 .3.6.6 1.2.6 1.9 0 1.3-1.3 2.1-3 2.1z"/>',
    seoTitle: 'FIRE Calculators: Plan Financial Independence',
    metaDescription: 'Free FIRE calculators: find your FIRE number, when you can retire early, Coast and Barista FIRE, safe withdrawal rates with Monte Carlo, and RSU-aware plans.',
    cluster: true,
    clusterLabel: 'FIRE toolkit',
    clusterOrder: ['fire-calculator', 'fire-number', 'years-to-fi', 'coast-fire', 'barista-fire', 'lean-fire', 'fat-fire', 'safe-withdrawal-rate', 'how-long-will-money-last', 'rsu-fire'],
    guide: [
      {
        heading: 'What is FIRE?',
        paragraphs: [
          'FIRE stands for Financial Independence, Retire Early. The idea is simple: save a large share of your income, invest it in low-cost diversified funds, and stop needing a paycheck once your investments can cover your spending indefinitely. "Retire early" is optional — many people reach financial independence and keep working on their own terms.',
          'The math rests on two numbers you control: how much you spend and how much you save. Spending sets the size of the portfolio you need (your FIRE number), and your savings rate sets how fast you get there. Investment returns matter too, but you cannot control them, which is why these calculators let you test pessimistic assumptions.',
        ],
      },
      {
        heading: 'Which FIRE calculator should I use?',
        paragraphs: [
          'Start with the FIRE calculator to see the age you could reach financial independence. Use the FIRE number calculator if you only need the target, and the years-to-FI calculator to see how your savings rate changes the timeline.',
          'If you would rather slow down than stop, Coast FIRE shows when you can stop saving and let compounding finish the job, and Barista FIRE shows how much portfolio you need if part-time work covers some of your spending. Lean FIRE and Fat FIRE help you plan around a minimalist or a generous budget.',
          'Before you quit, stress-test the plan with the safe withdrawal rate calculator, which runs thousands of simulated markets, and the how-long-will-my-money-last calculator. If much of your pay comes as RSUs, the RSU FIRE calculator shows how stock vests change your date.',
        ],
      },
      {
        heading: 'The types of FIRE at a glance',
        paragraphs: [
          'Lean FIRE: retiring on a modest budget, often under about $40,000 a year for a household. Smaller target, less margin for surprises.',
          'Regular FIRE: covering a typical middle-class lifestyle from investments, usually 25–30 times annual spending.',
          'Fat FIRE: a comfortable, high-spending retirement, commonly $100,000 a year or more, which usually means a multi-million-dollar portfolio and careful tax planning.',
          'Coast FIRE: you have saved enough that growth alone will reach your full target by a traditional retirement age, so you only need to earn your current spending.',
          'Barista FIRE: your portfolio covers part of your spending and part-time or lower-stress work covers the rest — often chosen for the health insurance a job provides.',
        ],
      },
    ],
    faq: [
      { q: 'How much do I need to retire early?', a: 'A common starting point is 25 times your yearly spending, which corresponds to a 4% withdrawal rate. Because early retirees may need their money for 40–60 years, many plan on 28–33 times spending (a 3–3.5% rate) for extra safety.' },
      { q: 'Is the 4% rule safe for early retirement?', a: 'The 4% rule was designed for 30-year retirements. Over 40–50 years, historical and simulated success rates fall, so early retirees often use 3.25–3.75% or plan to cut spending in bad markets. The safe withdrawal rate calculator lets you test this directly.' },
      { q: 'Are these calculators in today\'s dollars?', a: 'Yes. Every FIRE calculator here works in today\'s dollars by converting your return into a real (after-inflation) return, so your FIRE number keeps meaning the same lifestyle no matter how far away it is.' },
      { q: 'Do these calculators include taxes?', a: 'Enter after-tax spending and savings for the simplest result. The Fat FIRE calculator adds an effective tax rate on withdrawals, and the RSU FIRE calculator accounts for tax on vesting shares. For detailed tax planning, consult a tax professional.' },
    ],
  },
  { id: 'health', name: 'Health', blurb: 'BMI, calories, body fat, pregnancy and more.', hue: 15, icon: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>' },
  { id: 'statistics', name: 'Statistics', blurb: 'Mean, standard deviation, p-values and tests.', hue: 220, icon: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>' },
  { id: 'physics', name: 'Physics', blurb: 'Motion, energy, forces and electricity.', hue: 285, icon: '<circle cx="12" cy="12" r="1.8"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>' },
  { id: 'chemistry', name: 'Chemistry', blurb: 'Molarity, dilution, gas laws and pH.', hue: 195, icon: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 15h9"/>' },
  { id: 'construction', name: 'Construction', blurb: 'Concrete, flooring, paint, roofing and more.', hue: 55, icon: '<path d="M3 21h18M5 21V10l7-6 7 6v11"/><path d="M10 21v-6h4v6"/>' },
  { id: 'conversion', name: 'Conversion', blurb: 'Convert length, weight, temperature and more.', hue: 240, icon: '<path d="M7 7h12l-3-3M17 17H5l3 3"/>' },
  { id: 'everyday', name: 'Everyday life', blurb: 'Tips, age, dates, fuel and time.', hue: 35, icon: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2.5"/>' },
  { id: 'sports', name: 'Sports', blurb: 'Pace, heart rate zones, one-rep max.', hue: 130, icon: '<circle cx="12" cy="12" r="8"/><path d="M4.5 9.5c3 0 5.5 2.5 5.5 5.5M19.5 14.5c-3 0-5.5-2.5-5.5-5.5"/>' },
  { id: 'food', name: 'Food', blurb: 'Recipes, cooking conversions and portions.', hue: 70, icon: '<path d="M6 3v8a2 2 0 0 0 4 0V3M8 11v10M16 21V3c-2 1-3 4-3 7h3"/>' },
  { id: 'biology', name: 'Biology', blurb: 'Genetics, growth and lab calculations.', hue: 165, icon: '<path d="M7 3c0 6 10 6 10 12s-10 0-10 6M17 3c0 6-10 6-10 12s10 0 10 6"/><path d="M8 7h8M8 17h8"/>' },
  { id: 'ecology', name: 'Ecology', blurb: 'Carbon footprint, energy and resources.', hue: 140, icon: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19l8-8"/>' },
  { id: 'text', name: 'Text', blurb: 'Word count, case conversion, diff and more.', hue: 330, icon: '<path d="M4 7V5h16v2M12 5v14M9 19h6"/>' },
  { id: 'developer', name: 'Developer', blurb: 'JSON, Base64, hashes, JWT, timestamps.', hue: 205, icon: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>' },
  { id: 'other', name: 'Other', blurb: 'Grades, random numbers and more.', hue: 300, icon: '<circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>' },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>;
