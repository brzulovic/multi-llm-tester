export interface PromptPreset {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
}

export const COMMON_TEST_PROMPTS: PromptPreset[] = [
  {
    id: 'car-wash',
    title: 'Car Wash Test',
    subtitle: 'Should you walk or drive?',
    prompt: 'If you are going to a car wash, should you walk or drive?'
  },
  {
    id: '9-9-vs-9-11',
    title: '9.9 vs 9.11',
    subtitle: 'Which one is larger?',
    prompt: 'Which one is larger: 9.9 or 9.11? Explain your reasoning.'
  },
  {
    id: 'strawberry',
    title: 'Strawberry Test',
    subtitle: 'How many r’s are in the word',
    prompt: "How many 'r's are in the word 'strawberry'?"
  },
  {
    id: 'poem-riddle',
    title: 'Poem Riddle',
    subtitle: 'Compose a 12-line poem',
    prompt: 'Compose a 12-line poem about an elusive time traveler.'
  },
  {
    id: 'personal-finance',
    title: 'Personal Finance',
    subtitle: 'Draft up a portfolio management proposal',
    prompt: 'Draft up a portfolio management proposal for a moderately risk-tolerant client with a 15-year horizon.'
  },
  {
    id: 'anagram-challenge',
    title: 'Anagram Challenge',
    subtitle: 'Unscramble letters to form a word.',
    prompt: "Unscramble the letters 'L-I-S-T-E-N' to form all valid English words."
  },
  {
    id: 'missing-dollar',
    title: 'The Missing Dollar',
    subtitle: 'A classic logic puzzle involving money.',
    prompt: 'Three guests check into a hotel room that costs $30 ($10 each). The manager realizes the room was only $25 and gives $5 to the bellboy to return. The bellboy pockets $2 and gives each guest $1 back. Now each guest paid $9 (total $27) and the bellboy has $2 (total $29). Where is the missing dollar?'
  },
  {
    id: 'word-transformation',
    title: 'Word Transformation',
    subtitle: 'Change one word into another by altering one letter at a time.',
    prompt: "Change one word into another by altering one letter at a time: transform 'COLD' into 'WARM', where every intermediate step is a valid word."
  },
  {
    id: 'palindrome-quest',
    title: 'Palindrome Quest',
    subtitle: 'Find the smallest palindrome greater than a given number.',
    prompt: 'Find the smallest palindrome greater than 88988. Explain the mathematical step-by-step logic.'
  },
  {
    id: 'alphabet-series',
    title: 'Alphabet Series',
    subtitle: 'Identify the next letter in a sequence.',
    prompt: 'Identify the next letter in the sequence: A, C, F, J, O, ... Explain the rule and pattern.'
  },
  {
    id: 'career-development',
    title: 'Career Development',
    subtitle: 'Create a professional growth roadmap.',
    prompt: 'Create a 3-year professional growth roadmap for an engineer transitioning into technical leadership.'
  },
  {
    id: 'healthy-lifestyle',
    title: 'Healthy Lifestyle',
    subtitle: 'Design a balanced diet and exercise regimen.',
    prompt: 'Design a balanced diet and exercise regimen for a desk worker aiming to improve posture, energy, and cardiovascular fitness.'
  },
  {
    id: 'small-business-strategy',
    title: 'Small Business Strategy',
    subtitle: 'Develop a business expansion plan.',
    prompt: 'Develop a 12-month business expansion plan for a local artisan coffee roastery expanding into direct-to-consumer e-commerce.'
  },
  {
    id: 'educational-advancement',
    title: 'Educational Advancement',
    subtitle: 'Plan for higher education.',
    prompt: 'Plan for higher education: create a structured roadmap for an undergraduate preparing to apply for competitive master’s programs in Artificial Intelligence.'
  }
];
