import type { CategoryId } from './types';

export interface Category {
  id: CategoryId;
  name: string;
  blurb: string;
  /** Accent hue (OKLCH hue angle) used for the category's color. */
  hue: number;
  /** Inline SVG path(s) for a 24×24 stroke icon. */
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: 'math', name: 'Math', blurb: 'Percentages, algebra, geometry and more.', hue: 262, icon: '<path d="M5 12h14M12 5v14"/><path d="M5 5l4 4M9 5L5 9"/><circle cx="17" cy="17" r="2.5"/>' },
  { id: 'finance', name: 'Finance', blurb: 'Loans, interest, salary, tax and investing.', hue: 155, icon: '<path d="M12 3v18"/><path d="M17 7.5c0-1.9-2.2-3-5-3s-5 1.1-5 3 2.2 2.6 5 3.1 5 1.4 5 3.4-2.2 3.4-5 3.4-5-1.2-5-3.1"/>' },
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
