/**
 * Search titles, meta descriptions and hub-page guides for each category page.
 * Merged into CATEGORIES in categories.ts. The FIRE category defines its own inline.
 */
import type { Category } from './categories';

type Seo = Pick<Category, 'seoTitle' | 'metaDescription' | 'guide'>;

export const CATEGORY_SEO: Partial<Record<Category['id'], Seo>> = {
  finance: {
    seoTitle: 'Finance Calculators: Loans, Tax & Investing',
    metaDescription: 'Free finance calculators with charts: mortgage, auto loan, compound interest, take-home pay, income tax, retirement, ROI, refinance and more. No sign-up.',
    guide: [
      {
        heading: 'Money decisions, with the math shown',
        paragraphs: [
          'These calculators cover the questions people ask most about money: what a loan really costs, how much house you can afford, what you take home after tax, and how savings grow over time. Each one shows the result, a chart, and the formula behind it, so you can check the numbers yourself.',
          'Start with the mortgage, auto loan or loan calculator to see a full amortization schedule. Use compound interest, investment and savings goal to plan growth, and take-home pay, salary to hourly and income tax to understand your paycheck. For early retirement planning, see the FIRE toolkit.',
        ],
      },
    ],
  },
  math: {
    seoTitle: 'Math Calculators: Percentages, Algebra & More',
    metaDescription: 'Free math calculators with step-by-step working: percentage, fraction, quadratic, slope, Pythagorean theorem, logarithm, significant figures, area and volume.',
    guide: [
      {
        heading: 'Answers with the working shown',
        paragraphs: [
          'Every math calculator here shows its steps, not just the answer, so it works for checking homework as well as quick everyday sums. Results update as you type.',
          'The most used tools are percentage, percentage change, fraction and rounding for everyday arithmetic; quadratic, slope, exponent and logarithm for algebra; and area, volume, circle, triangle and Pythagorean theorem for geometry.',
        ],
      },
    ],
  },
  health: {
    seoTitle: 'Health Calculators: BMI, Calories & Body Fat',
    metaDescription: 'Free health and fitness calculators: BMI, TDEE, BMR, body fat, macros, protein, water intake, weight-loss goal, due date and ovulation. Private, no sign-up.',
    guide: [
      {
        heading: 'Body and nutrition numbers, explained',
        paragraphs: [
          'These calculators use the same published formulas clinicians and dietitians use, such as Mifflin-St Jeor for BMR and the US Navy method for body fat, and explain what each result means and where it falls short.',
          'For weight goals, start with TDEE to estimate daily calories, then macro and protein to split them. For pregnancy, the due date and ovulation calculators give the key dates. Everything runs in your browser, so nothing you enter is sent anywhere. Results are estimates, not medical advice.',
        ],
      },
    ],
  },
  statistics: {
    seoTitle: 'Statistics Calculators: P-Value & Z-Score',
    metaDescription: 'Free statistics calculators with charts: standard deviation, p-value, z-score, confidence interval, sample size, A/B tests and probability.',
    guide: [
      {
        heading: 'Statistics you can see',
        paragraphs: [
          'Each statistics calculator draws its distribution, so you can see where a z-score, p-value or confidence interval sits rather than only reading a number. The formulas and steps are shown for coursework and reports.',
          'Use mean, median and mode and standard deviation to describe data; z-score, p-value and normal distribution for hypothesis tests; confidence interval and sample size for survey planning; and the A/B test calculator to check whether a conversion difference is significant.',
        ],
      },
    ],
  },
  construction: {
    seoTitle: 'Construction Calculators: Concrete & Paint',
    metaDescription: 'Free construction and home project calculators: concrete, square footage, flooring, drywall, paint, roofing, gravel, mulch and board feet, with waste allowance.',
    guide: [
      {
        heading: 'Buy the right amount the first time',
        paragraphs: [
          'These calculators turn room and project dimensions into the materials to buy: bags or cubic yards of concrete, gallons of paint, boxes of flooring, sheets of drywall, squares of roofing and tons of gravel. Most include a waste allowance, since running short mid-job costs more than a little extra.',
          'Measure twice, and check product labels for coverage. Coverage and bag sizes vary by brand, so the calculators let you adjust them.',
        ],
      },
    ],
  },
  conversion: {
    seoTitle: 'Unit Converters: Length, Weight & Temperature',
    metaDescription: 'Free unit converters: length, weight, temperature, volume, area, speed, pressure, energy, time and data storage. Metric and imperial, every unit at once.',
    guide: [
      {
        heading: 'Every unit at once',
        paragraphs: [
          'Type a value once and see it in every common unit, metric and imperial together, instead of converting one pair at a time.',
          'The most used are length (inches, feet, centimetres, metres, miles), weight (pounds, kilograms, ounces, stone), temperature (Fahrenheit, Celsius, Kelvin) and volume (cups, litres, gallons).',
        ],
      },
    ],
  },
  everyday: {
    seoTitle: 'Everyday Calculators: Age, Dates & Tips',
    metaDescription: 'Free everyday calculators: age, date difference, add days to a date, tip and bill split, gas cost for a trip, electricity cost, hours worked and unit price.',
    guide: [
      {
        heading: 'Quick answers for daily life',
        paragraphs: [
          'Small questions come up every day: how many days until a date, how old someone is in years, months and days, how to split a bill, or what a road trip will cost in fuel. These calculators answer them in a second.',
          'The date tools handle leap years and can count business days. The unit price calculator compares package sizes to find the better deal.',
        ],
      },
    ],
  },
  sports: {
    seoTitle: 'Running Calculators: Pace, 1RM & HR Zones',
    metaDescription: 'Free running and training calculators: pace, race time predictor, heart rate zones and one-rep max. Plan race goals and training intensity with charts.',
    guide: [
      {
        heading: 'Train with numbers',
        paragraphs: [
          'Runners use the pace calculator to turn a goal time into a per-mile or per-kilometre pace, and the race time predictor to estimate a marathon from a recent 5K or 10K using the Riegel formula.',
          'Heart rate zones help keep easy runs easy and hard sessions hard. The one-rep max calculator estimates your 1RM from a lighter set, so you can set lifting percentages without testing a true max.',
        ],
      },
    ],
  },
  food: {
    seoTitle: 'Recipe Scaler & Cooking Converter',
    metaDescription: 'Free cooking calculators: scale any recipe up or down and convert cups, tablespoons, grams, ounces and millilitres, with ingredient-aware weight conversions.',
    guide: [
      {
        heading: 'Cook any recipe, any size',
        paragraphs: [
          'The recipe scaler multiplies every ingredient for a new number of servings and rounds to sensible kitchen measures. The cooking converter switches between cups, spoons, millilitres and grams.',
          'Converting volume to weight depends on the ingredient: a cup of flour weighs far less than a cup of sugar. For baking, weighing is more accurate than measuring cups.',
        ],
      },
    ],
  },
  text: {
    seoTitle: 'Text Tools: Word Counter, Case & Diff',
    metaDescription: 'Free online text tools: word and character counter, case converter, text diff, find and replace, dedupe and sort lines, slugs and lorem ipsum.',
    guide: [
      {
        heading: 'Text tools that stay on your device',
        paragraphs: [
          'Paste text and get results instantly: word, character and reading-time counts, case changes, differences between two versions, and cleanup like sorting lines or removing duplicates.',
          'Everything runs in your browser. Your text is never uploaded, which makes these safe for drafts, emails and private documents.',
        ],
      },
    ],
  },
  developer: {
    seoTitle: 'Developer Tools: JSON, Base64, JWT & Hash',
    metaDescription: 'Free developer tools that run in your browser: JSON formatter, Base64, JWT decoder, hash generator, UUID, Unix timestamp, regex tester, URL encoder and cron.',
    guide: [
      {
        heading: 'Developer utilities, private by default',
        paragraphs: [
          'Format and validate JSON, decode JWTs, generate hashes and UUIDs, convert Unix timestamps, test regular expressions and explain cron schedules, all without a server round trip.',
          'Because nothing leaves your browser, you can paste tokens and payloads without sending them to a third party. Still, treat production secrets with care on any machine.',
        ],
      },
    ],
  },
  other: {
    seoTitle: 'Grade Calculators: GPA, Final & Test Grade',
    metaDescription: 'Free school calculators: GPA, final exam grade needed, weighted grade and test score percentage, plus a random number generator. Instant, no sign-up.',
    guide: [
      {
        heading: 'Grades and more',
        paragraphs: [
          'Find out what you need on the final to reach a target grade, work out a weighted course grade from assignments and exams, turn a test score into a percentage and letter grade, or calculate your GPA.',
          'The random number generator picks fair numbers in any range, with or without repeats, for draws, games and sampling.',
        ],
      },
    ],
  },
};
