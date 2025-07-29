"use client"

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/components/AuthProvider";

// Grouped and searchable presets
const identityPresetCategories = [
  {
    category: 'Arts',
    icon: '🎨',
    roles: [
      { label: 'Writer', value: 'writer',
        description: 'Express yourself through words.',
        habits: [
          'Write 100 words daily', 'Read 10 pages', 'Journal for 5 minutes',
        ] },
      { label: 'Artist', value: 'artist',
        description: 'Create visual art and explore creativity.',
        habits: [
          'Draw for 20 minutes', 'Visit a gallery', 'Practice a new technique',
        ] },
      { label: 'Musician', value: 'musician',
        description: 'Make music and develop your skills.',
        habits: [
          'Practice instrument 30 min', 'Listen to new music', 'Record a short piece',
        ] },
      { label: 'Dancer', value: 'dancer',
        description: 'Move your body and express yourself through dance.',
        habits: [
          'Practice a routine', 'Stretch 10 minutes', 'Watch a dance video',
        ] },
      { label: 'Poet', value: 'poet',
        description: 'Express your thoughts and emotions through poetry.',
        habits: [
          'Write a poem', 'Read poetry', 'Share a verse',
        ] },
      { label: 'Photographer', value: 'photographer',
        description: 'Capture moments and tell stories through your lens.',
        habits: [
          'Take a new photo', 'Edit a picture', 'Study a famous photo',
        ] },
      { label: 'Designer', value: 'designer',
        description: 'Create beautiful and functional designs.',
        habits: [
          'Sketch a concept', 'Review design trends', 'Organize your portfolio',
        ] },
      { label: 'Blogger', value: 'blogger',
        description: 'Share your thoughts and experiences through writing.',
        habits: [
          'Write a blog post', 'Edit a draft', 'Share your blog',
        ] },
      { label: 'YouTuber', value: 'youtuber',
        description: 'Create and share engaging video content.',
        habits: [
          'Film a video', 'Edit your footage', 'Reply to comments',
        ] },
      { label: 'Podcaster', value: 'podcaster',
        description: 'Tell stories and share your knowledge through audio.',
        habits: [
          'Record an episode', 'Edit audio', 'Plan next topic',
        ] },
      { label: 'Streamer', value: 'streamer',
        description: 'Connect with your audience and share your passion.',
        habits: [
          'Stream for 1 hour', 'Engage with chat', 'Review your stream',
        ] },
      { label: 'Influencer', value: 'influencer',
        description: 'Build a community and share your experiences.',
        habits: [
          'Post on social media', 'Engage with followers', 'Plan content',
        ] },
      { label: 'Fashionista', value: 'fashionista',
        description: 'Stay updated with the latest fashion trends.',
        habits: [
          'Plan an outfit', 'Read a fashion mag', 'Share a style tip',
        ] },
      { label: 'Crafter', value: 'crafter',
        description: 'Create handmade items and express your creativity.',
        habits: [
          'Work on a craft', 'Try a new material', 'Share your craft',
        ] },
      { label: 'Knitter', value: 'knitter',
        description: 'Create warm and cozy items with your hands.',
        habits: [
          'Knit a row', 'Try a new pattern', 'Share your knitting',
        ] },
      { label: 'Quilter', value: 'quilter',
        description: 'Create beautiful quilts and spread joy.',
        habits: [
          'Sew a quilt block', 'Plan a quilt', 'Share your quilt',
        ] },
      { label: 'Sewer', value: 'sewer',
        description: 'Make repairs and create beautiful items.',
        habits: [
          'Sew a seam', 'Try a new stitch', 'Share your sewing',
        ] },
      { label: 'Woodworker', value: 'woodworker',
        description: 'Transform wood into functional and beautiful pieces.',
        habits: [
          'Work on a project', 'Sharpen your tools', 'Share your work',
        ] },
      { label: 'Metalworker', value: 'metalworker',
        description: 'Work with metal and create unique items.',
        habits: [
          'Work on a project', 'Polish your tools', 'Share your work',
        ] },
      { label: 'Maker', value: 'maker',
        description: 'Create something new and learn new skills.',
        habits: [
          'Create something', 'Share your work', 'Learn a new technique',
        ] },
      { label: 'Tinkerer', value: 'tinkerer',
        description: 'Fix things and explore the world of tools.',
        habits: [
          'Fix something', 'Try a new tool', 'Document your process',
        ] },
      { label: 'DIYer', value: 'diy',
        description: 'Do it yourself and create your own solutions.',
        habits: [
          'Start a DIY project', 'Watch a tutorial', 'Share your results',
        ] },
    ],
  },
  {
    category: 'Sports & Fitness',
    icon: '⚽️',
    roles: [
      { label: 'Runner', value: 'runner',
        description: 'Improve your endurance and stamina.',
        habits: [
          'Run 1 mile', 'Stretch for 10 minutes', 'Drink 2L of water',
        ] },
      { label: 'Athlete', value: 'athlete',
        description: 'Train hard and achieve your athletic goals.',
        habits: [
          'Train for 1 hour', 'Track your nutrition', 'Review your performance',
        ] },
      { label: 'Yogi', value: 'yogi',
        description: 'Practice yoga and find inner peace.',
        habits: [
          'Do 20 min yoga', 'Practice deep breathing', 'Reflect on gratitude',
        ] },
      { label: 'Cyclist', value: 'cyclist',
        description: 'Explore the world on two wheels.',
        habits: [
          'Bike 5 miles', 'Check your bike', 'Plan a cycling route',
        ] },
      { label: 'Swimmer', value: 'swimmer',
        description: 'Improve your swimming technique and endurance.',
        habits: [
          'Swim 20 laps', 'Practice breathing', 'Track your swim',
        ] },
      { label: 'Skater', value: 'skater',
        description: 'Practice tricks and skateboarding.',
        habits: [
          'Practice a trick', 'Watch a skate video', 'Clean your board',
        ] },
      { label: 'Lifter', value: 'lifter',
        description: 'Build strength and improve your physique.',
        habits: [
          'Lift weights', 'Track your sets', 'Stretch after lifting',
        ] },
      { label: 'Boxer', value: 'boxer',
        description: 'Train for combat and improve your fighting skills.',
        habits: [
          'Shadowbox 10 min', 'Jump rope', 'Review your form',
        ] },
      { label: 'Martial Artist', value: 'martial artist',
        description: 'Practice martial arts and develop self-defense.',
        habits: [
          'Practice a kata', 'Stretch 10 min', 'Watch a match',
        ] },
      { label: 'Chess Player', value: 'chess',
        description: 'Challenge your mind and improve your strategic thinking.',
        habits: [
          'Solve a chess puzzle', 'Play a game', 'Review a match',
        ] },
      { label: 'Gamer', value: 'gamer',
        description: 'Play video games and connect with friends.',
        habits: [
          'Play a new game', 'Review your gameplay', 'Connect with friends',
        ] },
      { label: 'Hiker', value: 'hiker',
        description: 'Explore nature and challenge your physical limits.',
        habits: [
          'Go for a hike', 'Plan a trail', 'Share a hiking photo',
        ] },
      { label: 'Camper', value: 'camper',
        description: 'Experience the outdoors and enjoy nature.',
        habits: [
          'Plan a camping trip', 'Check your gear', 'Share a camping tip',
        ] },
      { label: 'Survivalist', value: 'survivalist',
        description: 'Learn survival skills and be prepared for emergencies.',
        habits: [
          'Practice a skill', 'Check your kit', 'Read a survival tip',
        ] },
      { label: 'Prepper', value: 'prepper',
        description: 'Plan for potential emergencies and be ready.',
        habits: [
          'Check your supplies', 'Plan for emergencies', 'Share a prep tip',
        ] },
      { label: 'Adventurer', value: 'adventurer',
        description: 'Try new experiences and push your boundaries.',
        habits: [
          'Try something new', 'Plan an outing', 'Share a story',
        ] },
      { label: 'Explorer', value: 'explorer',
        description: 'Discover new places and learn new things.',
        habits: [
          'Explore a new place', 'Learn a new fact', 'Document your journey',
        ] },
      { label: 'Builder', value: 'builder',
        description: 'Work on projects and learn new skills.',
        habits: [
          'Work on a project', 'Learn a new tool', 'Reflect on progress',
        ] },
      { label: 'Fixer', value: 'fixer',
        description: 'Help others and learn new ways to solve problems.',
        habits: [
          'Repair something', 'Learn a new fix', 'Help someone solve a problem',
        ] },
      { label: 'Healer', value: 'healer',
        description: 'Practice self-care and help others heal.',
        habits: [
          'Practice self-care', 'Help someone heal', 'Read about healing',
        ] },
      { label: 'Caretaker', value: 'caretaker',
        description: 'Check in on others and offer support.',
        habits: [
          'Check in on someone', 'Prepare a meal', 'Offer support',
        ] },
    ],
  },
  {
    category: 'Tech & Learning',
    icon: '💻',
    roles: [
      { label: 'Coder', value: 'coder',
        description: 'Write code and develop your programming skills.',
        habits: [
          'Write code for 1 hour', 'Read tech articles', 'Refactor old code',
        ] },
      { label: 'Engineer', value: 'engineer',
        description: 'Solve problems and design innovative solutions.',
        habits: [
          'Solve a problem', 'Sketch a design', 'Read tech news',
        ] },
      { label: 'Scientist', value: 'scientist',
        description: 'Conduct research and discover new knowledge.',
        habits: [
          'Read a research paper', 'Record an observation', 'Plan an experiment',
        ] },
      { label: 'Student', value: 'student',
        description: 'Learn new concepts and achieve academic goals.',
        habits: [
          'Review class notes', 'Study for 30 minutes', 'Ask a question in class',
        ] },
      { label: 'Lifelong Learner', value: 'learner',
        description: 'Continuously learn and develop new skills.',
        habits: [
          'Take an online course', 'Read a new article', 'Practice a new skill',
        ] },
      { label: 'Historian', value: 'historian',
        description: 'Explore history and document stories.',
        habits: [
          'Read a history article', 'Visit a museum', 'Document a story',
        ] },
      { label: 'Journalist', value: 'journalist',
        description: 'Research topics and write news articles.',
        habits: [
          'Research a topic', 'Write a news brief', 'Interview someone',
        ] },
      { label: 'Teacher', value: 'teacher',
        description: 'Plan lessons and educate others.',
        habits: [
          'Plan a lesson', 'Grade assignments', 'Connect with a student',
        ] },
      { label: 'Mentor', value: 'mentor',
        description: 'Guide and support others in their learning journey.',
        habits: [
          'Check in with a mentee', 'Share advice', 'Reflect on mentoring',
        ] },
      { label: 'Philosopher', value: 'philosopher',
        description: 'Reflect on life, philosophy, and questions.',
        habits: [
          'Read a philosophy quote', 'Reflect on a question', 'Write your thoughts',
        ] },
      { label: 'Planner', value: 'planner',
        description: 'Organize your time and goals.',
        habits: [
          'Review your calendar', 'Set priorities', 'Reflect on progress',
        ] },
      { label: 'Organizer', value: 'organizer',
        description: 'Plan your day and stay organized.',
        habits: [
          'Plan your day', 'Organize your desk', 'Set a weekly goal',
        ] },
      { label: 'Dreamer', value: 'dreamer',
        description: 'Visualize your goals and aspirations.',
        habits: [
          'Visualize your goals', 'Write a dream journal', 'Share an idea',
        ] },
      { label: 'Realist', value: 'realist',
        description: 'Review your plans and adjust expectations.',
        habits: [
          'Review your plans', 'Check your progress', 'Adjust expectations',
        ] },
      { label: 'Optimist', value: 'optimist',
        description: 'Focus on the positive and encourage others.',
        habits: [
          'List 3 positives', 'Smile at someone', 'Share encouragement',
        ] },
      { label: 'Reader', value: 'reader',
        description: 'Read and expand your knowledge.',
        habits: [
          'Read 20 pages', 'Summarize what you read', 'Share a book recommendation',
        ] },
      { label: 'Speaker', value: 'speaker',
        description: 'Practice public speaking and improve your communication.',
        habits: [
          'Practice a speech', 'Record yourself', 'Watch a TED talk',
        ] },
      { label: 'Listener', value: 'listener',
        description: 'Practice active listening and ask thoughtful questions.',
        habits: [
          'Practice active listening', 'Reflect on a conversation', 'Ask a thoughtful question',
        ] },
      { label: 'Negotiator', value: 'negotiator',
        description: 'Review negotiations and practice assertiveness.',
        habits: [
          'Review a negotiation', 'Read a negotiation tip', 'Practice assertiveness',
        ] },
      { label: 'Mediator', value: 'mediator',
        description: 'Reflect on conflicts and practice empathy.',
        habits: [
          'Reflect on a conflict', 'Practice empathy', 'Read about mediation',
        ] },
    ],
  },
  {
    category: 'Wellness & Mindfulness',
    icon: '🧘',
    roles: [
      { label: 'Meditator', value: 'meditator',
        description: 'Practice meditation and mindfulness.',
        habits: [
          'Meditate 10 minutes', 'Journal your thoughts', 'Practice mindful breathing',
        ] },
      { label: 'Minimalist', value: 'minimalist',
        description: 'Declutter and simplify your life.',
        habits: [
          'Declutter one item', 'Reflect on needs', 'Organize a space',
        ] },
      { label: 'Spiritual Seeker', value: 'spiritual',
        description: 'Explore spirituality and find your purpose.',
        habits: [
          'Read a spiritual text', 'Meditate 10 min', 'Reflect on purpose',
        ] },
      { label: 'Environmentalist', value: 'environmentalist',
        description: 'Care for the environment and promote sustainability.',
        habits: [
          'Recycle today', 'Pick up litter', 'Share a green tip',
        ] },
      { label: 'Philanthropist', value: 'philanthropist',
        description: 'Donate to causes and promote kindness.',
        habits: [
          'Donate to a cause', 'Volunteer 30 min', 'Share a kindness',
        ] },
      { label: 'Volunteer', value: 'volunteer',
        description: 'Help others and give back to your community.',
        habits: [
          'Sign up for an event', 'Help a neighbor', 'Reflect on giving',
        ] },
      { label: 'Caretaker', value: 'caretaker',
        description: 'Check in on others and offer support.',
        habits: [
          'Check in on someone', 'Prepare a meal', 'Offer support',
        ] },
      { label: 'Healer', value: 'healer',
        description: 'Practice self-care and help others heal.',
        habits: [
          'Practice self-care', 'Help someone heal', 'Read about healing',
        ] },
      { label: 'Listener', value: 'listener',
        description: 'Practice active listening and ask thoughtful questions.',
        habits: [
          'Practice active listening', 'Reflect on a conversation', 'Ask a thoughtful question',
        ] },
      { label: 'Dreamer', value: 'dreamer',
        description: 'Visualize your goals and aspirations.',
        habits: [
          'Visualize your goals', 'Write a dream journal', 'Share an idea',
        ] },
      { label: 'Optimist', value: 'optimist',
        description: 'Focus on the positive and encourage others.',
        habits: [
          'List 3 positives', 'Smile at someone', 'Share encouragement',
        ] },
      { label: 'Realist', value: 'realist',
        description: 'Review your plans and adjust expectations.',
        habits: [
          'Review your plans', 'Check your progress', 'Adjust expectations',
        ] },
    ],
  },
  {
    category: 'Family & Relationships',
    icon: '👪',
    roles: [
      { label: 'Parent', value: 'parent',
        description: 'Spend time with your family and nurture relationships.',
        habits: [
          'Read with your child', 'Plan a family activity', 'Reflect on parenting wins',
        ] },
      { label: 'Grandparent', value: 'grandparent',
        description: 'Connect with your grandchildren and share stories.',
        habits: [
          'Call your grandchild', 'Share a story', 'Plan a visit',
        ] },
      { label: 'Sibling', value: 'sibling',
        description: 'Stay connected with your siblings and plan activities.',
        habits: [
          'Call your sibling', 'Share a memory', 'Plan a sibling activity',
        ] },
      { label: 'Friend', value: 'friend',
        description: 'Check in with your friends and plan get-togethers.',
        habits: [
          'Check in with a friend', 'Plan a get-together', 'Send a kind message',
        ] },
      { label: 'Partner', value: 'partner',
        description: 'Plan dates and share appreciation with your partner.',
        habits: [
          'Plan a date', 'Share appreciation', 'Reflect on your relationship',
        ] },
      { label: 'Spouse', value: 'spouse',
        description: 'Plan special moments and express gratitude.',
        habits: [
          'Plan a special moment', 'Express gratitude', 'Reflect on your marriage',
        ] },
      { label: 'Pet Owner', value: 'pet owner',
        description: 'Spend time with your pet and care for them.',
        habits: [
          'Walk your pet', 'Play with your pet', 'Groom your pet',
        ] },
      { label: 'Neighbor', value: 'neighbor',
        description: 'Greet your neighbors and offer help.',
        habits: [
          'Greet a neighbor', 'Offer help', 'Share a smile',
        ] },
      { label: 'Community Member', value: 'community',
        description: 'Engage with your community and share resources.',
        habits: [
          'Attend a meeting', 'Volunteer locally', 'Share a resource',
        ] },
      { label: 'Citizen', value: 'citizen',
        description: 'Engage in civic life and participate in elections.',
        habits: [
          'Read the news', 'Vote in elections', 'Engage in civic life',
        ] },
      { label: 'Global Citizen', value: 'global',
        description: 'Learn about other cultures and support global causes.',
        habits: [
          'Learn about another culture', 'Support a global cause', 'Share a world news story',
        ] },
    ],
  },
  {
    category: 'Work & Business',
    icon: '💼',
    roles: [
      { label: 'Leader', value: 'leader',
        description: 'Lead your team and inspire others.',
        habits: [
          'Give positive feedback', 'Set daily goals for team', 'Reflect on leadership',
        ] },
      { label: 'Entrepreneur', value: 'entrepreneur',
        description: 'Start and grow your business.',
        habits: [
          'Brainstorm new ideas', 'Network with peers', 'Review business goals',
        ] },
      { label: 'Coach', value: 'coach',
        description: 'Guide and support others in their personal development.',
        habits: [
          'Check in with a client', 'Plan a session', 'Reflect on coaching wins',
        ] },
      { label: 'Mentor', value: 'mentor',
        description: 'Guide and support others in their learning journey.',
        habits: [
          'Check in with a mentee', 'Share advice', 'Reflect on mentoring',
        ] },
      { label: 'Investor', value: 'investor',
        description: 'Review your portfolio and set savings goals.',
        habits: [
          'Review your portfolio', 'Read market news', 'Set a savings goal',
        ] },
      { label: 'Marketer', value: 'marketer',
        description: 'Develop marketing strategies and analyze metrics.',
        habits: [
          'Write a campaign idea', 'Analyze metrics', 'Study a competitor',
        ] },
      { label: 'Salesperson', value: 'salesperson',
        description: 'Reach out to leads and close deals.',
        habits: [
          'Reach out to a lead', 'Review your pitch', 'Reflect on a win',
        ] },
      { label: 'Therapist', value: 'therapist',
        description: 'Practice active listening and help others with mental health.',
        habits: [
          'Practice active listening', 'Read a psychology article', 'Reflect on a session',
        ] },
      { label: 'Doctor', value: 'doctor',
        description: 'Review patient notes and practice self-care.',
        habits: [
          'Review patient notes', 'Read medical news', 'Practice self-care',
        ] },
      { label: 'Nurse', value: 'nurse',
        description: 'Care for patients and organize your supplies.',
        habits: [
          'Check in with a patient', 'Organize your supplies', 'Practice mindfulness',
        ] },
    ],
  },
  {
    category: 'Food & Home',
    icon: '🍽️',
    roles: [
      { label: 'Chef', value: 'chef',
        description: 'Try new recipes and improve your cooking skills.',
        habits: [
          'Try a new recipe', 'Prep ingredients', 'Clean your kitchen',
        ] },
      { label: 'Home Cook', value: 'home cook',
        description: 'Cook meals and try new ingredients.',
        habits: [
          'Cook a meal', 'Try a new ingredient', 'Share your food',
        ] },
      { label: 'Baker', value: 'baker',
        description: 'Bake bread and try new desserts.',
        habits: [
          'Bake bread', 'Try a new dessert', 'Share your baking',
        ] },
      { label: 'Mixologist', value: 'mixologist',
        description: 'Mix new drinks and learn cocktail recipes.',
        habits: [
          'Mix a new drink', 'Learn a cocktail recipe', 'Share a drink with a friend',
        ] },
      { label: 'Bartender', value: 'bartender',
        description: 'Practice pouring and learn new recipes.',
        habits: [
          'Practice a pour', 'Learn a new recipe', 'Connect with a guest',
        ] },
      { label: 'Sommelier', value: 'sommelier',
        description: 'Taste new wines and learn about wine.',
        habits: [
          'Taste a new wine', 'Read about wine', 'Pair wine with food',
        ] },
      { label: 'Brewer', value: 'brewer',
        description: 'Brew batches and try new recipes.',
        habits: [
          'Brew a batch', 'Clean your equipment', 'Try a new recipe',
        ] },
      { label: 'Coffee Lover', value: 'coffee',
        description: 'Brew coffee and try new beans.',
        habits: [
          'Brew coffee', 'Try a new bean', 'Share a cup with a friend',
        ] },
      { label: 'Tea Enthusiast', value: 'tea',
        description: 'Brew tea and try new blends.',
        habits: [
          'Brew tea', 'Try a new blend', 'Share tea with a friend',
        ] },
      { label: 'Foodie', value: 'foodie',
        description: 'Try new dishes and review restaurants.',
        habits: [
          'Try a new dish', 'Review a restaurant', 'Share a recipe',
        ] },
      { label: 'Shopper', value: 'shopper',
        description: 'Review your budget and plan shopping lists.',
        habits: [
          'Review your budget', 'Plan a shopping list', 'Reflect on purchases',
        ] },
      { label: 'Saver', value: 'saver',
        description: 'Track your expenses and set savings goals.',
        habits: [
          'Track your expenses', 'Set a savings goal', 'Review your budget',
        ] },
      { label: 'Minimalist', value: 'minimalist',
        description: 'Declutter and simplify your life.',
        habits: [
          'Declutter one item', 'Reflect on needs', 'Organize a space',
        ] },
      { label: 'Maximalist', value: 'maximalist',
        description: 'Add new decor and share your collection.',
        habits: [
          'Add a new decor', 'Share your collection', 'Reflect on abundance',
        ] },
    ],
  },
];

function getSuggestions(identity: string): string[] {
  const key = identity.toLowerCase().trim();
  const preset = identityPresetCategories.flatMap(cat => cat.roles).find(p => key.includes(p.value));
  if (preset) return preset.habits;
  // Default generic habits
  return [
    `Reflect on your goal as a ${identity}`,
    'Read for 10 minutes',
    'Plan your day',
  ];
}

const motivationalQuotes = [
  "Small habits make a big difference.",
  "You are what you repeatedly do.",
  "Every day is a chance to grow.",
  "Progress, not perfection.",
  "Dream big. Start small. Act now.",
  "Consistency is the key to success.",
  "Your future is created by what you do today."
];

// Add a list of habit icons (emojis)
const habitEmojis = ['✅','📖','🏃','🎨','🎵','🧘','🍎','💪','📝','🌱','💡','📚','🕒','🔔','🥗','🚰','😃','🌞','🌙','🎯','🏆','🧹','🛏️','🧑‍💻','👟','🎸','📷','🗣️','💬','🧑‍🍳','🧑‍🏫','🧑‍🔬','🧑‍🎤','🧑‍🎨','🧑‍🚀','🧑‍🔧','🧑‍🌾','🧑‍⚕️','🧑‍🎓','🧑‍💼','🧑‍🔬','🧑‍🎤','🧑‍🎨','🧑‍🚀','🧑‍🔧','🧑‍🌾','🧑‍⚕️','🧑‍🎓','🧑‍💼'];

export default function OnboardingPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [identity, setIdentity] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Add a search state
  const [search, setSearch] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [quote, setQuote] = useState<string>("");
  // Step state: 1 = role/habits, 2 = schedule, 3 = summary
  const [step, setStep] = useState(1);
  // For step 2: schedule, reminders, and icon per habit
  // Update habitDetails type to include intervalType and details for complex intervals
  const [habitDetails, setHabitDetails] = useState<{
    name: string;
    times: string[];
    reminder: boolean;
    icon: string;
    intervalType?: 'none' | 'simple' | 'weekly' | 'monthly' | 'custom';
    interval?: { value: number; unit: 'minutes' | 'hours' | 'days' } | null;
    weeklyDays?: string[]; // e.g., ['Mon', 'Wed']
    monthlyDay?: number | null;
    customInterval?: string | null;
  }[]>([]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  // Redirect to login if not logged in
  if (!loading && !user) {
    router.replace("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestions(getSuggestions(identity));
  };

  const handleSave = async () => {
    if (!user) return;
    setSubmitting(true);
    setError("");
    try {
      const habitsToInsert = suggestions.map((title) => ({
        user_id: user.id,
        title,
        description: null,
        target_count: 1,
        schedule: ["09:00"],
        notification_enabled: false,
        reminder_minutes_before: 15,
      }));
      const { error } = await supabase.from("habits").insert(habitsToInsert);
      if (error) throw error;
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to save habits");
    } finally {
      setSubmitting(false);
    }
  };

  // When moving to step 2, initialize habitDetails
  const goToStep2 = () => {
    setHabitDetails(suggestions.map((h, idx) => ({
      name: h,
      times: ['09:00'],
      reminder: false,
      icon: habitEmojis[idx % habitEmojis.length],
      intervalType: 'none',
      interval: null,
      weeklyDays: [],
      monthlyDay: null,
      customInterval: '',
    })));
    setStep(2);
  };

  // Step 2: For each habit, allow editing name, add/remove times, toggle reminder, pick icon
  // Step 3: Summary/confirmation
  const goToStep3 = () => setStep(3);
  const goToStep1 = () => setStep(1);
  const goToStep2Back = () => setStep(2);

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (!user) return;
      const habitsToInsert = habitDetails.map(h => ({
        user_id: user.id,
        title: h.name,
        description: null,
        target_count: 1,
        schedule: h.times,
        notification_enabled: h.reminder,
        reminder_minutes_before: 15,
        interval_type: h.intervalType || null,
        interval_value: h.intervalType === 'simple' ? h.interval?.value : null,
        interval_unit: h.intervalType === 'simple' ? h.interval?.unit : null,
        weekly_days: h.intervalType === 'weekly' ? h.weeklyDays : null,
        monthly_day: h.intervalType === 'monthly' ? h.monthlyDay : null,
        custom_interval: h.intervalType === 'custom' ? h.customInterval : null,
      }));
      const { error } = await supabase.from("habits").insert(habitsToInsert);
      if (error) throw error;
      setStep(4);
      setTimeout(() => router.replace("/dashboard"), 1200);
    } catch (err: any) {
      setError(err.message || "Failed to save habits");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-300 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[90vh] flex flex-col">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-white rounded-t-xl pt-8 pb-2 px-8 flex flex-col gap-2 shadow-sm">
          <div className="text-primary-700 font-semibold text-center text-base">
            {step === 1 ? 'Step 1 of 3: Who do you want to become?' : step === 2 ? 'Step 2 of 3: When and how do you want to do your habits?' : 'Step 3 of 3: Confirm your habits'}
          </div>
          {step === 1 && (
            <>
              <input
                type="text"
                placeholder="Search roles..."
                className="w-full px-4 py-2 rounded-lg border-2 border-primary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                value={search}
                onChange={e => setSearch(e.target.value)}
                disabled={submitting}
                aria-label="Search roles"
              />
              <div className="border-b border-primary-100 mt-2" />
            </>
          )}
        </div>
        {/* Scrollable content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-2 space-y-4 custom-scrollbar">
          {step === 1 && (
            <>
              {identityPresetCategories.map(cat => {
                // Filter roles by search
                const filteredRoles = cat.roles.filter(role =>
                  role.label.toLowerCase().includes(search.toLowerCase()) ||
                  role.habits.some(h => h.toLowerCase().includes(search.toLowerCase()))
                );
                if (filteredRoles.length === 0) return null;
                return (
                  <div key={cat.category} className="mb-4">
                    <h3 className="font-bold text-primary-700 mb-2 text-lg flex items-center">
                      <span className="mr-2 text-2xl">{cat.icon}</span> {cat.category}
                    </h3>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {filteredRoles.map((preset) => (
                        <div key={preset.value} className="flex flex-col items-center min-w-[120px]">
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-full border-2 text-sm whitespace-nowrap transition font-semibold transform duration-150 ${identity.toLowerCase().includes(preset.value) ? 'bg-primary-600 text-white border-primary-600 scale-105 shadow-lg' : 'bg-white text-primary-700 border-primary-200 hover:bg-primary-100 hover:scale-105 active:scale-95'}`}
                            onClick={() => {
                              setIdentity(`I am a ${preset.label.toLowerCase()}`);
                              setSuggestions(preset.habits);
                            }}
                            disabled={submitting}
                            aria-label={`Select role: ${preset.label}`}
                          >
                            {preset.label}
                          </button>
                          <span className="text-xs text-gray-500 mt-1 text-center max-w-[120px]">{preset.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {/* Suggested habits editable list */}
              {suggestions.length > 0 && (
                <div className="space-y-4 transition-opacity duration-500 opacity-100 animate-fade-in">
                  <h2 className="text-lg font-semibold text-primary-700 text-center">Suggested Habits</h2>
                  <ul className="space-y-2">
                    {suggestions.map((habit, i) => (
                      <li key={i} className="p-3 bg-primary-50 rounded text-primary-900 text-center text-base flex items-center justify-between gap-2">
                        {editingIndex === i ? (
                          <input
                            className="flex-1 px-2 py-1 rounded border border-primary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => {
                              if (editValue.trim()) {
                                setSuggestions(s => s.map((h, idx) => idx === i ? editValue : h));
                              }
                              setEditingIndex(null);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                if (editValue.trim()) {
                                  setSuggestions(s => s.map((h, idx) => idx === i ? editValue : h));
                                }
                                setEditingIndex(null);
                              } else if (e.key === 'Escape') {
                                setEditingIndex(null);
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <span className="flex-1 text-center cursor-pointer" onClick={() => { setEditingIndex(i); setEditValue(habit); }}>{habit}</span>
                        )}
                        <button
                          aria-label="Edit habit"
                          className="text-primary-500 hover:text-primary-700 px-1"
                          onClick={() => { setEditingIndex(i); setEditValue(habit); }}
                          tabIndex={0}
                        >
                          ✏️
                        </button>
                        <button
                          aria-label="Delete habit"
                          className="text-red-500 hover:text-red-700 px-1"
                          onClick={() => setSuggestions(s => s.filter((_, idx) => idx !== i))}
                          tabIndex={0}
                        >
                          🗑️
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setSuggestions(s => [...s, "New Habit"])}
                    className="w-full py-2 text-sm font-semibold rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200 transition"
                    type="button"
                  >
                    + Add your own habit
                  </button>
                </div>
              )}
            </>
          )}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              {habitDetails.map((habit, i) => (
                <div key={i} className="flex flex-col gap-2 bg-primary-50 rounded p-3 mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-2xl bg-white rounded-full border border-primary-200 px-2 py-1 hover:bg-primary-100 focus:outline-none"
                      onClick={() => {
                        // Cycle to next emoji
                        setHabitDetails(hs => hs.map((h, idx) => idx === i ? { ...h, icon: habitEmojis[(habitEmojis.indexOf(h.icon) + 1) % habitEmojis.length] } : h));
                      }}
                      aria-label="Change habit icon"
                    >
                      {habit.icon}
                    </button>
                    <input
                      className="font-semibold text-primary-900 text-base px-2 py-1 rounded border border-primary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 flex-1"
                      value={habit.name}
                      onChange={e => setHabitDetails(hs => hs.map((h, idx) => idx === i ? { ...h, name: e.target.value } : h))}
                      aria-label={`Edit habit name for habit ${i + 1}`}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    {/* Interval type selector */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Interval Type:</label>
                      <select
                        className="rounded border border-primary-200 px-2 py-1 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        value={habit.intervalType || 'none'}
                        onChange={e => {
                          const intervalType = e.target.value as 'none' | 'simple' | 'weekly' | 'monthly' | 'custom';
                          setHabitDetails(hs => hs.map((h, idx) => idx === i ? {
                            ...h,
                            intervalType,
                            // Reset details when changing type
                            interval: intervalType === 'simple' ? (h.interval || { value: 1, unit: 'hours' }) : null,
                            weeklyDays: intervalType === 'weekly' ? (h.weeklyDays || []) : [],
                            monthlyDay: intervalType === 'monthly' ? (h.monthlyDay || 1) : null,
                            customInterval: intervalType === 'custom' ? (h.customInterval || '') : '',
                          } : h));
                        }}
                        aria-label={`Set interval type for habit ${i + 1}`}
                      >
                        <option value="none">None</option>
                        <option value="simple">Simple (minutes/hours/days)</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    {/* Simple interval */}
                    {habit.intervalType === 'simple' && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Interval:</label>
                        <input
                          type="number"
                          min={1}
                          className="w-20 rounded border border-primary-200 px-2 py-1 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                          value={habit.interval?.value ?? ''}
                          onChange={e => {
                            const value = e.target.value ? parseInt(e.target.value) : '';
                            setHabitDetails(hs => hs.map((h, idx) => idx === i ? { ...h, interval: value ? { value, unit: habit.interval?.unit || 'hours' } : null } : h));
                          }}
                          placeholder="Every..."
                          aria-label={`Set interval value for habit ${i + 1}`}
                        />
                        <select
                          className="rounded border border-primary-200 px-2 py-1 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                          value={habit.interval?.unit || 'hours'}
                          onChange={e => {
                            const unit = e.target.value as 'minutes' | 'hours' | 'days';
                            setHabitDetails(hs => hs.map((h, idx) => idx === i ? { ...h, interval: h.interval ? { ...h.interval, unit } : { value: 1, unit } } : h));
                          }}
                          aria-label={`Set interval unit for habit ${i + 1}`}
                        >
                          <option value="minutes">minutes</option>
                          <option value="hours">hours</option>
                          <option value="days">days</option>
                        </select>
                      </div>
                    )}
                    {/* Weekly interval */}
                    {habit.intervalType === 'weekly' && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="text-sm text-gray-600">Days:</label>
                        {daysOfWeek.map(day => (
                          <label key={day} className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={habit.weeklyDays?.includes(day) || false}
                              onChange={e => {
                                setHabitDetails(hs => hs.map((h, idx) => {
                                  if (idx !== i) return h;
                                  const newDays = h.weeklyDays || [];
                                  return {
                                    ...h,
                                    weeklyDays: e.target.checked
                                      ? [...newDays, day]
                                      : newDays.filter(d => d !== day),
                                  };
                                }));
                              }}
                            />
                            {day}
                          </label>
                        ))}
                      </div>
                    )}
                    {/* Monthly interval */}
                    {habit.intervalType === 'monthly' && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Day of month:</label>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          className="w-20 rounded border border-primary-200 px-2 py-1 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                          value={habit.monthlyDay ?? ''}
                          onChange={e => {
                            const value = e.target.value ? parseInt(e.target.value) : null;
                            setHabitDetails(hs => hs.map((h, idx) => idx === i ? { ...h, monthlyDay: value } : h));
                          }}
                          placeholder="1-31"
                          aria-label={`Set day of month for habit ${i + 1}`}
                        />
                      </div>
                    )}
                    {/* Custom interval */}
                    {habit.intervalType === 'custom' && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Custom:</label>
                        <input
                          type="text"
                          className="rounded border border-primary-200 px-2 py-1 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                          value={habit.customInterval ?? ''}
                          onChange={e => setHabitDetails(hs => hs.map((h, idx) => idx === i ? { ...h, customInterval: e.target.value } : h))}
                          placeholder="e.g. every 2 weeks on Thursday"
                          aria-label={`Set custom interval for habit ${i + 1}`}
                        />
                      </div>
                    )}
                    {/* Times input (unchanged) */}
                    {habit.times.map((time, tIdx) => (
                      <div key={tIdx} className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Time:</label>
                        <input
                          type="time"
                          className="rounded border border-primary-200 px-2 py-1 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                          value={time}
                          onChange={e => setHabitDetails(hs => hs.map((h, idx) => idx === i ? { ...h, times: h.times.map((t, j) => j === tIdx ? e.target.value : t) } : h))}
                          aria-label={`Set time for habit ${i + 1}, time ${tIdx + 1}`}
                        />
                        {habit.times.length > 1 && (
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700 px-1"
                            onClick={() => setHabitDetails(hs => hs.map((h, idx) => idx === i ? { ...h, times: h.times.filter((_, j) => j !== tIdx) } : h))}
                            aria-label="Remove time"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="text-xs text-primary-600 hover:text-primary-800 mt-1 self-start"
                      onClick={() => setHabitDetails(hs => hs.map((h, idx) => idx === i ? { ...h, times: [...h.times, '09:00'] } : h))}
                    >
                      + Add another time
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <label className="text-sm text-gray-600 flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={habit.reminder}
                        onChange={e => setHabitDetails(hs => hs.map((h, idx) => idx === i ? { ...h, reminder: e.target.checked } : h))}
                        className="accent-primary-600"
                        aria-label={`Enable reminder for habit ${i + 1}`}
                      />
                      Remind me
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-semibold text-primary-700 text-center mb-2">Review your habits</h2>
              <ul className="space-y-3">
                {habitDetails.map((habit, i) => {
                  // Ensure only valid React nodes are returned
                  if (!habit) return null;
                  return (
                    <li key={i} className="flex flex-col bg-primary-50 rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{habit.icon}</span>
                        <span className="font-semibold text-primary-900 text-base flex-1">{habit.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center text-sm text-gray-700">
                        {habit.times.map((time, tIdx) => (
                          <span key={tIdx} className="bg-primary-100 rounded px-2 py-1">{time}</span>
                        ))}
                        {/* Show interval summary */}
                        {habit.intervalType === 'simple' && habit.interval && (
                          <span className="ml-2 bg-blue-100 text-blue-700 rounded px-2 py-1">
                            Every {habit.interval.value} {habit.interval.unit}
                          </span>
                        )}
                        {habit.intervalType === 'weekly' && habit.weeklyDays && habit.weeklyDays.length > 0 && (
                          <span className="ml-2 bg-blue-100 text-blue-700 rounded px-2 py-1">
                            Every {habit.weeklyDays.join(', ')}
                          </span>
                        )}
                        {habit.intervalType === 'monthly' && habit.monthlyDay && (
                          <span className="ml-2 bg-blue-100 text-blue-700 rounded px-2 py-1">
                            On day {habit.monthlyDay} of each month
                          </span>
                        )}
                        {habit.intervalType === 'custom' && habit.customInterval && (
                          <span className="ml-2 bg-blue-100 text-blue-700 rounded px-2 py-1">
                            {habit.customInterval}
                          </span>
                        )}
                        {habit.reminder && <span className="ml-2 text-green-600">🔔 Reminder On</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </form>
        {/* Sticky footer */}
        <div className="sticky bottom-0 z-10 bg-white rounded-b-xl pb-6 pt-2 px-8 flex flex-col gap-2 shadow-sm">
          {step === 1 && (
            <button
              onClick={e => { e.preventDefault(); goToStep2(); }}
              className="w-full py-3 text-lg font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
              disabled={submitting || suggestions.length === 0}
              type="button"
            >
              Save and Continue
            </button>
          )}
          {step === 2 && (
            <div className="flex gap-2">
              <button
                onClick={e => { e.preventDefault(); goToStep1(); }}
                className="w-1/2 py-3 text-lg font-semibold rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200 transition"
                type="button"
              >
                Back
              </button>
              <button
                onClick={e => { e.preventDefault(); goToStep3(); }}
                className="w-1/2 py-3 text-lg font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
                disabled={habitDetails.some(h => !h.name.trim())}
                type="button"
              >
                Next
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="flex gap-2">
              <button
                onClick={e => { e.preventDefault(); goToStep2Back(); }}
                className="w-1/2 py-3 text-lg font-semibold rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200 transition"
                type="button"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="w-1/2 py-3 text-lg font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
                disabled={submitting}
                type="button"
              >
                {submitting ? "Saving..." : "Finish"}
              </button>
            </div>
          )}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-6 animate-fade-in">
              <div className="text-5xl text-green-600 animate-bounce">✔️</div>
              <div className="mt-2 text-primary-700 font-semibold">Habits saved!</div>
            </div>
          )}
          {error && <div className="text-red-600 text-center">{error}</div>}
          {quote && (
            <div className="mt-2 text-center text-primary-500 italic text-sm animate-fade-in-slow">{quote}</div>
          )}
        </div>
      </div>
    </div>
  );
} 