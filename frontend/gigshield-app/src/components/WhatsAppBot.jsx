import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, CheckCheck, Clock } from 'lucide-react';
import { simulateDisruption, getWorkerClaims, getClaimDetails } from '../services/api';

// ============================================
// ADVANCED HINGLISH NLP ENGINE v3
// Levenshtein Distance + Intent Scoring + Typo Tolerance
// ============================================

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
  return dp[m][n];
}

function fuzzyMatch(input, keyword) {
  if (input.includes(keyword)) return 1.0;
  // Word-level containment for multi-word keywords
  const kwWords = keyword.split(' ');
  if (kwWords.length > 1 && kwWords.every(w => input.includes(w))) return 0.95;
  // Single-word fuzzy via Levenshtein
  const inputWords = input.split(/\s+/);
  for (const word of inputWords) {
    if (word.length < 3) continue;
    const dist = levenshtein(word, keyword);
    const maxLen = Math.max(word.length, keyword.length);
    const similarity = 1 - dist / maxLen;
    if (similarity >= 0.65) return similarity; // 65% match = good enough for typos
  }
  return 0;
}

// All intents with rich keyword banks
const INTENTS = [
  // ---- CLAIM INTENTS (trigger backend) ----
  {
    id: 'claim_rain', category: 'claim',
    keywords: ['baarish','barish','barsaat','rain','rainfall','rainy','paani','pani','bheeg','geeli','toofan','toofani','waterlogging','water logging','bahut baarish','tez baarish','mausam kharab','barsat','baarsh','varsad','shower','drizzle','boondi','jheel','nadi','rimjhim','jhadi','jhaadi','bhari baarish','monsoon'],
    trigger: { type: 'HEAVY_RAIN', severity: 40 },
    responses: [
      "Samajh gaya bhai! Baarish ki wajah se kaam nahi ho pa raha.\n\nMai abhi aapke zone *{zone}* me HEAVY_RAIN claim process kar raha hu...",
      "Itni baarish me delivery? Bilkul nahi! \n\nAapke *{zone}* zone me rain disruption trigger kar raha hu. Processing shuru...",
      "Baarish ka alert mil gaya! Aapki safety pehle.\n\nClaim initiate ho raha hai *{zone}* ke liye. 7-Layer AI scan chal raha hai...",
    ]
  },
  {
    id: 'claim_flood', category: 'claim',
    keywords: ['flood','baadh','badh','doob','dooba','paani bhar','pani bhar','dubki','nala','sewer','naala','overflow','submerge','jalmagna','jal bharav','daaldal','daldal','keechad','mud'],
    trigger: { type: 'FLOOD', severity: 1 },
    responses: [
      "Flood situation hai?! Ye toh serious hai bhai.\n\nAbhi turant *{zone}* me RED ALERT flood claim register kar raha hu. Priority 0!",
      "Paani bhar gaya? Aapki zarurat sabse pehle hai.\n\nFlood disruption *{zone}* ke liye fire kar raha hu. Instant processing!",
    ]
  },
  {
    id: 'claim_heat', category: 'claim',
    keywords: ['garmi','dhoop','loo','heat','hot','garam','tapti','sun','suraj','extreme heat','heat wave','heatwave','lu','lu lag','temperature','temp high','bahut garmi','jalti','jal raha','tapish','paseena','sweat','dehydration','sunstroke'],
    trigger: { type: 'EXTREME_HEAT', severity: 47 },
    responses: [
      "Itni garmi me delivery? Bilkul nahi! Health first.\n\nAapke *{zone}* me EXTREME_HEAT trigger kar raha hu. Ghar jao, paisa aayega.",
      "Loo chal rahi hai? Mat niklo bhai!\n\nHeat wave claim process ho raha hai *{zone}* ke liye. Thande me baitho!",
    ]
  },
  {
    id: 'claim_aqi', category: 'claim',
    keywords: ['pollution','pradushan','aqi','smoke','smog','dhuan','dhua','saans','breathing','mask','hawa kharab','zehreeli','toxic','air quality','pm2.5','pm10','fog pollution','smog','visibility','nahi dikh'],
    trigger: { type: 'SEVERE_AQI', severity: 520 },
    responses: [
      "Hawa bahut kharab hai? AQI danger me hai.\n\nSEVERE_AQI claim fire kar raha hu *{zone}* ke liye. Ghar pe raho, mask lagao!",
      "Pradushan zyada hai. Mat niklo bahar bhai.\n\nPollution trigger fire ho raha hai zone me. Payout process hoga!",
    ]
  },
  {
    id: 'claim_accident', category: 'claim',
    keywords: ['accident','gir gaya','gir gaye','gir gayi','thuk','thuk gaya','slip','crash','takkar','chot','chot lagi','hadsa','injury','injured','hurt','dard','ghayal','hospital','fracture','toot','toota','bike gir','gaadi gir','scooty gir','fisal','fisal gaya','girna','gira','tapak','laga'],
    trigger: { type: 'FLOOD', severity: 1 },
    responses: [
      "Kya?! Accident?! Pehle apna khayal rakho bhai!\n\nEmergency claim turant process kar raha hu. Serious ho toh 112 pe call karo.\n\n*{zone}* ke liye priority SOS firing...",
      "Oh no! Aap theek ho? Safe jagah jao pehle.\n\nEmergency SOS claim *{zone}* ke liye initiate ho raha hai. Seedha UPI pe aayega!",
    ]
  },
  {
    id: 'claim_curfew', category: 'claim',
    keywords: ['curfew','bandh','strike','hartal','dharna','protest','andolan','police','danda','lathi','laathi','section 144','danga','riot','fasad','road block','road band','rasta band','rasta block','chakka jam','jam','nakabandi','morcha','gherao','rally'],
    trigger: { type: 'CURFEW', severity: 1 },
    responses: [
      "Curfew / Bandh hai? Bilkul bahar mat niklo.\n\nAapke *{zone}* me CURFEW claim process kar raha hu. Government restriction = auto-approved!",
      "Rasta band ya police nakabandi? Samajh gaya.\n\nSocial disruption trigger fire kar raha hu *{zone}* me.",
    ]
  },
  {
    id: 'claim_app_down', category: 'claim',
    keywords: ['app down','app band','app crash','server down','server crash','app nahi chal','app kaam nahi','app hang','network issue','zepto down','swiggy down','blinkit down','zomato down','order nahi aa','order nahi mil','platform down','app error','glitch','bug','loading','screen stuck'],
    trigger: { type: 'APP_DOWN', severity: 120 },
    responses: [
      "App crash ho gaya? Koi nahi bhai.\n\nPlatform outage claim register kar raha hu *{zone}* ke liye. Jab tak app aaye, paisa safe!",
      "Server down hai? Samajh gaya.\n\nTechnical disruption trigger fire ho raha hai. Jaldi process hoga!",
    ]
  },
  {
    id: 'claim_cyclone', category: 'claim',
    keywords: ['cyclone','aandhi','andhi','tufan','toofan','storm','hurricane','tornado','hawa tez','tez hawa','wind','strong wind','aandhee'],
    trigger: { type: 'FLOOD', severity: 1 },
    responses: ["Cyclone warning hai? CRITICAL!\n\nSafe shelter me jao. *{zone}* me emergency claim fire kar raha hu. Priority 0!"]
  },
  {
    id: 'claim_fog', category: 'claim',
    keywords: ['fog','kohra','dhund','foggy','misty','kuch dikh nahi','visibility kam','zero visibility','dense fog','suji'],
    trigger: { type: 'FLOOD', severity: 1 },
    responses: ["Kohra dense hai? Driving dangerous hai.\n\nDENSE_FOG claim *{zone}* ke liye register kar raha hu. Mat niklo!"]
  },
  {
    id: 'claim_earthquake', category: 'claim',
    keywords: ['earthquake','bhukamp','bhuchal','jhatka','tremor','zameen hili','hilna','seismic'],
    trigger: { type: 'FLOOD', severity: 1 },
    responses: ["BHUKAMP?! Open area me jao turant!\n\nEmergency earthquake claim *{zone}* ke liye process ho raha hai!"]
  },
  {
    id: 'claim_internet', category: 'claim',
    keywords: ['internet band','internet nahi','net nahi','net band','data nahi','signal nahi','no signal','no network','network nahi','internet shutdown','wifi nahi','mobile data band'],
    trigger: { type: 'APP_DOWN', severity: 120 },
    responses: ["Internet shutdown? Government restriction lagta hai.\n\nOutage claim fire kar raha hu. Mesh-network relay se bhi kaam chalega!"]
  },

  // ---- CONVERSATIONAL INTENTS ----
  {
    id: 'greeting', category: 'chat',
    keywords: ['hi','hello','hey','helo','namaste','namaskar','kaise ho','kya haal','haan','bhai','bro','sup','kya chal raha','good morning','good evening','good night','shubh','kem cho','salam','assalam','hola','yo','arre','howdy'],
    responses: [
      "Namaste bhai! Mai RahatPay AI Saarthi hu.\n\nAap mujhse ye pooch sakte ho:\n- \"baarish ho rahi hai\" → Claim file\n- \"mera claim status\" → Track claim\n- \"premium kitna hai\" → Pricing\n- \"help\" → Full menu\n\nYa seedha problem batao Hinglish me!",
      "Hello! Mai RahatPay ka AI assistant hu.\n\nKoi bhi pareshani — baarish, garmi, curfew, accident — turant claim kar dunga!\n\nBoliye, kya madad karu?",
    ]
  },
  {
    id: 'how_are_you', category: 'chat',
    keywords: ['kaise ho','kya haal','how are you','kaisa hai','theek ho','sab theek','whats up','wassup','kya chalra','howzit'],
    responses: [
      "Mai bilkul fit hu bhai! 24x7 kaam karta hu bina thake.\n\nAap batao, koi problem? Ya bas hello bolne aaye the?",
      "Mast hu bhai! AI hu na, thakta nahi kabhi.\n\nAapke liye kya kar sakta hu aaj?",
    ]
  },
  {
    id: 'thanks', category: 'chat',
    keywords: ['thanks','thank you','shukriya','dhanyavad','dhanyawad','thnx','ty','thanku','bahut accha','great','awesome','maza aa gaya','badhiya','zabardast','shandar','kamaal','best','superb','mast'],
    responses: [
      "Arey koi baat nahi bhai! Yahi toh mera kaam hai.\n\nKabhi bhi zarurat ho, mai yahan hu. Safe raho!",
      "Shukriya aapka bhi! Aap safe raho, yehi sabse bada thank you hai.",
    ]
  },
  {
    id: 'bye', category: 'chat',
    keywords: ['bye','goodbye','alvida','chalo','baad me','later','tata','ok bye','nikal','jaa raha','band karo','close'],
    responses: [
      "Alvida bhai! Safe drive karna.\n\nKabhi bhi zarurat ho toh yahan likh dena. Mai 24x7 ready!",
      "Ok bhai! Apna khayal rakhna.\n\nDisruption ho toh seedha yahan type karo. Instant claim!",
    ]
  },
  {
    id: 'help', category: 'chat',
    keywords: ['help','madad','sahayata','kya kar sakte','kya karu','guide','samjhao','batao','how to','kaise karu','kya hai ye','features','options','menu','commands','what can you do'],
    responses: [
      "Mai RahatPay AI Saarthi hu! Ye sab kar sakta hu:\n\n*CLAIMS (seedha type karo):*\n\"baarish ho rahi hai\" → Rain claim\n\"bahut garmi hai\" → Heat claim\n\"accident ho gaya\" → Emergency claim\n\"curfew laga hai\" → Curfew claim\n\"app crash\" → Platform outage\n\"paani bhar gaya\" → Flood claim\n\n*INFO (poochho):*\n\"premium kitna hai?\" → Pricing\n\"mera claim status\" → Track claims\n\"payout kab aayega\" → Payment info\n\"fraud check kaise\" → Security info\n\"trust score\" → Your rating\n\n*GENERAL:*\n\"joke sunao\" → Entertainment\n\"about rahatpay\" → About us\n\nHinglish, Hindi, English — sab chalega!",
    ]
  },
  {
    id: 'claim_status', category: 'dynamic',
    keywords: ['claim status','mera claim','claim kaha','claim update','status batao','kya hua claim','process hua','approve hua','reject hua','pending','review me','claim track','track','tracking','status kya hai','claim check','check karo'],
    responses: ['__DYNAMIC_CLAIM_STATUS__']
  },
  {
    id: 'premium_query', category: 'chat',
    keywords: ['premium','kitna paisa','kitna lagta','price','cost','charge','rate','plan','subscription','hafta','weekly','monthly','payment','fees','kitna bharun','kharcha'],
    responses: [
      "RahatPay ka premium bahut affordable hai bhai!\n\n*Weekly Plans:*\nBasic: Rs.25-35/week → Rs.40/hr payout\nStandard: Rs.35-48/week → Rs.55/hr payout\nPro: Rs.48-60/week → Rs.75/hr payout\n\nAI automatically best rate calculate karta hai zone, season, aur history ke basis pe.\n\nDashboard pe \"Active Policy\" card me current premium dikh raha hoga!",
    ]
  },
  {
    id: 'payout_query', category: 'chat',
    keywords: ['payout','paisa kab','payment kab','rupees','amount','kitna milega','money','compensation','upi','bank','transfer','bheja','kab aayega','kitna aaya','rakam'],
    responses: [
      "Payout fast hota hai bhai!\n\n*Timeline:*\nCritical (Flood/Cyclone): 5 min\nHigh (Heavy Rain): 15 min\nMedium (App Down): 30 min\nLow (Hailstorm): 1 hour\n\nSeedha UPI pe aa jata hai. Zero paperwork!\n\nNote: Abhi claims \"zone_pending\" me jaate hain — Admin dashboard se approve hone ke baad paisa release hota hai.",
    ]
  },
  {
    id: 'fraud_query', category: 'chat',
    keywords: ['fraud','fake','jhooth','jhuth','nakli','cheat','dhoka','scam','fraud detection','security','verification','7 layer','layer','safe','secure'],
    responses: [
      "RahatPay me 7-Layer Military Grade Fraud Shield hai!\n\n*Layers:*\n1. Spatial Geo-Fencing\n2. Kalman Filter Trajectory\n3. Biomechanical Telemetry\n4. BSSID Triangulation\n5. Barometric Noise Correlation\n6. Temporal Behavioral AI\n7. Syndicate Clustering Matrix\n\nHar claim pe automatic scan hota hai. Genuine workers ko koi tension nahi!",
    ]
  },
  {
    id: 'policy_query', category: 'chat',
    keywords: ['policy','insurance','bima','coverage','cover','plan details','active plan','mera plan','renew','renewal','expire','validity'],
    responses: [
      "Policy ka status dashboard pe dikhta hai!\n\n*Features:*\n- Weekly auto/manual renewal\n- Pause & resume anytime\n- Zone change pe premium adjust\n- Clean history = discount!\n\n\"Active Policy\" card pe sab details hai.",
    ]
  },
  {
    id: 'zone_query', category: 'chat',
    keywords: ['zone','area','location','jagah','pincode','city','shehar','kahan','mumbai','delhi','bangalore','chennai','noida','gurugram','gurgaon','pune','hyderabad'],
    responses: [
      "Aap currently *{zone}* me registered ho.\n\n*Covered Cities:*\n- Mumbai (Andheri, Bandra, Sion, Powai)\n- Delhi (CP, Rohini, Dwarka)\n- Gurugram (Sector 29)\n- Bangalore (Whitefield, Koramangala)\n- Chennai (Marina, T Nagar)\n- Noida (Sector 62)\n\nZone change ke liye admin se contact karo!",
    ]
  },
  {
    id: 'trust_score', category: 'chat',
    keywords: ['trust','score','rating','reputation','rank','tier','level','bronze','silver','gold','platinum','badge','points'],
    responses: [
      "Trust Score = aapki reputation!\n\n*Tiers:*\nBRONZE (0-39): New\nSILVER (40-59): Trusted\nGOLD (60-79): Pro!\nPLATINUM (80+): Elite!\n\n*Kaise badhaye:*\n- Genuine claims karo\n- Regular kaam karo\n- Fraud mat karo\n- Premium time pe do\n\nHigher score = Faster approvals + Lower premium!",
    ]
  },
  {
    id: 'sos_query', category: 'chat',
    keywords: ['sos','emergency','urgent','jaldi','fatafat','abhi','turant','critical','danger','khatarnak','bachao','help me','jaan','life','zindagi','mar','marna'],
    responses: [
      "EMERGENCY hai?!\n\n*Turant ye karo:*\n1. Safe jagah jao\n2. 112 pe call karo\n3. Dashboard pe SOS button dabao\n4. Ya mujhe batao kya hua\n\nAap safe ho? Batao problem!",
    ]
  },
  {
    id: 'about_rahatpay', category: 'chat',
    keywords: ['rahatpay','rahat pay','gigshield','company','startup','kaun ho','who are you','kya karte ho','about','konsa app','kisne banaya'],
    responses: [
      "RahatPay = India ka pehla AI-powered parametric micro-insurance!\n\n*Kya karta hai:*\n- Gig workers ke lost wages protect karta hai\n- Baarish/garmi/curfew me automatic payout\n- 7-Layer AI fraud detection\n- Seedha UPI pe paisa\n\nWeekly premium sirf Rs.25-60!\n\nKuch aur jaanna hai?",
    ]
  },
  {
    id: 'earnings', category: 'chat',
    keywords: ['kitna kamata','earning','kamai','income','salary','pagar','tankhwah','daily earning','per day','monthly income'],
    responses: [
      "Earnings dashboard pe dikhti hain!\n\n*Typical Gig Earnings:*\nDaily: Rs.700-900\nWeekly: Rs.4,200-5,400\nMonthly: Rs.18,000-22,000\n\nDisruptions se 20-30% loss hota tha — ab RahatPay cover karta hai. \"Protected Earnings\" card dekhiye!",
    ]
  },
  {
    id: 'negative_feedback', category: 'chat',
    keywords: ['bekaar','bekar','kharab','ghatiya','worst','useless','faltu','waste','bakwas','stupid','idiot','pagal','chutiya','gaali','mc','bc'],
    responses: [
      "Sorry bhai agar koi dikkat aayi! Mai aur better hone ki koshish kar raha hu.\n\nSpecifically batao kya problem hai — solve karne ki poori koshish karunga.\n\nAdmin se baat karni ho toh wo bhi arrange ho sakta hai!",
    ]
  },
  {
    id: 'language_query', category: 'chat',
    keywords: ['hindi','english','bhasha','language','hindi me','english me','translate','hinglish'],
    responses: ["Mai Hindi, English, aur Hinglish teeno samajhta hu!\n\nJis bhi language me comfortable ho, usme likho. Typos bhi chalte hain — AI samajh lega!"],
  },
  {
    id: 'joke', category: 'chat',
    keywords: ['joke','mazak','funny','haso','hasao','comedy','chutkula','entertain','bore'],
    responses: [
      "Ek delivery boy se customer bola: \"Late kyun?\"\nBoy: \"Bhai, RahatPay ne bola baarish me mat ja, claim le le!\"\n\nHaha! Par seriously, safety first!",
      "Q: Insurance agent aur delivery boy me common?\nA: Dono ko time pe pahunchna padta hai!\n\nAur sunoge ya kaam ki baat?",
      "Biwi: \"Baarish ho rahi hai, ghar pe ruk jao\"\nHusband: \"Ruk jata hu, RahatPay waise bhi paisa de dega!\"\n\nSmart husband, smarter wife!",
    ]
  },
  {
    id: 'time_query', category: 'dynamic_time',
    keywords: ['time','samay','kitne baje','waqt','kab','date','aaj','today','abhi','din','tarikh'],
    responses: ['__DYNAMIC_TIME__'],
  },
];

function classifyIntent(text) {
  const lower = text.toLowerCase().replace(/[?!.,]/g, '').trim();
  let bestIntent = null;
  let bestScore = 0;

  for (const intent of INTENTS) {
    let score = 0;
    for (const kw of intent.keywords) {
      const matchScore = fuzzyMatch(lower, kw);
      if (matchScore > 0) {
        score += matchScore * (kw.length + (kw.includes(' ') ? 5 : 0));
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return bestScore > 2 ? bestIntent : null;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const FALLBACK_RESPONSES = [
  "Hmm, puri tarah samajh nahi aaya. Thoda detail me batao?\n\nYa try karo:\n- \"baarish ho rahi hai\" → Claim\n- \"help\" → All options\n- \"premium kitna\" → Pricing",
  "Ye wala samajh nahi aaya bhai. Koi baat nahi!\n\nIn me se kuch try karo:\n- Disruption batao (rain/heat/curfew)\n- \"mera claim status\" poochho\n- \"help\" type karo\n\nHinglish, Hindi, English sab chalega!",
  "Sorry bhai, context nahi mila. Mai seekh raha hu!\n\nFilhaal ye kar sakta hu:\n- Claims (rain/flood/heat/curfew/accident)\n- Policy/Premium info\n- Claim tracking\n\n\"help\" likh do pura menu dekhne ke liye!",
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function WhatsAppBot({ workerZone, workerPincode, workerId, onClaimTriggered }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1, sender: 'bot', time: new Date(),
      text: "Namaste! Mai RahatPay AI Saarthi hu.\n\nAapko koi bhi disruption ya problem ho — seedha Hinglish me type karo!\n\n- \"baarish ho rahi hai\"\n- \"accident ho gaya\"\n- \"mera claim status\"\n- \"help\" → Full menu\n\nMai 24x7 ready hu!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [trackedClaims, setTrackedClaims] = useState([]); // claim IDs being tracked
  const [quickVisible, setQuickVisible] = useState(true);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, isTyping, isOpen]);

  const addBot = useCallback((text) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), text, sender: 'bot', time: new Date() }]);
  }, []);

  // ---- CLAIM STATUS POLLING ----
  // When we create a claim via bot, we poll its status every 8s.
  // Once admin approves it, the bot auto-notifies the user.
  useEffect(() => {
    if (trackedClaims.length === 0) return;

    pollIntervalRef.current = setInterval(async () => {
      for (const tc of trackedClaims) {
        try {
          const res = await getClaimDetails(tc.claimId);
          const claim = res.data;
          const currentStatus = claim.status || claim.claim?.status;

          if (currentStatus && currentStatus !== tc.lastStatus && currentStatus !== 'zone_pending') {
            // Status changed! Notify user
            let statusMsg = '';
            if (currentStatus === 'approved' || currentStatus === 'auto_approved') {
              statusMsg = `CLAIM UPDATE!\n\nAapka claim #${tc.claimId} APPROVED ho gaya hai!\n\nPayout: Rs.${claim.payout_amount || claim.claim?.payout_amount || 'processing'}\nTransaction: ${claim.payout_transaction_id || claim.claim?.payout_transaction_id || 'Generating...'}\n\nPaisa seedha aapke UPI pe aa raha hai! Congrats bhai!`;
            } else if (currentStatus === 'rejected') {
              statusMsg = `CLAIM UPDATE\n\nAapka claim #${tc.claimId} reject ho gaya.\n\nAap dashboard se appeal kar sakte ho. Ya mujhe \"appeal\" likhke batao.`;
            } else if (currentStatus === 'manual_review') {
              statusMsg = `CLAIM UPDATE\n\nAapka claim #${tc.claimId} manual review me hai.\n\nAdmin team dekh rahi hai. 60% advance payout already process ho raha hai!`;
            } else {
              statusMsg = `CLAIM UPDATE\n\nClaim #${tc.claimId} ka status: ${currentStatus.replace(/_/g, ' ').toUpperCase()}`;
            }

            addBot(statusMsg);

            // Update tracked status
            setTrackedClaims(prev => prev.map(c =>
              c.claimId === tc.claimId ? { ...c, lastStatus: currentStatus } : c
            ));

            // If terminal state, stop tracking
            if (['approved', 'auto_approved', 'rejected'].includes(currentStatus)) {
              setTrackedClaims(prev => prev.filter(c => c.claimId !== tc.claimId));
              if (onClaimTriggered) onClaimTriggered();
            }
          }
        } catch (err) {
          // silently retry
        }
      }
    }, 8000);

    return () => clearInterval(pollIntervalRef.current);
  }, [trackedClaims, addBot, onClaimTriggered]);

  // ---- PROCESS MESSAGE ----
  const processMessage = async (userMsg) => {
    setQuickVisible(false);
    const msgObj = { id: Date.now(), text: userMsg, sender: 'user', time: new Date(), ticks: 'sent' };
    setMessages(prev => [...prev, msgObj]);

    // Simulate read
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === msgObj.id ? { ...m, ticks: 'read' } : m));
      setIsTyping(true);
    }, 500);

    const intent = classifyIntent(userMsg);
    const delay = 1000 + Math.random() * 600;

    setTimeout(async () => {
      setIsTyping(false);

      if (!intent) {
        addBot(pickRandom(FALLBACK_RESPONSES));
        return;
      }

      // Dynamic time
      if (intent.id === 'time_query') {
        addBot(`Abhi ka time: ${new Date().toLocaleTimeString('hi-IN')}\nDate: ${new Date().toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\nAur kuch puchna hai?`);
        return;
      }

      // Dynamic claim status
      if (intent.id === 'claim_status') {
        addBot("Aapke claims check kar raha hu...");
        setIsTyping(true);
        try {
          const res = await getWorkerClaims(workerId || 1);
          const claims = res.data?.claims || [];
          setIsTyping(false);
          if (claims.length === 0) {
            addBot("Aapka abhi koi claim nahi hai.\n\nJab koi disruption aaye toh mujhe batao — turant file kar dunga!");
          } else {
            const latest = claims.slice(0, 5);
            let statusText = `Aapke latest ${latest.length} claims:\n\n`;
            latest.forEach((c, i) => {
              const st = (c.status || '').replace(/_/g, ' ').toUpperCase();
              statusText += `${i + 1}. #${c.id} | ${c.trigger_type} | Rs.${c.payout_amount} | ${st}\n`;
            });
            statusText += `\nTotal protected: Rs.${res.data?.total_earnings_protected || 0}\n\nKisi specific claim ke baare me puchna hai toh claim ID batao!`;
            addBot(statusText);
          }
        } catch (err) {
          setIsTyping(false);
          addBot("Claims fetch karne me error aaya. Dashboard pe jaake dekhiye ya thodi der me try karo!");
        }
        return;
      }

      // CLAIM intents — fire actual API
      if (intent.category === 'claim') {
        let response = pickRandom(intent.responses).replace(/\{zone\}/g, workerZone || 'your zone');
        addBot(response);

        setIsTyping(true);
        try {
          const res = await simulateDisruption({
            disruption_type: intent.trigger.type,
            pincode: workerPincode || '400053',
            zone: workerZone || 'Andheri West',
            value: intent.trigger.severity,
            duration_hours: 2,
          });

          setTimeout(() => {
            setIsTyping(false);
            const claimsData = res.data?.claims || [];
            const triggerId = res.data?.trigger?.id;

            if (claimsData.length > 0) {
              const c = claimsData[0];
              const statusLabel = (c.status || '').replace(/_/g, ' ').toUpperCase();

              let resultMsg = `Claim successfully registered!\n\n`;
              resultMsg += `Claim ID: #${c.claim_id}\n`;
              resultMsg += `Trigger: ${res.data?.trigger?.type}\n`;
              resultMsg += `Status: ${statusLabel}\n`;
              resultMsg += `Fraud Score: ${c.fraud_score}/100\n`;
              resultMsg += `Zone: ${workerZone}\n\n`;

              if (c.status === 'zone_pending') {
                resultMsg += `Aapka claim Admin dashboard pe bhej diya gaya hai. Jaise hi Admin \"Authorize Zone Payouts\" karega, paisa turant aapke UPI pe aayega.\n\nMai automatically update dunga jab status change hoga!`;

                // Track this claim for live status updates
                setTrackedClaims(prev => [...prev, { claimId: c.claim_id, lastStatus: 'zone_pending', triggerId }]);

              } else if (c.status === 'auto_approved') {
                resultMsg += `AUTO APPROVED! Rs.${c.payout_amount} seedha UPI pe bhej diya gaya hai!`;
              } else if (c.status === 'manual_review') {
                resultMsg += `Manual review me hai. 60% advance (Rs.${c.payout_amount}) already process ho raha hai!`;
              } else {
                resultMsg += `Status: ${statusLabel}. Dashboard pe track karo.`;
              }

              addBot(resultMsg);
              if (onClaimTriggered) onClaimTriggered();

            } else {
              addBot(`Trigger create ho gaya (ID: ${triggerId}) par aapke zone me koi eligible worker nahi mila ya policy active nahi hai.\n\nDashboard pe check karo!`);
            }
          }, 1800);

        } catch (err) {
          setTimeout(() => {
            setIsTyping(false);
            const errMsg = err?.response?.data?.detail || 'Network error';
            addBot(`Claim submit karne me issue aaya:\n\"${errMsg}\"\n\nDashboard se try karo ya thodi der me dobara bolo mujhe!`);
          }, 800);
        }
        return;
      }

      // Regular chat responses
      let response = pickRandom(intent.responses).replace(/\{zone\}/g, workerZone || 'your zone');
      addBot(response);

    }, delay);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = input.trim();
    setInput('');
    processMessage(msg);
  };

  const handleQuickReply = (text) => {
    processMessage(text);
  };

  const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const quickReplies = [
    { label: 'Baarish ho rahi hai', icon: '🌧️' },
    { label: 'Help chahiye', icon: '🆘' },
    { label: 'Mera claim status', icon: '📋' },
    { label: 'Premium kitna hai?', icon: '💰' },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-start font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, originX: 0, originY: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-[#ece5dd] w-[340px] sm:w-[380px] shadow-2xl rounded-2xl overflow-hidden border border-[#075e54]/20 flex flex-col h-[520px]"
            style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')` }}
          >
            {/* Header */}
            <div className="bg-[#075e54] text-white p-3 flex justify-between items-center z-10 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-[#075e54] text-lg">🤖</div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#075e54] rounded-full"></div>
                </div>
                <div className="leading-tight">
                  <div className="font-bold text-sm">RahatPay AI Saarthi</div>
                  <div className="text-[10px] text-green-100">
                    {trackedClaims.length > 0
                      ? `Tracking ${trackedClaims.length} claim(s) live...`
                      : 'Online — Hindi / English / Hinglish'}
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1"><X size={20} /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              <div className="text-center mb-2">
                <span className="bg-[#e1f3d8]/80 text-[10px] text-slate-600 px-3 py-1 rounded-lg pointer-events-none shadow-sm">
                  AI Encrypted | Typo-Tolerant NLP Engine v3
                </span>
              </div>

              {messages.map((msg) => (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-lg p-2.5 shadow-sm text-[13px] break-words whitespace-pre-wrap relative ${
                    msg.sender === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'
                  }`}>
                    {msg.sender === 'bot' && <svg className="absolute top-0 -left-2 text-white fill-current w-2 h-3"><path d="M2,0 L0,3 L2,3 Z"/></svg>}
                    {msg.sender === 'user' && <svg className="absolute top-0 -right-2 text-[#dcf8c6] fill-current w-2 h-3"><path d="M0,0 L2,3 L0,3 Z"/></svg>}
                    <span className="text-[#303030] leading-snug">{msg.text}</span>
                    <div className="text-[10px] text-gray-500 mt-1 text-right flex justify-end items-center space-x-1 float-right clear-both">
                      <span>{formatTime(msg.time)}</span>
                      {msg.sender === 'user' && (
                        msg.ticks === 'sent' ? <Clock size={10} /> : <CheckCheck size={14} className="text-[#34B7F1]" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg p-3 rounded-tl-none shadow-sm flex space-x-1 items-center h-8">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {quickVisible && messages.length <= 2 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {quickReplies.map((qr, i) => (
                  <button key={i} onClick={() => handleQuickReply(qr.label)}
                    className="bg-white border border-[#128C7E]/30 text-[#128C7E] text-[11px] font-medium px-3 py-1.5 rounded-full hover:bg-[#128C7E] hover:text-white transition-all shadow-sm">
                    {qr.icon} {qr.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="bg-[#f0f0f0] p-2 flex items-center space-x-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Hinglish me type karo..."
                className="flex-1 rounded-full px-4 py-2.5 focus:outline-none text-sm text-slate-800" />
              <button type="submit" disabled={!input.trim()}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                  input.trim() ? 'bg-[#128C7E] text-white shadow-md' : 'bg-[#128C7E]/50 text-white/50 cursor-not-allowed'
                }`}>
                <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform focus:outline-none">
        {!isOpen && trackedClaims.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-slate-950 animate-pulse">{trackedClaims.length}</span>
        )}
        {!isOpen && trackedClaims.length === 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-slate-950">1</span>
        )}
        <MessageCircle size={28} className={isOpen ? 'opacity-0 absolute' : 'opacity-100 transition-opacity'} />
        <X size={28} className={isOpen ? 'opacity-100 transition-opacity' : 'opacity-0 absolute'} />
      </button>
    </div>
  );
}
