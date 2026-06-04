export type Platform = 'Instagram' | 'Twitter/X' | 'TikTok' | 'YouTube' | 'Facebook';
export type AccountCategory = 'Aged Account' | 'High Followers' | 'Creator' | 'Business Page' | 'Verified';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  platform: Platform;
  category: AccountCategory;
  followers: number;
  following: number;
  engagement: number; // percentage
  accountAgeDays: number;
  posts: number;
  verified: boolean;
  niche: string;
  tags: string[];
  sampleData: string;
  fullDataContent: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'purchase';
  amount: number;
  description: string;
  timestamp: string;
}

export const mockProducts: Product[] = [
  {
    id: 'acc-ig-fitness-180k',
    title: 'Instagram Fitness Creator — 180K',
    description: 'Established fitness and lifestyle Instagram account with 180K engaged followers in the health & wellness niche. Consistent posting history, organic growth story, Reels-heavy strategy with above-average story views (8%). Monetized via brand deals and affiliate links. No prior bans or content violations. OG email accessible.',
    price: 349.00,
    platform: 'Instagram',
    category: 'High Followers',
    followers: 180_000,
    following: 812,
    engagement: 4.7,
    accountAgeDays: 1460,
    posts: 620,
    verified: false,
    niche: 'Fitness & Wellness',
    tags: ['Fitness', 'Lifestyle', 'Reels', 'OG Email'],
    sampleData: `
Platform     : Instagram
Handle       : @fitlife.gains
Niche        : Fitness / Wellness / Nutrition
Followers    : 180,400
Following    : 812
Posts        : 620
Avg Likes    : 6,100
Avg Comments : 142
Engagement   : 4.7%
Story Views  : ~14,400 / story
Account Age  : 4 years (Created Jan 2021)
Past Bans    : None
OG Email     : Included
2FA Status   : Disabled (transfer-ready)
Bio          : 💪 Helping you build the body & life you want | Collab → fitlifegains@proton.me
Last Active  : 2 days ago
`,
    fullDataContent: `
╔══════════════════════════════════════════════════════╗
║    ACCOUNT CREDENTIALS — HANDLE: @fitlife.gains     ║
║    PLATFORM: INSTAGRAM                               ║
╚══════════════════════════════════════════════════════╝

USERNAME     : fitlife.gains
EMAIL        : fitlifegains2021@gmail.com
PASSWORD     : Str0ng!Pass#2024
OG EMAIL     : fitlifegains_original@gmail.com
OG EMAIL PASS: Orig!nal#Pass99

RECOVERY
  Backup codes : 8243-9912 / 3301-7743 / 6620-1182
  Phone #      : +1 (629) 304-XXXX (last 4 not provided)

ACCOUNT DETAILS
  Handle       : @fitlife.gains
  Full Name    : Alex Rivera
  Bio          : 💪 Helping you build the body & life you want | Collab → fitlifegains@proton.me
  Followers    : 180,400
  Posts        : 620
  Category     : Creator / Fitness
  Monetization : Brand Partnerships, Affiliate (MyProtein, GYMSHARK)
  Link-in-bio  : https://linktr.ee/fitlifegains

TRANSFER NOTES
  • Disable 2FA before transfer (currently OFF)
  • Change email first, then password
  • Wait 48h before posting to avoid unusual activity flag
`
  },
  {
    id: 'acc-tw-crypto-92k',
    title: 'Twitter/X Crypto Account — 92K',
    description: 'High-authority crypto and DeFi Twitter/X account with 92K followers. Strong engagement on market analysis threads. Built organically over 3 years. Monetization enabled (X Premium Creator). Follower base primarily US/EU. Clean posting history with no community note violations.',
    price: 279.00,
    platform: 'Twitter/X',
    category: 'High Followers',
    followers: 92_000,
    following: 1430,
    engagement: 3.9,
    accountAgeDays: 1095,
    posts: 8450,
    verified: false,
    niche: 'Crypto & DeFi',
    tags: ['Crypto', 'DeFi', 'Finance', 'Threads', 'X Premium'],
    sampleData: `
Platform     : Twitter / X
Handle       : @CryptoPulseX
Niche        : Cryptocurrency / DeFi / Web3 Analysis
Followers    : 92,100
Following    : 1,430
Tweets       : 8,450
Avg Likes    : 1,240
Avg Retweets : 310
Avg Replies  : 88
Engagement   : 3.9%
Account Age  : 3 years (Created Apr 2022)
X Premium    : Active (Creator monetization enabled)
Past Bans    : None
Community Notes: 0 violations
OG Email     : Included
2FA Status   : Disabled
Last Active  : Today
`,
    fullDataContent: `
╔══════════════════════════════════════════════════════╗
║    ACCOUNT CREDENTIALS — HANDLE: @CryptoPulseX     ║
║    PLATFORM: TWITTER / X                            ║
╚══════════════════════════════════════════════════════╝

USERNAME     : CryptoPulseX
EMAIL        : cryptopulsex.acc@gmail.com
PASSWORD     : D3F!Market#Pulse22
OG EMAIL     : cryptopulsex_og@outlook.com
OG EMAIL PASS: 0riginal_Pulse#99

ACCOUNT DETAILS
  Handle       : @CryptoPulseX
  Display Name : Crypto Pulse ⚡
  Bio          : 📊 On-chain analyst | DeFi threads daily | Not financial advice
  Followers    : 92,100
  Tweets       : 8,450
  X Premium    : Gold (Monetization active — ~$340/mo revenue)
  Lists        : Member of 840 lists

RECOVERY
  Phone        : Linked (can be changed post-transfer)
  Backup Email : cryptopulsex.backup@proton.me

TRANSFER NOTES
  • Change email via Settings → Account → Change Email
  • Disable linked apps before transfer
  • Monetization carries over to new owner after identity re-verification
`
  },
  {
    id: 'acc-tt-fashion-520k',
    title: 'TikTok Fashion Account — 520K',
    description: 'Premium TikTok fashion and style account with 520K followers. Viral video history with 3 clips crossing 2M views. Strong female 18–34 demographic (US, UK, AU). TikTok Shop connected with existing affiliate earnings. Creator Fund active. Email + phone transfer-ready.',
    price: 589.00,
    platform: 'TikTok',
    category: 'Creator',
    followers: 520_000,
    following: 320,
    engagement: 6.1,
    accountAgeDays: 900,
    posts: 380,
    verified: false,
    niche: 'Fashion & Style',
    tags: ['Fashion', 'TikTok Shop', 'Creator Fund', 'Viral'],
    sampleData: `
Platform     : TikTok
Handle       : @styledbysena
Niche        : Fashion / OOTD / Haul Videos
Followers    : 521,800
Following    : 320
Videos       : 380
Total Likes  : 8.4M
Avg Views    : 180,000 / video
Avg Likes    : 22,000
Engagement   : 6.1%
Account Age  : ~2.5 years
TikTok Shop  : Connected (affiliate active)
Creator Fund : Active (~$200–$400/mo)
Demographics : 82% Female | US 44% | UK 18% | AU 12%
Past Bans    : None
Viral Videos : 3 videos >2M views
OG Email     : Included
2FA          : Disabled
Last Active  : Today
`,
    fullDataContent: `
╔══════════════════════════════════════════════════════╗
║    ACCOUNT CREDENTIALS — HANDLE: @styledbysena      ║
║    PLATFORM: TIKTOK                                  ║
╚══════════════════════════════════════════════════════╝

USERNAME     : styledbysena
EMAIL        : styledbysena.creator@gmail.com
PASSWORD     : Fash!on#Sena2023
PHONE        : +44 7XXX XXXXXX (provided upon purchase confirmation)
OG EMAIL     : styledbysena_original@icloud.com

ACCOUNT DETAILS
  Handle       : @styledbysena
  Display Name : Sena ✨ Style & Looks
  Bio          : 👗 fashion girlie | OOTD daily | shop my looks 🛍️ ↓
  Followers    : 521,800
  Total Likes  : 8,400,000
  TikTok Shop  : Active — 2 brand partnerships (SHEIN, PLT)
  Creator Fund : Enrolled — Avg $280/mo

MONETIZATION BREAKDOWN
  TikTok Shop Commission : ~$180/mo
  Creator Fund           : ~$280/mo
  Brand Deals (one-off)  : $300–600 per post

TRANSFER NOTES
  • Unlink Google/Apple before transfer
  • New owner must verify phone to complete account claim
  • Do not change username within first 30 days after transfer
`
  },
  {
    id: 'acc-yt-gaming-210k',
    title: 'YouTube Gaming Channel — 210K Subscribers',
    description: 'Monetized YouTube gaming channel with 210K subscribers in the FPS/RPG gaming niche. AdSense active earning $800–$1,400/month. Channel has 400+ videos, strong watch time (avg 8.2 min). Sponsorship history with gaming peripheral brands. No strikes or copyright claims.',
    price: 799.00,
    platform: 'YouTube',
    category: 'Creator',
    followers: 210_000,
    following: 0,
    engagement: 5.3,
    accountAgeDays: 1825,
    posts: 412,
    verified: false,
    niche: 'Gaming (FPS / RPG)',
    tags: ['Gaming', 'AdSense', 'Monetized', 'YouTube Partner'],
    sampleData: `
Platform       : YouTube
Channel        : GhostFrame Gaming
Handle         : @GhostFrameGG
Niche          : FPS / RPG Gaming (Warzone, Elden Ring, Destiny 2)
Subscribers    : 211,400
Total Videos   : 412
Total Views    : 48.7M
Avg Views/Vid  : 118,000
Avg Watch Time : 8m 22s
Engagement     : 5.3%
AdSense        : Active — $950–$1,400/mo
YT Partner     : Yes (MPP enrolled)
Sponsorships   : Corsair, SteelSeries, G2A
Account Age    : 5 years
Strikes        : 0
Copyright      : 0 claims active
OG Email       : Included
`,
    fullDataContent: `
╔══════════════════════════════════════════════════════╗
║    ACCOUNT CREDENTIALS — CHANNEL: GhostFrame Gaming ║
║    PLATFORM: YOUTUBE                                 ║
╚══════════════════════════════════════════════════════╝

GOOGLE ACCOUNT EMAIL : ghostframegaming.yt@gmail.com
GOOGLE PASSWORD      : G4m!ngGhost#2019
RECOVERY EMAIL       : ghostframe_recovery@proton.me
RECOVERY PHONE       : +1 (480) 5XX-XXXX

CHANNEL DETAILS
  Channel Name : GhostFrame Gaming
  Handle       : @GhostFrameGG
  Subscribers  : 211,400
  Videos       : 412
  Total Views  : 48,700,000
  Description  : FPS & RPG content | Warzone tips, Elden Ring guides, Destiny 2 builds

REVENUE DATA
  AdSense RPM     : $4.20 avg
  Monthly Revenue : $950 – $1,400
  Payment Method  : Bank transfer (must update to new owner's bank)
  AdSense ID      : pub-XXXX-XXXX (will be reset for new owner)

TRANSFER NOTES
  • Transfer via Google Account Settings → Data Transfer
  • AdSense must be re-linked to new owner's details
  • 2-Step Verification: DISABLED (transfer-ready)
  • Change recovery email first, then password
`
  },
  {
    id: 'acc-ig-food-45k',
    title: 'Instagram Food Blog — 45K',
    description: 'Niche Instagram food and recipe account with 45K loyal followers. Above-average engagement of 7.2% driven by recipe carousels and reel tutorials. Partnered with 4 food brands in the past year. Audience primarily female 25–44 from the US. Ideal for food brand sponsorships or recipe affiliate programs.',
    price: 119.00,
    platform: 'Instagram',
    category: 'Creator',
    followers: 45_000,
    following: 1200,
    engagement: 7.2,
    accountAgeDays: 730,
    posts: 290,
    verified: false,
    niche: 'Food & Recipe',
    tags: ['Food', 'Recipes', 'Lifestyle', 'Carousels'],
    sampleData: `
Platform     : Instagram
Handle       : @theforkdiaries
Niche        : Food / Recipes / Home Cooking
Followers    : 45,200
Following    : 1,200
Posts        : 290 (75% Carousels, 25% Reels)
Avg Likes    : 2,100
Avg Comments : 148
Engagement   : 7.2%
Story Views  : ~3,600 / story
Account Age  : 2 years
Past Bans    : None
Past Sponsors: HelloFresh, Ninja, Simply Cook, OXO
Demographics : 79% Female | US 61% | UK 22%
OG Email     : Included
2FA          : Disabled
`,
    fullDataContent: `
╔══════════════════════════════════════════════════════╗
║    ACCOUNT CREDENTIALS — HANDLE: @theforkdiaries    ║
║    PLATFORM: INSTAGRAM                               ║
╚══════════════════════════════════════════════════════╝

USERNAME     : theforkdiaries
EMAIL        : theforkdiaries@gmail.com
PASSWORD     : R3c!pe#Fork2022
OG EMAIL     : forkdiaries_original@yahoo.com
OG EMAIL PASS: Y4h00#0riginal

ACCOUNT DETAILS
  Handle       : @theforkdiaries
  Display Name : The Fork Diaries 🍴
  Bio          : 🍳 Easy recipes for busy people | New recipe every Sunday 📩 collabs: forkdiaries@gmail.com
  Followers    : 45,200
  Posts        : 290
  Highlights   : Breakfast, Lunch, Dinner, Snacks, Collabs (5 highlight sets)

SPONSOR RATE CARD
  Feed Post    : $150 – $300
  Reel         : $300 – $500
  Story Set    : $80 – $120

TRANSFER NOTES
  • OG email included for full account ownership
  • No active brand deal contracts in place — clean handover
  • Change email & password within 24h of purchase
`
  },
  {
    id: 'acc-fb-biz-travel-88k',
    title: 'Facebook Travel Business Page — 88K Likes',
    description: 'Established Facebook travel and tourism business page with 88K likes and 91K followers. Active audience with consistent post reach of 40–80K per post via Meta Boost history. Ad account in good standing, pixel installed. Monetized via in-stream ads and affiliate travel links.',
    price: 199.00,
    platform: 'Facebook',
    category: 'Business Page',
    followers: 91_000,
    following: 0,
    engagement: 2.8,
    accountAgeDays: 2190,
    posts: 1840,
    verified: false,
    niche: 'Travel & Tourism',
    tags: ['Travel', 'Facebook Page', 'Ad Account', 'In-Stream Ads'],
    sampleData: `
Platform     : Facebook
Page Name    : Wanderlust World Travel
Page Type    : Business Page (Travel Agency / Creator)
Page Likes   : 88,400
Followers    : 91,200
Posts        : 1,840
Avg Reach    : 52,000 per post
Avg Engagement: 2.8%
In-Stream Ads: Active (~$180/mo)
Ad Account   : Clean standing (no restrictions)
Meta Pixel   : Installed
Account Age  : 6 years
Past Bans    : None
Monetization : In-stream video ads + affiliate travel links
Admin Email  : Included
`,
    fullDataContent: `
╔══════════════════════════════════════════════════════╗
║    PAGE CREDENTIALS — Wanderlust World Travel        ║
║    PLATFORM: FACEBOOK                                ║
╚══════════════════════════════════════════════════════╝

FACEBOOK LOGIN EMAIL : wanderlustworld.page@gmail.com
PASSWORD             : Tr4vel#World2018
RECOVERY EMAIL       : wanderlust_backup@outlook.com

PAGE DETAILS
  Page Name    : Wanderlust World Travel
  Page URL     : facebook.com/WanderlustWorldTravel
  Page Likes   : 88,400
  Followers    : 91,200
  Category     : Travel Company
  Rating       : 4.6★ (212 reviews)

MONETIZATION
  In-Stream Ads  : Active — ~$180/mo avg
  Affiliate Links: Booking.com, GetYourGuide, TripAdvisor
  Ad Account ID  : act_XXXXXXXXXX (clean, $0 outstanding)

ASSETS INCLUDED
  Meta Pixel ID        : Included
  Custom Audiences     : 3 saved (website visitors, video viewers, engagers)
  Scheduled Posts      : 14 posts scheduled (can be cancelled)

TRANSFER NOTES
  • Add new admin email → remove old admin
  • Business Manager transfer available if needed
  • Change password and recovery email within 48h
`
  },
  {
    id: 'acc-tt-aged-5yr',
    title: 'Aged TikTok Account — 5 Years Old (12K)',
    description: 'Rare aged TikTok account created in 2020 with 5 years of account history. 12K followers in the lifestyle niche. Fully warmed up, no violations, no shadowbans. OG email included. Ideal for rebranding into any niche — aged accounts receive algorithmic priority over new accounts.',
    price: 149.00,
    platform: 'TikTok',
    category: 'Aged Account',
    followers: 12_000,
    following: 440,
    engagement: 5.5,
    accountAgeDays: 1825,
    posts: 145,
    verified: false,
    niche: 'Lifestyle (Rebrand-Ready)',
    tags: ['Aged', '5 Years', 'Rebrand', 'OG Email', 'No Violations'],
    sampleData: `
Platform     : TikTok
Handle       : @lifewithjordan__
Niche        : Lifestyle (rebrand-ready)
Followers    : 12,100
Following    : 440
Videos       : 145
Total Likes  : 280,000
Avg Views    : 9,500 / video
Account Age  : 5 years (Created Feb 2020)
Violations   : None
Shadowban    : Never
OG Email     : Included
2FA          : Disabled
Notes        : Ideal for rebrand — aged accounts get priority reach from TikTok algo
`,
    fullDataContent: `
╔══════════════════════════════════════════════════════╗
║    ACCOUNT CREDENTIALS — HANDLE: @lifewithjordan__  ║
║    PLATFORM: TIKTOK (AGED 5YR)                       ║
╚══════════════════════════════════════════════════════╝

USERNAME     : lifewithjordan__
EMAIL        : lifewithjordan.tt@gmail.com
PASSWORD     : L!fe#Jordan2020
PHONE        : +1 (754) 3XX-XXXX
OG EMAIL     : jordan_original2020@gmail.com
OG EMAIL PASS: 0rigin4l#Acc20

ACCOUNT DETAILS
  Handle       : @lifewithjordan__
  Display Name : Jordan 🌿 lifestyle
  Bio          : just living life one video at a time 🎥
  Followers    : 12,100
  Videos       : 145
  Total Likes  : 280,000
  Created      : February 14, 2020

REBRAND TIPS
  • Change username after 30-day ownership hold
  • Update bio, profile pic, and sound strategy for new niche
  • Post 2–3x/day in first week to trigger algorithm re-evaluation
  • Aged accounts receive 2–3x reach boost vs. new accounts

TRANSFER NOTES
  • Unlink all third-party apps before transfer
  • Disable linked Google/Apple sign-in first
  • OG email available to confirm account ownership disputes
`
  },
  {
    id: 'acc-ig-verified-celeb',
    title: 'Instagram Verified Entertainment Page — 340K ✓',
    description: 'Meta-verified Instagram page in the entertainment and celebrity gossip niche with 340K followers and a blue verification checkmark. Page has consistent viral content history, strong Story views, and has appeared in press coverage. Ideal for media companies or influencer agencies. Full ownership transfer.',
    price: 1299.00,
    platform: 'Instagram',
    category: 'Verified',
    followers: 340_000,
    following: 290,
    engagement: 5.8,
    accountAgeDays: 1095,
    posts: 2100,
    verified: true,
    niche: 'Entertainment & Celebrity',
    tags: ['Verified', 'Blue Tick', 'Entertainment', 'Media', 'High Value'],
    sampleData: `
Platform     : Instagram
Handle       : @celebdigest.official
Niche        : Celebrity News / Entertainment / Pop Culture
Followers    : 341,200
Following    : 290
Posts        : 2,100
Avg Likes    : 14,800
Avg Comments : 620
Engagement   : 5.8%
Story Views  : ~28,000 / story
Account Age  : 3 years
Verified     : ✅ Meta Verified (Blue Checkmark)
Past Bans    : None
Press Coverage: 2 mentions in BuzzFeed, 1 in Daily Mail
OG Email     : Included
2FA          : Disabled (transfer-ready)
`,
    fullDataContent: `
╔══════════════════════════════════════════════════════╗
║    ACCOUNT CREDENTIALS — HANDLE: @celebdigest.off.. ║
║    PLATFORM: INSTAGRAM ✅ META VERIFIED              ║
╚══════════════════════════════════════════════════════╝

USERNAME     : celebdigest.official
EMAIL        : celebdigest.official@gmail.com
PASSWORD     : C3l3b#Digest!2022
OG EMAIL     : celebdigest_og@gmail.com
OG EMAIL PASS: 0G#Celeb!2022

VERIFICATION
  Meta Verified : YES — Blue checkmark active
  Verified Since: March 2023
  Meta Business : Linked (can be transferred to new BM)

ACCOUNT DETAILS
  Handle       : @celebdigest.official
  Display Name : Celeb Digest ✓
  Bio          : 🎬 Your daily celebrity news & tea ☕ | DM for collabs & features
  Followers    : 341,200
  Posts        : 2,100
  Category     : Entertainment Page
  Collab Rate  : $500–$1,200 per post

MONETIZATION
  Brand Deals        : $800–$1,200/sponsored post
  Subscription Badges: Active (Instagram Subscriptions)
  Affiliate Links    : Amazon, Fenty Beauty, Fashion Nova

TRANSFER NOTES  
  • Meta Verified badge transfers with account ownership
  • Change email & password simultaneously to retain verification
  • New owner must complete Meta's account ownership verification (1–3 days)
  • DO NOT remove verification badge during transfer process
`
  }
];
