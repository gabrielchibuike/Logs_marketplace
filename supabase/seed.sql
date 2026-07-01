-- ==========================================
-- PaidLogStore Social Media Account Marketplace
-- PostgreSQL Seed Data
-- ==========================================

-- Populate initial social media account listings
INSERT INTO public.products (
    id, title, description, price, platform, category, 
    followers, following, engagement, account_age_days, posts, 
    verified, niche, tags, sample_data, encrypted_credentials, status
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'Instagram Fitness Creator — 180K',
    'Established fitness and lifestyle Instagram account with 180K engaged followers in the health & wellness niche. Consistent posting history, organic growth story, Reels-heavy strategy with above-average story views (8%). Monetized via brand deals and affiliate links. No prior bans or content violations. OG email accessible.',
    349.00,
    'Instagram',
    'High Followers',
    180000,
    812,
    4.7,
    1460,
    620,
    FALSE,
    'Fitness & Wellness',
    '["Fitness", "Lifestyle", "Reels", "OG Email"]'::jsonb,
    '{"Platform": "Instagram", "Handle": "@fitlife.gains", "Niche": "Fitness / Wellness / Nutrition", "Followers": "180,400", "Following": "812", "Posts": "620", "Avg Likes": "6,100", "Avg Comments": "142", "Engagement": "4.7%", "Story Views": "~14,400 / story", "Account Age": "4 years (Created Jan 2021)", "Past Bans": "None", "OG Email": "Included", "2FA Status": "Disabled (transfer-ready)", "Bio": "💪 Helping you build the body & life you want | Collab → fitlifegains@proton.me", "Last Active": "2 days ago"}'::jsonb,
    -- Plain text credentials for mockup. Real setups would encrypt this.
    'USERNAME     : fitlife.gains
EMAIL        : fitlifegains2021@gmail.com
PASSWORD     : Str0ng!Pass#2024
OG EMAIL     : fitlifegains_original@gmail.com
OG EMAIL PASS: Orig!nal#Pass99

RECOVERY
  Backup codes : 8243-9912 / 3301-7743 / 6620-1182
  Phone #      : +1 (629) 304-XXXX

TRANSFER NOTES
  • Disable 2FA before transfer (currently OFF)
  • Change email first, then password
  • Wait 48h before posting to avoid unusual activity flag',
    'active'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Twitter/X Crypto Account — 92K',
    'High-authority crypto and DeFi Twitter/X account with 92K followers. Strong engagement on market analysis threads. Built organically over 3 years. Monetization enabled (X Premium Creator). Follower base primarily US/EU. Clean posting history with no community note violations.',
    279.00,
    'Twitter/X',
    'High Followers',
    92000,
    1430,
    3.9,
    1095,
    8450,
    FALSE,
    'Crypto & DeFi',
    '["Crypto", "DeFi", "Finance", "Threads", "X Premium"]'::jsonb,
    '{"Platform": "Twitter / X", "Handle": "@CryptoPulseX", "Niche": "Cryptocurrency / DeFi / Web3 Analysis", "Followers": "92,100", "Following": "1,430", "Tweets": "8,450", "Avg Likes": "1,240", "Avg Retweets": "310", "Avg Replies": "88", "Engagement": "3.9%", "Account Age": "3 years (Created Apr 2022)", "X Premium": "Active (Creator monetization enabled)", "Past Bans": "None", "Community Notes": "0 violations", "OG Email": "Included", "2FA Status": "Disabled", "Last Active": "Today"}'::jsonb,
    'USERNAME     : CryptoPulseX
EMAIL        : cryptopulsex.acc@gmail.com
PASSWORD     : D3F!Market#Pulse22
OG EMAIL     : cryptopulsex_og@outlook.com
OG EMAIL PASS: 0riginal_Pulse#99

ACCOUNT DETAILS
  Handle       : @CryptoPulseX
  Display Name : Crypto Pulse ⚡
  Bio          : 📊 On-chain analyst | DeFi threads daily | Not financial advice
  X Premium    : Gold (Monetization active — ~$340/mo revenue)

RECOVERY
  Phone        : Linked (can be changed post-transfer)
  Backup Email : cryptopulsex.backup@proton.me',
    'active'
),
(
    '00000000-0000-0000-0000-000000000003',
    'TikTok Fashion Account — 520K',
    'Premium TikTok fashion and style account with 520K followers. Viral video history with 3 clips crossing 2M views. Strong female 18–34 demographic (US, UK, AU). TikTok Shop connected with existing affiliate earnings. Creator Fund active. Email + phone transfer-ready.',
    589.00,
    'TikTok',
    'Creator',
    520000,
    320,
    6.1,
    900,
    380,
    FALSE,
    'Fashion & Style',
    '["Fashion", "TikTok Shop", "Creator Fund", "Viral"]'::jsonb,
    '{"Platform": "TikTok", "Handle": "@styledbysena", "Niche": "Fashion / OOTD / Haul Videos", "Followers": "521,800", "Following": "320", "Videos": "380", "Total Likes": "8.4M", "Avg Views": "180,000 / video", "Avg Likes": "22,000", "Engagement": "6.1%", "Account Age": "~2.5 years", "TikTok Shop": "Connected (affiliate active)", "Creator Fund": "Active (~$200–$400/mo)", "Demographics": "82% Female | US 44% | UK 18% | AU 12%", "Past Bans": "None", "Viral Videos": "3 videos >2M views", "OG Email": "Included", "2FA": "Disabled", "Last Active": "Today"}'::jsonb,
    'USERNAME     : styledbysena
EMAIL        : styledbysena.creator@gmail.com
PASSWORD     : Fash!on#Sena2023
PHONE        : +44 7XXX XXXXXX (provided upon purchase confirmation)
OG EMAIL     : styledbysena_original@icloud.com

ACCOUNT DETAILS
  Handle       : @styledbysena
  Display Name : Sena ✨ Style & Looks
  Bio          : 👗 fashion girlie | OOTD daily | shop my looks 🛍️ ↓
  TikTok Shop  : Active — 2 brand partnerships (SHEIN, PLT)
  Creator Fund : Enrolled — Avg $280/mo

TRANSFER NOTES
  • Unlink Google/Apple before transfer
  • New owner must verify phone to complete account claim
  • Do not change username within first 30 days after transfer',
    'active'
),
(
    '00000000-0000-0000-0000-000000000004',
    'YouTube Gaming Channel — 210K Subscribers',
    'Monetized YouTube gaming channel with 210K subscribers in the FPS/RPG gaming niche. AdSense active earning $800–$1,400/month. Channel has 400+ videos, strong watch time (avg 8.2 min). Sponsorship history with gaming peripheral brands. No strikes or copyright claims.',
    799.00,
    'YouTube',
    'Creator',
    210000,
    0,
    5.3,
    1825,
    412,
    FALSE,
    'Gaming (FPS / RPG)',
    '["Gaming", "AdSense", "Monetized", "YouTube Partner"]'::jsonb,
    '{"Platform": "YouTube", "Channel": "GhostFrame Gaming", "Handle": "@GhostFrameGG", "Niche": "FPS / RPG Gaming (Warzone, Elden Ring, Destiny 2)", "Subscribers": "211,400", "Total Videos": "412", "Total Views": "48.7M", "Avg Views/Vid": "118,000", "Avg Watch Time": "8m 22s", "Engagement": "5.3%", "AdSense": "Active — $950–$1,400/mo", "YT Partner": "Yes (MPP enrolled)", "Sponsorships": "Corsair, SteelSeries, G2A", "Account Age": "5 years", "Strikes": "0", "Copyright": "0 claims active", "OG Email": "Included"}'::jsonb,
    'GOOGLE ACCOUNT EMAIL : ghostframegaming.yt@gmail.com
GOOGLE PASSWORD      : G4m!ngGhost#2019
RECOVERY EMAIL       : ghostframe_recovery@proton.me
RECOVERY PHONE       : +1 (480) 5XX-XXXX

REVENUE DATA
  AdSense RPM     : $4.20 avg
  Monthly Revenue : $950 – $1,400
  Payment Method  : Bank transfer
  AdSense ID      : pub-XXXX-XXXX (will be reset for new owner)

TRANSFER NOTES
  • Transfer via Google Account Settings → Data Transfer
  • AdSense must be re-linked to new owner''s details
  • 2-Step Verification: DISABLED (transfer-ready)
  • Change recovery email first, then password',
    'active'
),
(
    '00000000-0000-0000-0000-000000000005',
    'Instagram Food Blog — 45K',
    'Niche Instagram food and recipe account with 45K loyal followers. Above-average engagement of 7.2% driven by recipe carousels and reel tutorials. Partnered with 4 food brands in the past year. Audience primarily female 25–44 from the US. Ideal for food brand sponsorships or recipe affiliate programs.',
    229.00,
    'Instagram',
    'Creator',
    45000,
    1200,
    7.2,
    730,
    290,
    FALSE,
    'Food & Recipe',
    '["Food", "Recipes", "Lifestyle", "Carousels"]'::jsonb,
    '{"Platform": "Instagram", "Handle": "@theforkdiaries", "Niche": "Food / Recipes / Home Cooking", "Followers": "45,200", "Following": "1,200", "Posts": "290 (75% Carousels, 25% Reels)", "Avg Likes": "2,100", "Avg Comments": "148", "Engagement": "7.2%", "Story Views": "~3,600 / story", "Account Age": "2 years", "Past Bans": "None", "Past Sponsors": "HelloFresh, Ninja, Simply Cook, OXO", "Demographics": "79% Female | US 61% | UK 22%", "OG Email": "Included", "2FA": "Disabled"}'::jsonb,
    'USERNAME     : theforkdiaries
EMAIL        : theforkdiaries@gmail.com
PASSWORD     : R3c!pe#Fork2022
OG EMAIL     : forkdiaries_original@yahoo.com
OG EMAIL PASS: Y4h00#0riginal

SPONSOR RATE CARD
  Feed Post    : $150 – $300
  Reel         : $300 – $500
  Story Set    : $80 – $120

TRANSFER NOTES
  • OG email included for full account ownership
  • No active brand deal contracts in place — clean handover
  • Change email & password within 24h of purchase',
    'active'
),
(
    '00000000-0000-0000-0000-000000000006',
    'Facebook Travel Business Page — 88K Likes',
    'Established Facebook travel and tourism business page with 88K likes and 91K followers. Active audience with consistent post reach of 40–80K per post via Meta Boost history. Ad account in good standing, pixel installed. Monetized via in-stream ads and affiliate travel links.',
    199.00,
    'Facebook',
    'Business Page',
    91000,
    0,
    2.8,
    2190,
    1840,
    FALSE,
    'Travel & Tourism',
    '["Travel", "Facebook Page", "Ad Account", "In-Stream Ads"]'::jsonb,
    '{"Platform": "Facebook", "Page Name": "Wanderlust World Travel", "Page Type": "Business Page (Travel Agency / Creator)", "Page Likes": "88,400", "Followers": "91,200", "Posts": "1,840", "Avg Reach": "52,000 per post", "Avg Engagement": "2.8%", "In-Stream Ads": "Active (~$180/mo)", "Ad Account": "Clean standing (no restrictions)", "Meta Pixel": "Installed", "Account Age": "6 years", "Past Bans": "None", "Monetization": "In-stream video ads + affiliate travel links", "Admin Email": "Included"}'::jsonb,
    'FACEBOOK LOGIN EMAIL : wanderlustworld.page@gmail.com
PASSWORD             : Tr4vel#World2018
RECOVERY EMAIL       : wanderlust_backup@outlook.com

PAGE DETAILS
  Page Name    : Wanderlust World Travel
  Page URL     : facebook.com/WanderlustWorldTravel
  Page Likes   : 88,400
  Category     : Travel Company
  Rating       : 4.6★ (212 reviews)

ASSETS INCLUDED
  Meta Pixel ID        : Included
  Custom Audiences     : 3 saved
  Scheduled Posts      : 14 posts scheduled',
    'active'
),
(
    '00000000-0000-0000-0000-000000000007',
    'Aged TikTok Account — 5 Years Old (12K)',
    'Rare aged TikTok account created in 2020 with 5 years of account history. 12K followers in the lifestyle niche. Fully warmed up, no violations, no shadowbans. OG email included. Ideal for rebranding into any niche — aged accounts receive algorithmic priority over new accounts.',
    149.00,
    'TikTok',
    'Aged Account',
    12000,
    440,
    5.5,
    1825,
    145,
    FALSE,
    'Lifestyle (Rebrand-Ready)',
    '["Aged", "5 Years", "Rebrand", "OG Email", "No Violations"]'::jsonb,
    '{"Platform": "TikTok", "Handle": "@lifewithjordan__", "Niche": "Lifestyle (rebrand-ready)", "Followers": "12,100", "Following": "440", "Videos": "145", "Total Likes": "280,000", "Avg Views": "9,500 / video", "Account Age": "5 years (Created Feb 2020)", "Violations": "None", "Shadowban": "Never", "OG Email": "Included", "2FA": "Disabled", "Notes": "Ideal for rebrand — aged accounts get priority reach from TikTok algo"}'::jsonb,
    'USERNAME     : lifewithjordan__
EMAIL        : lifewithjordan.tt@gmail.com
PASSWORD     : L!fe#Jordan2020
PHONE        : +1 (754) 3XX-XXXX
OG EMAIL     : jordan_original2020@gmail.com
OG EMAIL PASS: 0rigin4l#Acc20

REBRAND TIPS
  • Change username after 30-day ownership hold
  • Update bio, profile pic, and sound strategy for new niche
  • Post 2–3x/day in first week to trigger algorithm re-evaluation

TRANSFER NOTES
  • Unlink all third-party apps before transfer
  • Disable linked Google/Apple sign-in first
  • OG email available to confirm account ownership disputes',
    'active'
),
(
    '00000000-0000-0000-0000-000000000008',
    'Instagram Verified Entertainment Page — 340K ✓',
    'Meta-verified Instagram page in the entertainment and celebrity gossip niche with 340K followers and a blue verification checkmark. Page has consistent viral content history, strong Story views, and has appeared in press coverage. Ideal for media companies or influencer agencies. Full ownership transfer.',
    1299.00,
    'Instagram',
    'Verified',
    340000,
    290,
    5.8,
    1095,
    2100,
    TRUE,
    'Entertainment & Celebrity',
    '["Verified", "Blue Tick", "Entertainment", "Media", "High Value"]'::jsonb,
    '{"Platform": "Instagram", "Handle": "@celebdigest.official", "Niche": "Celebrity News / Entertainment / Pop Culture", "Followers": "341,200", "Following": "290", "Posts": "2,100", "Avg Likes": "14,800", "Avg Comments": "620", "Engagement": "5.8%", "Story Views": "~28,000 / story", "Account Age": "3 years", "Verified": "✅ Meta Verified (Blue Checkmark)", "Past Bans": "None", "Press Coverage": "2 mentions in BuzzFeed, 1 in Daily Mail", "OG Email": "Included", "2FA": "Disabled (transfer-ready)"}'::jsonb,
    'USERNAME     : celebdigest.official
EMAIL        : celebdigest.official@gmail.com
PASSWORD     : C3l3b#Digest!2022
OG EMAIL     : celebdigest_og@gmail.com
OG EMAIL PASS: 0G#Celeb!2022

VERIFICATION
  Meta Verified : YES — Blue checkmark active
  Verified Since: March 2023
  Meta Business : Linked (can be transferred to new BM)

TRANSFER NOTES  
  • Meta Verified badge transfers with account ownership
  • Change email & password simultaneously to retain verification
  • New owner must complete Meta''s account ownership verification (1–3 days)
  • DO NOT remove verification badge during transfer process',
    'active'
);

-- ========================================================
-- SEED PRODUCT CREDENTIALS (Quantity Support Migration)
-- ========================================================

-- Populate credentials table for seeded products if not already seeded
INSERT INTO public.product_credentials (product_id, encrypted_credentials)
SELECT id, encrypted_credentials
FROM public.products p
WHERE p.encrypted_credentials IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.product_credentials pc
    WHERE pc.product_id = p.id
);
