import { useState, useEffect, useRef, useCallback } from "react";

const C = { bg:"#FFF9F0", primary:"#FF6B6B", secondary:"#4ECDC4", accent:"#FFE66D", purple:"#A78BFA", green:"#6BCB77", orange:"#FF9F1C", dark:"#2D3436" };

const speak = (text, rate=0.85, pitch=1.1) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate; u.pitch = pitch; u.volume = 1;
  window.speechSynthesis.speak(u);
};

// ── DATA ──────────────────────────────────────────────────────────────────────
const PHONICS = [
  { letter:"A", word:"Apple", emoji:"🍎", color:"#FF6B6B" },
  { letter:"B", word:"Ball", emoji:"⚽", color:"#4ECDC4" },
  { letter:"C", word:"Cat", emoji:"🐱", color:"#FFE66D" },
  { letter:"D", word:"Dog", emoji:"🐶", color:"#A78BFA" },
  { letter:"E", word:"Elephant", emoji:"🐘", color:"#6BCB77" },
  { letter:"F", word:"Fish", emoji:"🐟", color:"#FF9F1C" },
  { letter:"G", word:"Goat", emoji:"🐐", color:"#FF6B6B" },
  { letter:"H", word:"Hat", emoji:"🎩", color:"#4ECDC4" },
  { letter:"I", word:"Igloo", emoji:"🏠", color:"#FFE66D" },
  { letter:"J", word:"Jug", emoji:"🫙", color:"#A78BFA" },
  { letter:"K", word:"Kite", emoji:"🪁", color:"#6BCB77" },
  { letter:"L", word:"Lion", emoji:"🦁", color:"#FF9F1C" },
  { letter:"M", word:"Moon", emoji:"🌙", color:"#FF6B6B" },
  { letter:"N", word:"Nest", emoji:"🪺", color:"#4ECDC4" },
  { letter:"O", word:"Orange", emoji:"🍊", color:"#FFE66D" },
  { letter:"P", word:"Pig", emoji:"🐷", color:"#A78BFA" },
  { letter:"Q", word:"Queen", emoji:"👑", color:"#6BCB77" },
  { letter:"R", word:"Rain", emoji:"🌧️", color:"#FF9F1C" },
  { letter:"S", word:"Sun", emoji:"☀️", color:"#FF6B6B" },
  { letter:"T", word:"Tree", emoji:"🌳", color:"#4ECDC4" },
  { letter:"U", word:"Umbrella", emoji:"☂️", color:"#FFE66D" },
  { letter:"V", word:"Van", emoji:"🚐", color:"#A78BFA" },
  { letter:"W", word:"Worm", emoji:"🪱", color:"#6BCB77" },
  { letter:"X", word:"X-ray", emoji:"🦴", color:"#FF9F1C" },
  { letter:"Y", word:"Yarn", emoji:"🧶", color:"#FF6B6B" },
  { letter:"Z", word:"Zebra", emoji:"🦓", color:"#4ECDC4" },
];

const SIGHT_WORDS = [
  // Dolch Pre-Primer
  { word:"the",    sentence:"The cat sat on the mat.",           emoji:"📖" },
  { word:"and",    sentence:"A cat and a dog play.",             emoji:"🐱🐶" },
  { word:"a",      sentence:"I see a big red ball.",             emoji:"🔴" },
  { word:"I",      sentence:"I love to read books!",             emoji:"📚" },
  { word:"it",     sentence:"It is a funny cat.",                emoji:"🐱" },
  { word:"in",     sentence:"The fish is in the pond.",          emoji:"🐟" },
  { word:"is",     sentence:"The sun is hot today.",             emoji:"☀️" },
  { word:"my",     sentence:"That is my yellow hat.",            emoji:"🎩" },
  { word:"go",     sentence:"Go run and jump high!",             emoji:"🏃" },
  { word:"up",     sentence:"Look up at the big sky.",           emoji:"☁️" },
  { word:"see",    sentence:"I see a bright moon.",              emoji:"🌙" },
  { word:"can",    sentence:"I can hop like a frog.",            emoji:"🐸" },
  { word:"we",     sentence:"We like to play outside.",          emoji:"👫" },
  { word:"he",     sentence:"He has a toy car.",                 emoji:"🚗" },
  { word:"she",    sentence:"She can sing a song.",              emoji:"🎵" },
  { word:"at",     sentence:"Look at the big dog!",              emoji:"🐶" },
  { word:"away",   sentence:"The bird flew away fast.",          emoji:"🐦" },
  { word:"big",    sentence:"That is a big elephant!",           emoji:"🐘" },
  { word:"blue",   sentence:"The sky is bright blue.",           emoji:"🌊" },
  { word:"come",   sentence:"Come and play with me!",            emoji:"🤝" },
  { word:"down",   sentence:"Roll the ball down the hill.",      emoji:"⛰️" },
  { word:"find",   sentence:"Can you find the star?",            emoji:"⭐" },
  { word:"for",    sentence:"This cake is for you!",             emoji:"🎂" },
  { word:"funny",  sentence:"The silly clown is funny!",         emoji:"🤡" },
  { word:"help",   sentence:"I will help you build it.",         emoji:"🔨" },
  { word:"here",   sentence:"Come sit here with me.",            emoji:"👋" },
  { word:"jump",   sentence:"I can jump very high!",             emoji:"🏃" },
  { word:"little", sentence:"A little bird sat on a branch.",    emoji:"🐦" },
  { word:"look",   sentence:"Look at the big red barn!",         emoji:"🏠" },
  { word:"make",   sentence:"Let us make a yummy cake!",         emoji:"🎂" },
  { word:"me",     sentence:"Can you see me over here?",         emoji:"👋" },
  { word:"not",    sentence:"I am not sleepy yet!",              emoji:"😤" },
  { word:"one",    sentence:"I have one red apple.",             emoji:"🍎" },
  { word:"play",   sentence:"Let us play in the park!",          emoji:"🛝" },
  { word:"red",    sentence:"I love the big red apple.",         emoji:"🍎" },
  { word:"run",    sentence:"I can run very fast!",              emoji:"🏃" },
  { word:"said",   sentence:"She said hello to the dog.",        emoji:"💬" },
  { word:"three",  sentence:"I see three little birds.",         emoji:"🐦" },
  { word:"to",     sentence:"I walk to school each day.",        emoji:"🏫" },
  { word:"two",    sentence:"I have two big hands.",             emoji:"👐" },
  { word:"where",  sentence:"Where is my little hat?",           emoji:"🎩" },
  { word:"yellow", sentence:"I see a yellow sun.",               emoji:"☀️" },
  { word:"you",    sentence:"I like you, my friend!",            emoji:"🤗" },
  // Dolch Primer
  { word:"all",    sentence:"We all love to read books!",        emoji:"📚" },
  { word:"am",     sentence:"I am a happy child.",               emoji:"😊" },
  { word:"are",    sentence:"You are my best friend!",           emoji:"💕" },
  { word:"be",     sentence:"I want to be a doctor!",            emoji:"👩‍⚕️" },
  { word:"but",    sentence:"I like cats but love dogs!",        emoji:"🐱" },
  { word:"came",   sentence:"The puppy came to my house.",       emoji:"🐶" },
  { word:"did",    sentence:"Did you see the rainbow?",          emoji:"🌈" },
  { word:"do",     sentence:"What do you want to eat?",          emoji:"🍽️" },
  { word:"eat",    sentence:"I eat a yummy apple.",              emoji:"🍎" },
  { word:"four",   sentence:"I see four pretty stars!",          emoji:"🌟" },
  { word:"get",    sentence:"Let us get some ice cream!",        emoji:"🍦" },
  { word:"good",   sentence:"You did a good job today!",         emoji:"👍" },
  { word:"have",   sentence:"I have a pet fish.",                emoji:"🐟" },
  { word:"like",   sentence:"I like to jump and run!",           emoji:"🏃" },
  { word:"no",     sentence:"No, the cat is not here!",          emoji:"🙅" },
  { word:"now",    sentence:"Let us start reading now!",         emoji:"📖" },
  { word:"on",     sentence:"The cat is on the soft mat.",       emoji:"🐱" },
  { word:"our",    sentence:"Our dog loves to play fetch!",      emoji:"🐶" },
  { word:"out",    sentence:"The cat ran out the door.",         emoji:"🚪" },
  { word:"that",   sentence:"That is a big fluffy cloud!",       emoji:"☁️" },
];

const STORIES = [
  { title:"The Big Red Hen", emoji:"🐔", color:"#FF6B6B", level:1,
    pages:[ { text:"A big red hen sat on a mat.", emojis:"🐔🟥" }, { text:"The hen can run and hop fast.", emojis:"🐔💨" }, { text:"She sat on a little egg.", emojis:"🐔🥚" }, { text:"Tap, tap! A chick came out!", emojis:"🐣✨" }, { text:"The hen and chick ran off together.", emojis:"🐔🐥🌿" } ] },
  { title:"Sam and the Cat", emoji:"🐱", color:"#4ECDC4", level:1,
    pages:[ { text:"Sam has a big fat cat.", emojis:"👦🐱" }, { text:"The cat sat on a soft mat.", emojis:"🐱🟫" }, { text:"Sam and the cat ran outside.", emojis:"👦🐱💨" }, { text:"The cat got a big fish!", emojis:"🐱🐟⭐" }, { text:"Sam and the cat are very happy!", emojis:"👦🐱😊" } ] },
  { title:"The Sun and Rain", emoji:"🌈", color:"#A78BFA", level:1,
    pages:[ { text:"The sun is up and very hot.", emojis:"☀️🔥" }, { text:"Dark clouds came rolling in.", emojis:"☁️🌫️" }, { text:"The rain came pouring down fast.", emojis:"🌧️💧" }, { text:"A little frog hops in the rain.", emojis:"🐸🌧️" }, { text:"Sun and rain make a big rainbow!", emojis:"🌈✨🌟" } ] },
  { title:"The Lost Dog", emoji:"🐶", color:"#FF9F1C", level:2,
    pages:[ { text:"A small brown dog ran away.", emojis:"🐶🏃" }, { text:"The dog ran past the big park.", emojis:"🐶🌳" }, { text:"He sniffed and sniffed the ground.", emojis:"🐶👃" }, { text:"A kind girl saw the lost dog.", emojis:"👧🐶" }, { text:"She gave him a hug and took him home.", emojis:"👧🐶🏠💕" } ] },
  { title:"The Little Seed", emoji:"🌱", color:"#6BCB77", level:2,
    pages:[ { text:"A tiny seed sat in dark soil.", emojis:"🌱🟫" }, { text:"Rain and sunshine helped it grow.", emojis:"☀️🌧️" }, { text:"A small green shoot came up.", emojis:"🌿💚" }, { text:"Leaves and buds began to appear.", emojis:"🍃🌸" }, { text:"A beautiful flower bloomed at last!", emojis:"🌻✨🎉" } ] },
  { title:"Night Sky Adventure", emoji:"🚀", color:"#2D3436", level:3,
    pages:[ { text:"Leo and Zara got into the rocket.", emojis:"👦👧🚀" }, { text:"They zoomed past the bright moon.", emojis:"🚀🌙⭐" }, { text:"Stars twinkled all around them.", emojis:"🌟💫✨" }, { text:"They landed on a glowing planet.", emojis:"🚀🪐🌟" }, { text:"They waved goodbye and flew back home.", emojis:"👋🚀🏠🌍" } ] },
];

const QUIZ_QUESTIONS = [
  { q:"What sound does 'B' make?", opts:["buh","duh","puh","wuh"], ans:0, emoji:"⚽" },
  { q:"Which word rhymes with 'cat'?", opts:["dog","hat","sun","big"], ans:1, emoji:"🎩" },
  { q:"What sound does 'S' make?", opts:["zzz","tuh","sss","mmm"], ans:2, emoji:"☀️" },
  { q:"Which word starts with 'F'?", opts:["dog","cat","fish","hen"], ans:2, emoji:"🐟" },
  { q:"What comes after 'A B C'?", opts:["E","D","F","G"], ans:1, emoji:"🔤" },
  { q:"Which word rhymes with 'sun'?", opts:["hat","run","big","cat"], ans:1, emoji:"☀️" },
  { q:"What sound does 'M' make?", opts:["nnn","mmm","buh","lll"], ans:1, emoji:"🌙" },
  { q:"Which word starts with 'D'?", opts:["cat","frog","dog","hen"], ans:2, emoji:"🐶" },
  { q:"Which word rhymes with 'big'?", opts:["cat","pig","sun","hop"], ans:1, emoji:"🐷" },
  { q:"What sound does 'T' make?", opts:["duh","kuh","tuh","sss"], ans:2, emoji:"🌳" },
  { q:"Which word starts with 'H'?", opts:["mat","hat","rat","bat"], ans:1, emoji:"🎩" },
  { q:"Which word rhymes with 'hop'?", opts:["cat","run","top","big"], ans:2, emoji:"🐸" },
];

// ── WORD BUILDER DATA ─────────────────────────────────────────────────────────
const WORD_GROUPS = [
  { category:"Animals", emoji:"🐾", color:"#FF6B6B", words:[
    { word:"CAT", emoji:"🐱", hint:"A furry pet that meows" },
    { word:"DOG", emoji:"🐶", hint:"Man's best friend" },
    { word:"HEN", emoji:"🐔", hint:"A farm bird that clucks" },
    { word:"PIG", emoji:"🐷", hint:"A pink farm animal" },
    { word:"COW", emoji:"🐮", hint:"Gives us milk" },
    { word:"BEE", emoji:"🐝", hint:"Makes honey and buzzes" },
    { word:"FOX", emoji:"🦊", hint:"A clever orange animal" },
    { word:"OWL", emoji:"🦉", hint:"A wise night bird" },
  ]},
  { category:"Things", emoji:"🧸", color:"#4ECDC4", words:[
    { word:"BAT", emoji:"🏏", hint:"You hit a ball with it" },
    { word:"BUS", emoji:"🚌", hint:"A big vehicle for people" },
    { word:"CUP", emoji:"☕", hint:"You drink from it" },
    { word:"HAT", emoji:"🎩", hint:"You wear it on your head" },
    { word:"MAP", emoji:"🗺️", hint:"Shows you where to go" },
    { word:"NET", emoji:"🥅", hint:"Used to catch things" },
    { word:"POT", emoji:"🪴", hint:"Plants grow in it" },
    { word:"JAR", emoji:"🫙", hint:"Has a lid, holds food" },
  ]},
  { category:"Actions", emoji:"⚡", color:"#A78BFA", words:[
    { word:"RUN", emoji:"🏃", hint:"Move very fast on feet" },
    { word:"HOP", emoji:"🐸", hint:"Jump on one foot" },
    { word:"SIT", emoji:"🪑", hint:"Rest on a chair" },
    { word:"DIG", emoji:"⛏️", hint:"Move dirt with a tool" },
    { word:"NAP", emoji:"😴", hint:"A short sleep" },
    { word:"WET", emoji:"💧", hint:"Not dry" },
    { word:"CUT", emoji:"✂️", hint:"Use scissors to do this" },
    { word:"MIX", emoji:"🥣", hint:"Stir things together" },
  ]},
  { category:"Nature", emoji:"🌿", color:"#6BCB77", words:[
    { word:"SUN", emoji:"☀️", hint:"Bright star in the sky" },
    { word:"MUD", emoji:"🟫", hint:"Wet, dirty earth" },
    { word:"ICE", emoji:"🧊", hint:"Frozen water" },
    { word:"LOG", emoji:"🪵", hint:"A piece of a tree" },
    { word:"BUD", emoji:"🌸", hint:"A flower before it opens" },
    { word:"DEW", emoji:"💧", hint:"Morning drops on grass" },
    { word:"WEB", emoji:"🕸️", hint:"A spider makes this" },
    { word:"GEM", emoji:"💎", hint:"A shiny precious stone" },
  ]},
  { category:"Food", emoji:"🍎", color:"#FF9F1C", words:[
    { word:"EGG", emoji:"🥚", hint:"Hens lay these" },
    { word:"JAM", emoji:"🍇", hint:"Sweet spread on bread" },
    { word:"HAM", emoji:"🥩", hint:"A salty pink meat" },
    { word:"NUT", emoji:"🥜", hint:"A crunchy seed you eat" },
    { word:"BUN", emoji:"🍞", hint:"A soft round bread roll" },
    { word:"YAM", emoji:"🍠", hint:"An orange root vegetable" },
    { word:"PEA", emoji:"🫛", hint:"A tiny round green veggie" },
    { word:"FIG", emoji:"🍇", hint:"A sweet purple fruit" },
  ]},
  { category:"Body", emoji:"🫁", color:"#F72585", words:[
    { word:"ARM", emoji:"💪", hint:"Connects hand to shoulder" },
    { word:"LEG", emoji:"🦵", hint:"You walk on two of these" },
    { word:"EAR", emoji:"👂", hint:"You hear with this" },
    { word:"EYE", emoji:"👁️", hint:"You see with this" },
    { word:"LIP", emoji:"💋", hint:"Part of your mouth" },
    { word:"RIB", emoji:"🦴", hint:"A bone in your chest" },
    { word:"HIP", emoji:"🕺", hint:"Side part of your body" },
    { word:"TOE", emoji:"🦶", hint:"A small part of your foot" },
  ]},
];

const LETTER_COLORS = ["#FF6B6B","#4ECDC4","#FFE66D","#A78BFA","#6BCB77","#FF9F1C","#F8A4D8","#89CFF0"];

// ── GUIDED TRACING PATHS ──────────────────────────────────────────────────────
const LETTER_PATHS = {
  A:[{x:140,y:20},{x:80,y:180},{x:200,y:180},{x:110,y:110},{x:170,y:110}],
  B:[{x:80,y:20},{x:80,y:180},{x:80,y:20},{x:170,y:55},{x:80,y:100},{x:170,y:145},{x:80,y:180}],
  C:[{x:190,y:50},{x:130,y:20},{x:80,y:70},{x:80,y:140},{x:130,y:180},{x:190,y:155}],
  D:[{x:80,y:20},{x:80,y:180},{x:80,y:20},{x:160,y:60},{x:190,y:100},{x:160,y:150},{x:80,y:180}],
  E:[{x:180,y:20},{x:80,y:20},{x:80,y:100},{x:160,y:100},{x:80,y:100},{x:80,y:180},{x:180,y:180}],
  F:[{x:180,y:20},{x:80,y:20},{x:80,y:100},{x:160,y:100},{x:80,y:100},{x:80,y:180}],
  G:[{x:190,y:50},{x:130,y:20},{x:80,y:70},{x:80,y:140},{x:130,y:180},{x:190,y:150},{x:190,y:110},{x:150,y:110}],
  H:[{x:80,y:20},{x:80,y:180},{x:80,y:100},{x:200,y:100},{x:200,y:180},{x:200,y:20}],
  I:[{x:100,y:20},{x:180,y:20},{x:140,y:20},{x:140,y:180},{x:100,y:180},{x:180,y:180}],
  J:[{x:100,y:20},{x:180,y:20},{x:160,y:20},{x:160,y:150},{x:130,y:180},{x:90,y:158}],
  K:[{x:80,y:20},{x:80,y:180},{x:80,y:100},{x:190,y:20},{x:80,y:100},{x:190,y:180}],
  L:[{x:80,y:20},{x:80,y:180},{x:190,y:180}],
  M:[{x:70,y:180},{x:70,y:20},{x:140,y:100},{x:210,y:20},{x:210,y:180}],
  N:[{x:80,y:180},{x:80,y:20},{x:200,y:180},{x:200,y:20}],
  O:[{x:140,y:20},{x:80,y:60},{x:70,y:100},{x:80,y:150},{x:140,y:180},{x:200,y:150},{x:210,y:100},{x:200,y:60},{x:140,y:20}],
  P:[{x:80,y:20},{x:80,y:180},{x:80,y:20},{x:170,y:55},{x:80,y:100}],
  Q:[{x:140,y:20},{x:80,y:60},{x:70,y:100},{x:80,y:150},{x:140,y:180},{x:200,y:150},{x:210,y:100},{x:200,y:60},{x:140,y:20},{x:165,y:160},{x:200,y:188}],
  R:[{x:80,y:20},{x:80,y:180},{x:80,y:20},{x:170,y:55},{x:80,y:100},{x:190,y:180}],
  S:[{x:190,y:50},{x:130,y:20},{x:80,y:55},{x:140,y:100},{x:190,y:148},{x:140,y:180},{x:80,y:158}],
  T:[{x:80,y:20},{x:200,y:20},{x:140,y:20},{x:140,y:180}],
  U:[{x:80,y:20},{x:80,y:150},{x:140,y:180},{x:200,y:150},{x:200,y:20}],
  V:[{x:80,y:20},{x:140,y:180},{x:200,y:20}],
  W:[{x:70,y:20},{x:100,y:180},{x:140,y:110},{x:180,y:180},{x:210,y:20}],
  X:[{x:80,y:20},{x:200,y:180},{x:140,y:100},{x:80,y:180},{x:200,y:20}],
  Y:[{x:80,y:20},{x:140,y:100},{x:200,y:20},{x:140,y:100},{x:140,y:180}],
  Z:[{x:80,y:20},{x:200,y:20},{x:80,y:180},{x:200,y:180}],
};

// ── SYLLABLE WORDS ────────────────────────────────────────────────────────────
const SYLLABLE_WORDS = [
  {word:"cat",syllables:1,parts:["cat"],emoji:"🐱"},
  {word:"dog",syllables:1,parts:["dog"],emoji:"🐶"},
  {word:"sun",syllables:1,parts:["sun"],emoji:"☀️"},
  {word:"fish",syllables:1,parts:["fish"],emoji:"🐟"},
  {word:"bird",syllables:1,parts:["bird"],emoji:"🐦"},
  {word:"apple",syllables:2,parts:["ap","ple"],emoji:"🍎"},
  {word:"rabbit",syllables:2,parts:["rab","bit"],emoji:"🐰"},
  {word:"monkey",syllables:2,parts:["mon","key"],emoji:"🐵"},
  {word:"happy",syllables:2,parts:["hap","py"],emoji:"😊"},
  {word:"pencil",syllables:2,parts:["pen","cil"],emoji:"✏️"},
  {word:"rainbow",syllables:2,parts:["rain","bow"],emoji:"🌈"},
  {word:"banana",syllables:3,parts:["ba","na","na"],emoji:"🍌"},
  {word:"elephant",syllables:3,parts:["el","e","phant"],emoji:"🐘"},
  {word:"umbrella",syllables:3,parts:["um","brel","la"],emoji:"☂️"},
  {word:"butterfly",syllables:3,parts:["but","ter","fly"],emoji:"🦋"},
  {word:"dinosaur",syllables:3,parts:["di","no","saur"],emoji:"🦕"},
  {word:"computer",syllables:3,parts:["com","pu","ter"],emoji:"💻"},
  {word:"caterpillar",syllables:4,parts:["cat","er","pil","lar"],emoji:"🐛"},
  {word:"helicopter",syllables:4,parts:["hel","i","cop","ter"],emoji:"🚁"},
  {word:"watermelon",syllables:4,parts:["wa","ter","mel","on"],emoji:"🍉"},
  {word:"alligator",syllables:4,parts:["al","li","ga","tor"],emoji:"🐊"},
];

// ── WORD SORTING ROUNDS ───────────────────────────────────────────────────────
const SORT_ROUNDS = [
  { categories:["Animal 🐾","Thing 🧸"], colors:["#FF6B6B","#4ECDC4"],
    words:[{word:"cat",emoji:"🐱",cat:0},{word:"bus",emoji:"🚌",cat:1},{word:"dog",emoji:"🐶",cat:0},{word:"hat",emoji:"🎩",cat:1},{word:"pig",emoji:"🐷",cat:0},{word:"cup",emoji:"☕",cat:1},{word:"hen",emoji:"🐔",cat:0},{word:"bag",emoji:"👜",cat:1}]},
  { categories:["Can Fly ✈️","Can Swim 🏊"], colors:["#A78BFA","#0097A7"],
    words:[{word:"bird",emoji:"🐦",cat:0},{word:"fish",emoji:"🐟",cat:1},{word:"bee",emoji:"🐝",cat:0},{word:"seal",emoji:"🦭",cat:1},{word:"bat",emoji:"🦇",cat:0},{word:"frog",emoji:"🐸",cat:1},{word:"owl",emoji:"🦉",cat:0},{word:"shark",emoji:"🦈",cat:1}]},
  { categories:["Hot 🔥","Cold ❄️"], colors:["#FF9F1C","#89CFF0"],
    words:[{word:"sun",emoji:"☀️",cat:0},{word:"ice",emoji:"🧊",cat:1},{word:"fire",emoji:"🔥",cat:0},{word:"snow",emoji:"❄️",cat:1},{word:"soup",emoji:"🍲",cat:0},{word:"frost",emoji:"🌨️",cat:1},{word:"oven",emoji:"♨️",cat:0},{word:"pole",emoji:"🧊",cat:1}]},
  { categories:["Big 🐘","Small 🐜"], colors:["#FF6B6B","#6BCB77"],
    words:[{word:"whale",emoji:"🐳",cat:0},{word:"ant",emoji:"🐜",cat:1},{word:"tree",emoji:"🌳",cat:0},{word:"bug",emoji:"🐛",cat:1},{word:"truck",emoji:"🚛",cat:0},{word:"seed",emoji:"🌱",cat:1},{word:"house",emoji:"🏠",cat:0},{word:"pin",emoji:"📌",cat:1}]},
  { categories:["Food 🍎","Not Food 🪑"], colors:["#6BCB77","#A78BFA"],
    words:[{word:"apple",emoji:"🍎",cat:0},{word:"chair",emoji:"🪑",cat:1},{word:"bread",emoji:"🍞",cat:0},{word:"book",emoji:"📚",cat:1},{word:"milk",emoji:"🥛",cat:0},{word:"shoe",emoji:"👟",cat:1},{word:"egg",emoji:"🥚",cat:0},{word:"pen",emoji:"✏️",cat:1}]},
  { categories:["Indoors 🏠","Outdoors 🌳"], colors:["#F8A4D8","#6BCB77"],
    words:[{word:"sofa",emoji:"🛋️",cat:0},{word:"tree",emoji:"🌳",cat:1},{word:"lamp",emoji:"💡",cat:0},{word:"rock",emoji:"🪨",cat:1},{word:"bed",emoji:"🛏️",cat:0},{word:"cloud",emoji:"☁️",cat:1},{word:"sink",emoji:"🚰",cat:0},{word:"flower",emoji:"🌸",cat:1}]},
];

// ── MEMORY WORDS ──────────────────────────────────────────────────────────────
const MEMORY_WORDS = {
  easy:[
    {word:"cat",emoji:"🐱"},{word:"dog",emoji:"🐶"},{word:"sun",emoji:"☀️"},
    {word:"hen",emoji:"🐔"},{word:"pig",emoji:"🐷"},{word:"bug",emoji:"🐛"},
    {word:"hat",emoji:"🎩"},{word:"cup",emoji:"☕"},{word:"map",emoji:"🗺️"},
    {word:"web",emoji:"🕸️"},{word:"pot",emoji:"🪴"},{word:"fox",emoji:"🦊"},
    {word:"bat",emoji:"🦇"},{word:"log",emoji:"🪵"},{word:"pen",emoji:"✏️"},
  ],
  hard:[
    {word:"frog",emoji:"🐸"},{word:"ship",emoji:"🚢"},{word:"drum",emoji:"🥁"},
    {word:"flag",emoji:"🚩"},{word:"crab",emoji:"🦀"},{word:"plug",emoji:"🔌"},
    {word:"kite",emoji:"🪁"},{word:"fish",emoji:"🐟"},{word:"nest",emoji:"🪺"},
    {word:"lamp",emoji:"💡"},{word:"milk",emoji:"🥛"},{word:"ring",emoji:"💍"},
    {word:"wolf",emoji:"🐺"},{word:"swan",emoji:"🦢"},{word:"sled",emoji:"🛷"},
  ],
};

const WORD_FAMILIES = [
  { family:"-at", color:"#FF6B6B", words:[
    {word:"cat",letter:"C",emoji:"🐱"},{word:"bat",letter:"B",emoji:"🦇"},
    {word:"hat",letter:"H",emoji:"🎩"},{word:"mat",letter:"M",emoji:"🟫"},
    {word:"rat",letter:"R",emoji:"🐭"},{word:"fat",letter:"F",emoji:"🍔"},
    {word:"sat",letter:"S",emoji:"🪑"},
  ]},
  { family:"-an", color:"#4ECDC4", words:[
    {word:"can",letter:"C",emoji:"🥫"},{word:"fan",letter:"F",emoji:"🌀"},
    {word:"man",letter:"M",emoji:"👨"},{word:"pan",letter:"P",emoji:"🍳"},
    {word:"ran",letter:"R",emoji:"🏃"},{word:"van",letter:"V",emoji:"🚐"},
  ]},
  { family:"-ig", color:"#A78BFA", words:[
    {word:"big",letter:"B",emoji:"🐘"},{word:"dig",letter:"D",emoji:"⛏️"},
    {word:"fig",letter:"F",emoji:"🍇"},{word:"jig",letter:"J",emoji:"💃"},
    {word:"pig",letter:"P",emoji:"🐷"},{word:"wig",letter:"W",emoji:"👩‍🦰"},
  ]},
  { family:"-og", color:"#FF9F1C", words:[
    {word:"dog",letter:"D",emoji:"🐶"},{word:"fog",letter:"F",emoji:"🌫️"},
    {word:"hog",letter:"H",emoji:"🐗"},{word:"log",letter:"L",emoji:"🪵"},
    {word:"bog",letter:"B",emoji:"🌿"},
  ]},
  { family:"-un", color:"#6BCB77", words:[
    {word:"bun",letter:"B",emoji:"🍞"},{word:"fun",letter:"F",emoji:"🎉"},
    {word:"run",letter:"R",emoji:"🏃"},{word:"sun",letter:"S",emoji:"☀️"},
    {word:"gun",letter:"G",emoji:"🎯"},
  ]},
  { family:"-ip", color:"#F72585", words:[
    {word:"dip",letter:"D",emoji:"💧"},{word:"hip",letter:"H",emoji:"🕺"},
    {word:"lip",letter:"L",emoji:"💋"},{word:"rip",letter:"R",emoji:"✂️"},
    {word:"sip",letter:"S",emoji:"🥤"},{word:"tip",letter:"T",emoji:"💡"},
  ]},
];

const BLEND_WORDS = [
  // Short A
  {sounds:["c","a","t"],word:"CAT",emoji:"🐱",opts:["CAT","DOG","HAT","CAN"]},
  {sounds:["h","a","t"],word:"HAT",emoji:"🎩",opts:["BAT","CAT","HAT","MAT"]},
  {sounds:["b","a","t"],word:"BAT",emoji:"🦇",opts:["CAT","BAT","MAT","SAT"]},
  {sounds:["r","a","t"],word:"RAT",emoji:"🐭",opts:["RAT","MAT","SAT","BAT"]},
  {sounds:["j","a","m"],word:"JAM",emoji:"🍇",opts:["HAM","YAM","RAM","JAM"]},
  {sounds:["f","a","n"],word:"FAN",emoji:"🌀",opts:["FAN","CAN","PAN","RAN"]},
  {sounds:["m","a","n"],word:"MAN",emoji:"👨",opts:["CAN","PAN","MAN","VAN"]},
  {sounds:["v","a","n"],word:"VAN",emoji:"🚐",opts:["CAN","VAN","FAN","MAN"]},
  {sounds:["b","a","g"],word:"BAG",emoji:"🎒",opts:["BAG","TAG","RAG","NAG"]},
  {sounds:["c","a","p"],word:"CAP",emoji:"🧢",opts:["MAP","TAP","CAP","NAP"]},
  {sounds:["n","a","p"],word:"NAP",emoji:"😴",opts:["NAP","MAP","CAP","TAP"]},
  {sounds:["s","a","d"],word:"SAD",emoji:"😢",opts:["MAD","BAD","SAD","DAD"]},
  // Short E
  {sounds:["h","e","n"],word:"HEN",emoji:"🐔",opts:["TEN","PEN","HEN","MEN"]},
  {sounds:["w","e","b"],word:"WEB",emoji:"🕸️",opts:["BED","RED","WEB","FED"]},
  {sounds:["t","e","n"],word:"TEN",emoji:"🔟",opts:["HEN","TEN","PEN","MEN"]},
  {sounds:["p","e","n"],word:"PEN",emoji:"✏️",opts:["TEN","HEN","PEN","BED"]},
  {sounds:["b","e","d"],word:"BED",emoji:"🛏️",opts:["RED","BED","FED","LED"]},
  {sounds:["r","e","d"],word:"RED",emoji:"🔴",opts:["BED","RED","FED","PET"]},
  {sounds:["p","e","t"],word:"PET",emoji:"🐾",opts:["PET","SET","WET","NET"]},
  {sounds:["j","e","t"],word:"JET",emoji:"✈️",opts:["NET","JET","SET","WET"]},
  {sounds:["n","e","t"],word:"NET",emoji:"🥅",opts:["JET","NET","SET","MET"]},
  {sounds:["w","e","t"],word:"WET",emoji:"💧",opts:["WET","PET","NET","SET"]},
  // Short I
  {sounds:["p","i","g"],word:"PIG",emoji:"🐷",opts:["BIG","DIG","PIG","JIG"]},
  {sounds:["d","i","g"],word:"DIG",emoji:"⛏️",opts:["BIG","DIG","FIG","JIG"]},
  {sounds:["w","i","g"],word:"WIG",emoji:"👩‍🦰",opts:["BIG","WIG","DIG","FIG"]},
  {sounds:["d","i","p"],word:"DIP",emoji:"💧",opts:["DIP","HIP","LIP","TIP"]},
  {sounds:["l","i","p"],word:"LIP",emoji:"💋",opts:["DIP","LIP","HIP","SIP"]},
  {sounds:["t","i","n"],word:"TIN",emoji:"🥫",opts:["TIN","BIN","WIN","PIN"]},
  {sounds:["s","i","t"],word:"SIT",emoji:"🪑",opts:["SIT","HIT","BIT","KIT"]},
  {sounds:["h","i","t"],word:"HIT",emoji:"🏏",opts:["HIT","SIT","BIT","KIT"]},
  {sounds:["w","i","n"],word:"WIN",emoji:"🏆",opts:["WIN","TIN","BIN","FIN"]},
  // Short O
  {sounds:["d","o","g"],word:"DOG",emoji:"🐶",opts:["CAT","DOG","HOG","DIG"]},
  {sounds:["f","o","x"],word:"FOX",emoji:"🦊",opts:["BOX","FOX","SOX","COT"]},
  {sounds:["l","o","g"],word:"LOG",emoji:"🪵",opts:["HOG","FOG","DOG","LOG"]},
  {sounds:["b","o","x"],word:"BOX",emoji:"📦",opts:["BOX","FOX","SOX","COX"]},
  {sounds:["h","o","p"],word:"HOP",emoji:"🐸",opts:["HOP","MOP","TOP","POP"]},
  {sounds:["m","o","p"],word:"MOP",emoji:"🧹",opts:["MOP","HOP","TOP","POP"]},
  {sounds:["t","o","p"],word:"TOP",emoji:"🌀",opts:["TOP","HOP","MOP","POP"]},
  {sounds:["h","o","t"],word:"HOT",emoji:"🌶️",opts:["HOT","POT","DOT","LOT"]},
  {sounds:["h","o","g"],word:"HOG",emoji:"🐗",opts:["HOG","DOG","FOG","LOG"]},
  // Short U
  {sounds:["s","u","n"],word:"SUN",emoji:"☀️",opts:["RUN","BUN","FUN","SUN"]},
  {sounds:["b","u","g"],word:"BUG",emoji:"🐛",opts:["RUG","MUG","BUG","JUG"]},
  {sounds:["c","u","p"],word:"CUP",emoji:"☕",opts:["CUP","PUP","TUB","RUB"]},
  {sounds:["h","u","g"],word:"HUG",emoji:"🤗",opts:["HUG","MUG","RUG","JUG"]},
  {sounds:["m","u","g"],word:"MUG",emoji:"☕",opts:["MUG","HUG","RUG","BUG"]},
  {sounds:["r","u","g"],word:"RUG",emoji:"🟫",opts:["RUG","MUG","HUG","JUG"]},
  {sounds:["b","u","n"],word:"BUN",emoji:"🍞",opts:["BUN","FUN","RUN","SUN"]},
  {sounds:["f","u","n"],word:"FUN",emoji:"🎉",opts:["FUN","BUN","RUN","SUN"]},
  {sounds:["p","u","p"],word:"PUP",emoji:"🐶",opts:["PUP","CUP","TUB","RUB"]},
  {sounds:["n","u","t"],word:"NUT",emoji:"🥜",opts:["NUT","CUT","GUT","HUT"]},
  {sounds:["c","u","t"],word:"CUT",emoji:"✂️",opts:["CUT","NUT","GUT","HUT"]},
];

const MISSING_WORDS = [
  // Short A
  {word:"CAT",blank:1,emoji:"🐱",hint:"A furry pet that meows"},
  {word:"HAT",blank:1,emoji:"🎩",hint:"Worn on your head"},
  {word:"BAT",blank:1,emoji:"🦇",hint:"A flying animal at night"},
  {word:"MAT",blank:1,emoji:"🟫",hint:"You wipe your feet on it"},
  {word:"RAT",blank:1,emoji:"🐭",hint:"A small furry rodent"},
  {word:"JAM",blank:1,emoji:"🍇",hint:"Sweet spread on bread"},
  {word:"HAM",blank:1,emoji:"🥩",hint:"A salty pink meat"},
  {word:"MAP",blank:1,emoji:"🗺️",hint:"Shows you where to go"},
  {word:"CAP",blank:1,emoji:"🧢",hint:"Worn on your head like a hat"},
  {word:"NAP",blank:1,emoji:"😴",hint:"A short daytime sleep"},
  {word:"FAN",blank:1,emoji:"🌀",hint:"Keeps you cool"},
  {word:"VAN",blank:1,emoji:"🚐",hint:"A big family car"},
  {word:"BAG",blank:1,emoji:"🎒",hint:"You carry books in it"},
  {word:"SAD",blank:1,emoji:"😢",hint:"How you feel when crying"},
  {word:"DAD",blank:1,emoji:"👨",hint:"Your father"},
  // Short E
  {word:"HEN",blank:1,emoji:"🐔",hint:"A farm bird that clucks"},
  {word:"PEN",blank:1,emoji:"✏️",hint:"Used for writing"},
  {word:"NET",blank:1,emoji:"🥅",hint:"Used to catch things"},
  {word:"BED",blank:1,emoji:"🛏️",hint:"You sleep in it"},
  {word:"RED",blank:1,emoji:"🔴",hint:"The color of fire trucks"},
  {word:"PET",blank:1,emoji:"🐾",hint:"An animal you keep at home"},
  {word:"JET",blank:1,emoji:"✈️",hint:"A very fast airplane"},
  {word:"WET",blank:1,emoji:"💧",hint:"What you get in the rain"},
  {word:"LEG",blank:1,emoji:"🦵",hint:"You walk on two of these"},
  {word:"WEB",blank:1,emoji:"🕸️",hint:"A spider makes this"},
  // Short I
  {word:"PIG",blank:1,emoji:"🐷",hint:"A pink farm animal"},
  {word:"DIG",blank:1,emoji:"⛏️",hint:"Use a shovel to do this"},
  {word:"WIG",blank:1,emoji:"👩‍🦰",hint:"Fake hair you can wear"},
  {word:"DIP",blank:1,emoji:"💧",hint:"Dunk food into sauce"},
  {word:"LIP",blank:1,emoji:"💋",hint:"Part of your mouth"},
  {word:"TIN",blank:1,emoji:"🥫",hint:"A metal can"},
  {word:"BIN",blank:1,emoji:"🗑️",hint:"You throw trash in it"},
  {word:"SIT",blank:1,emoji:"🪑",hint:"What you do on a chair"},
  {word:"HIT",blank:1,emoji:"🏏",hint:"Strike with a bat"},
  {word:"WIN",blank:1,emoji:"🏆",hint:"Come in first place"},
  {word:"FIN",blank:1,emoji:"🐟",hint:"A fish uses this to swim"},
  {word:"BIT",blank:1,emoji:"🍫",hint:"A small piece"},
  // Short O
  {word:"DOG",blank:1,emoji:"🐶",hint:"Man's best friend"},
  {word:"FOX",blank:1,emoji:"🦊",hint:"A clever orange animal"},
  {word:"LOG",blank:1,emoji:"🪵",hint:"A piece of a tree"},
  {word:"BUG",blank:1,emoji:"🐛",hint:"A tiny crawling creature"},
  {word:"POT",blank:1,emoji:"🪴",hint:"Plants grow in it"},
  {word:"BOX",blank:1,emoji:"📦",hint:"Square container with a lid"},
  {word:"HOP",blank:1,emoji:"🐸",hint:"Jump on both feet"},
  {word:"MOP",blank:1,emoji:"🧹",hint:"Used to clean the floor"},
  {word:"TOP",blank:1,emoji:"🌀",hint:"The highest part"},
  {word:"HOT",blank:1,emoji:"🌶️",hint:"The opposite of cold"},
  {word:"HOG",blank:1,emoji:"🐗",hint:"A wild pig"},
  {word:"COB",blank:1,emoji:"🌽",hint:"The middle of corn"},
  // Short U
  {word:"SUN",blank:1,emoji:"☀️",hint:"Shines bright in the sky"},
  {word:"CUP",blank:1,emoji:"☕",hint:"You drink from it"},
  {word:"BUS",blank:1,emoji:"🚌",hint:"Takes you to school"},
  {word:"HUG",blank:1,emoji:"🤗",hint:"Wrap arms around someone"},
  {word:"MUG",blank:1,emoji:"☕",hint:"A big cup with a handle"},
  {word:"RUG",blank:1,emoji:"🟫",hint:"A mat on the floor"},
  {word:"BUN",blank:1,emoji:"🍞",hint:"A soft round bread roll"},
  {word:"FUN",blank:1,emoji:"🎉",hint:"Something enjoyable"},
  {word:"PUP",blank:1,emoji:"🐶",hint:"A baby dog"},
  {word:"NUT",blank:1,emoji:"🥜",hint:"A crunchy seed you eat"},
  {word:"CUT",blank:1,emoji:"✂️",hint:"Use scissors to do this"},
  {word:"MUD",blank:1,emoji:"🟤",hint:"Wet and dirty earth"},
  {word:"GUM",blank:1,emoji:"🫧",hint:"Chewy candy you don't swallow"},
];

const LEVELS = [
  { level:1, name:"Beginner", minStars:0, color:"#6BCB77", emoji:"🌱" },
  { level:2, name:"Explorer", minStars:20, color:"#4ECDC4", emoji:"🌟" },
  { level:3, name:"Reader", minStars:50, color:"#A78BFA", emoji:"📚" },
  { level:4, name:"Star Reader", minStars:100, color:"#FF9F1C", emoji:"🚀" },
  { level:5, name:"Super Star", minStars:200, color:"#FF6B6B", emoji:"🏆" },
];

const getLevel = (s) => [...LEVELS].reverse().find(l=>s>=l.minStars)||LEVELS[0];
const nextLevel = (s) => LEVELS.find(l=>l.minStars>s);

const PHONETICS = {
  A:"ah",  B:"buh", C:"kuh", D:"duh", E:"eh",
  F:"fuh", G:"guh", H:"huh", I:"ih",  J:"juh",
  K:"kuh", L:"luh", M:"muh", N:"nuh", O:"oh",
  P:"puh", Q:"kwuh",R:"ruh", S:"suh", T:"tuh",
  U:"uh",  V:"vuh", W:"wuh", X:"ks",  Y:"yuh", Z:"zuh",
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
const ProgressBar = ({ value, max, color, height=14 }) => (
  <div style={{ background:"#e0e0e0", borderRadius:20, height, overflow:"hidden", width:"100%" }}>
    <div style={{ background:color, width:`${Math.min(100,(value/max)*100)}%`, height:"100%", borderRadius:20, transition:"width 0.6s ease" }}/>
  </div>
);

const Btn = ({ children, onClick, color="#FF6B6B", style={}, disabled=false }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ background:color, border:"none", borderRadius:50, padding:"12px 28px", fontSize:16, fontWeight:900, cursor:disabled?"default":"pointer", color:"#fff", boxShadow:`0 5px 0 ${color}88`, fontFamily:"inherit", opacity:disabled?0.5:1, transition:"transform 0.1s", ...style }}
    onMouseDown={e=>{ if(!disabled) e.currentTarget.style.transform="translateY(3px)"; }}
    onMouseUp={e=>{ e.currentTarget.style.transform=""; }}>
    {children}
  </button>
);

function FloatParticle({ x, y }) {
  const icons = ["⭐","🌟","✨","💫"];
  return <div style={{ position:"fixed", left:x, top:y, fontSize:22, pointerEvents:"none", zIndex:999, animation:"floatUp 1.5s forwards" }}>{icons[Math.floor(Math.random()*icons.length)]}</div>;
}

// ── WORD BUILDER ──────────────────────────────────────────────────────────────
function WordBuilderScreen({ onEarn, progress, onProgress }) {
  const [groupIdx, setGroupIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [placed, setPlaced] = useState([]); // letters placed in slots
  const [bank, setBank] = useState([]);     // shuffled letter tiles in tray
  const [status, setStatus] = useState("idle"); // idle | correct | wrong
  const [showHint, setShowHint] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [particles, setParticles] = useState([]);

  const group = WORD_GROUPS[groupIdx];
  const item = group.words[wordIdx];
  const word = item.word;
  const solved = progress.wordBuilder || {};

  // Init / reset on word change
  useEffect(() => {
    reset();
  }, [groupIdx, wordIdx]);

  const reset = () => {
    setPlaced(Array(word.length).fill(null));
    const letters = word.split("").map((ch, i) => ({ id: i, char: ch, color: LETTER_COLORS[i % LETTER_COLORS.length] }));
    // shuffle
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    setBank(letters);
    setStatus("idle");
    setShowHint(false);
    setCelebrating(false);
  };

  const tapFromBank = (tile) => {
    if (status === "correct") return;
    // find first empty slot
    const slotIdx = placed.findIndex(s => s === null);
    if (slotIdx === -1) return;
    const newPlaced = [...placed];
    newPlaced[slotIdx] = tile;
    setBank(b => b.filter(t => t.id !== tile.id));
    setPlaced(newPlaced);
    speak(tile.char.toLowerCase(), 1.0);
  };

  const tapFromSlot = (slotIdx) => {
    if (status === "correct") return;
    const tile = placed[slotIdx];
    if (!tile) return;
    const newPlaced = [...placed];
    newPlaced[slotIdx] = null;
    setPlaced(newPlaced);
    setBank(b => [...b, tile]);
    setStatus("idle");
  };

  // Auto-check when all slots filled
  useEffect(() => {
    if (placed.every(p => p !== null)) {
      const attempt = placed.map(p => p.char).join("");
      if (attempt === word) {
        setStatus("correct");
        setCelebrating(true);
        speak(`${word.toLowerCase()}! Well done!`, 0.85, 1.2);
        const key = `${group.category}-${word}`;
        const isNew = !solved[key];
        if (isNew) { onEarn(4); onProgress("wordBuilder", key); }
        setParticles(Array.from({length:12},(_,i)=>({id:Date.now()+i,x:20+Math.random()*280,y:40+Math.random()*120})));
        setTimeout(()=>setParticles([]),1600);
      } else {
        setStatus("wrong");
        speak("Not quite! Try again.", 0.85);
      }
    } else {
      if (status === "wrong") setStatus("idle");
    }
  }, [placed]);

  const nextWord = () => setWordIdx(i => (i + 1) % group.words.length);
  const prevWord = () => setWordIdx(i => (i - 1 + group.words.length) % group.words.length);

  const solvedInGroup = group.words.filter(w => solved[`${group.category}-${w.word}`]).length;

  return (
    <div style={{ padding:"16px 16px 20px", textAlign:"center", position:"relative" }}>
      {particles.map(p => <FloatParticle key={p.id} x={p.x} y={p.y}/>)}

      <h2 style={{ color:C.orange, margin:"0 0 4px", fontSize:22 }}>🔢 Word Builder!</h2>
      <p style={{ color:"#aaa", fontSize:12, margin:"0 0 10px" }}>Tap letters to spell the word!</p>

      {/* Category tabs */}
      <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:14, flexWrap:"wrap" }}>
        {WORD_GROUPS.map((g,i) => (
          <button key={i} onClick={()=>{ setGroupIdx(i); setWordIdx(0); }}
            style={{ background:groupIdx===i?g.color:"#eee", border:"none", borderRadius:20, padding:"5px 12px", cursor:"pointer", fontWeight:700, fontSize:13, color:groupIdx===i?"#fff":"#888", fontFamily:"inherit", transition:"all 0.2s" }}>
            {g.emoji} {g.category}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div style={{ marginBottom:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#aaa", marginBottom:3 }}>
          <span>{group.emoji} {group.category}</span>
          <span>{solvedInGroup}/{group.words.length} solved</span>
        </div>
        <ProgressBar value={solvedInGroup} max={group.words.length} color={group.color} height={8}/>
      </div>

      {/* Word dots nav */}
      <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:14 }}>
        {group.words.map((w,i) => {
          const done = solved[`${group.category}-${w.word}`];
          return (
            <div key={i} onClick={()=>setWordIdx(i)}
              style={{ width:10, height:10, borderRadius:"50%", background:done?group.color:i===wordIdx?"#333":"#ddd", cursor:"pointer", border:i===wordIdx?"2px solid #333":"2px solid transparent", transition:"all 0.2s" }}/>
          );
        })}
      </div>

      {/* Emoji + hint */}
      <div style={{ background:`${group.color}18`, border:`3px solid ${group.color}44`, borderRadius:24, padding:"18px 16px", marginBottom:16, position:"relative" }}>
        <div style={{ fontSize:68, lineHeight:1 }}>{item.emoji}</div>
        {showHint
          ? <p style={{ color:"#666", fontSize:14, margin:"8px 0 0", fontStyle:"italic" }}>💡 {item.hint}</p>
          : <button onClick={()=>{ setShowHint(true); speak(item.hint, 0.85); }}
              style={{ background:"none", border:`2px dashed ${group.color}`, borderRadius:20, padding:"4px 14px", cursor:"pointer", color:group.color, fontFamily:"inherit", fontSize:13, marginTop:8 }}>
              💡 Show hint
            </button>
        }
        <button onClick={()=>speak(item.hint, 0.85)}
          style={{ position:"absolute", top:10, right:10, background:"none", border:`2px solid ${group.color}`, borderRadius:50, padding:"4px 10px", cursor:"pointer", fontSize:13, color:group.color, fontFamily:"inherit" }}>
          🔊
        </button>
      </div>

      {/* Slots */}
      <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:16 }}>
        {placed.map((tile, i) => {
          let borderColor = "#ddd", bg = "#f9f9f9", shadow = "#ddd";
          if (status === "correct") { borderColor = C.green; bg = "#d4edda"; shadow = C.green; }
          else if (status === "wrong" && tile) { borderColor = C.primary; bg = "#f8d7da"; shadow = C.primary; }
          else if (tile) { borderColor = tile.color; bg = `${tile.color}22`; shadow = tile.color; }
          return (
            <div key={i} onClick={() => tapFromSlot(i)}
              style={{ width:56, height:64, borderRadius:14, border:`3px solid ${borderColor}`, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:900, cursor:tile?"pointer":"default", boxShadow:`0 4px 0 ${shadow}`, color:tile?tile.color:"#ddd", transition:"all 0.2s", transform:status==="correct"&&tile?"scale(1.1)":"scale(1)" }}>
              {tile ? tile.char : ""}
            </div>
          );
        })}
      </div>

      {/* Status message */}
      {status === "correct" && (
        <div style={{ animation:"popIn 0.4s", marginBottom:10 }}>
          <p style={{ color:C.green, fontWeight:900, fontSize:20, margin:0 }}>
            🎉 {word}! {!solved[`${group.category}-${word}`] || true ? "+4 stars! ⭐⭐⭐⭐" : "Already solved!"}
          </p>
          <p style={{ color:"#888", fontSize:14, margin:"4px 0 0" }}>{item.hint}</p>
        </div>
      )}
      {status === "wrong" && (
        <p style={{ color:C.primary, fontWeight:700, fontSize:16, animation:"popIn 0.3s", margin:"0 0 8px" }}>
          ❌ Not quite — tap a letter to move it back!
        </p>
      )}

      {/* Letter bank */}
      <div style={{ minHeight:72, background:"#f0f0f0", borderRadius:20, padding:"12px 10px", marginBottom:14, display:"flex", gap:10, justifyContent:"center", alignItems:"center", flexWrap:"wrap", border:"2px dashed #ddd" }}>
        {bank.length === 0 && status !== "correct" && (
          <span style={{ color:"#bbb", fontSize:14 }}>All letters placed!</span>
        )}
        {bank.map(tile => (
          <div key={tile.id} onClick={() => tapFromBank(tile)}
            style={{ width:54, height:62, borderRadius:14, background:tile.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:900, cursor:"pointer", color:"#fff", boxShadow:`0 5px 0 ${tile.color}88`, transition:"transform 0.1s", userSelect:"none" }}
            onMouseDown={e=>e.currentTarget.style.transform="translateY(3px) scale(0.95)"}
            onMouseUp={e=>e.currentTarget.style.transform=""}>
            {tile.char}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
        <Btn onClick={reset} color="#aaa" style={{ padding:"10px 18px", fontSize:14 }}>🔄 Reset</Btn>
        {status === "correct"
          ? <Btn onClick={nextWord} color={group.color}>Next Word ▶</Btn>
          : <>
              <Btn onClick={prevWord} color="#bbb" style={{ padding:"10px 18px", fontSize:14 }}>◀</Btn>
              <Btn onClick={nextWord} color={group.color} style={{ padding:"10px 18px", fontSize:14 }}>▶</Btn>
            </>
        }
      </div>
    </div>
  );
}

// ── TRACING ───────────────────────────────────────────────────────────────────
function TracingScreen({ onEarn }) {
  const [letterIdx, setLetterIdx] = useState(0);
  const [drawing, setDrawing] = useState(false);
  const [dotsHit, setDotsHit] = useState([]);
  const [praised, setPraised] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const canvasRef = useRef(null);
  const lastPos = useRef(null);
  const dotsHitRef = useRef([]);
  const item = PHONICS[letterIdx];
  const paths = LETTER_PATHS[item.letter] || [];

  const getPos = (e, c) => {
    const r = c.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  };

  const clearCanvas = () => {
    const c = canvasRef.current;
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
    dotsHitRef.current = [];
    setDotsHit([]); setPraised(false); setEarnedStars(0);
  };

  const next = () => { clearCanvas(); setLetterIdx(i => (i+1) % PHONICS.length); };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    lastPos.current = getPos(e, canvasRef.current);
  };

  const doDraw = (e) => {
    if (!drawing) return; e.preventDefault();
    const c = canvasRef.current; const ctx = c.getContext("2d");
    const pos = getPos(e, c);
    ctx.strokeStyle = item.color; ctx.lineWidth = 12; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
    lastPos.current = pos;
    const nextDotIdx = dotsHitRef.current.length;
    if (nextDotIdx < paths.length) {
      const target = paths[nextDotIdx];
      const dist = Math.sqrt((pos.x - target.x)**2 + (pos.y - target.y)**2);
      if (dist < 32) {
        dotsHitRef.current = [...dotsHitRef.current, nextDotIdx];
        setDotsHit([...dotsHitRef.current]);
      }
    }
  };

  const endDraw = () => {
    setDrawing(false); lastPos.current = null;
    if (!praised) {
      const allHit = dotsHitRef.current.length >= paths.length && paths.length > 0;
      const someHit = dotsHitRef.current.length > 0;
      if (allHit) { onEarn(3); setPraised(true); setEarnedStars(3); }
      else if (someHit) { onEarn(1); setPraised(true); setEarnedStars(1); }
    }
  };

  return (
    <div style={{ padding:20, textAlign:"center" }}>
      <h2 style={{ color:C.purple, margin:"0 0 4px", fontSize:22 }}>✍️ Trace the Letter!</h2>
      <p style={{ color:"#aaa", fontSize:12, margin:"0 0 16px" }}>Follow the numbered dots in order!</p>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, marginBottom:16 }}>
        <div style={{ fontSize:56, background:item.color, borderRadius:16, padding:"10px 20px", color:"#fff", fontWeight:900, lineHeight:1 }}>{item.letter}</div>
        <div>
          <div style={{ fontSize:40 }}>{item.emoji}</div>
          <div style={{ fontWeight:700, color:item.color }}>{item.word}</div>
          <button onClick={() => speak(`${item.letter}. ${item.word}`, 0.8)} style={{ background:"none", border:`2px solid ${item.color}`, borderRadius:20, padding:"4px 12px", cursor:"pointer", color:item.color, fontSize:12, fontFamily:"inherit", marginTop:4 }}>🔊 Hear it</button>
        </div>
      </div>
      <div style={{ position:"relative", display:"inline-block", border:`3px dashed ${item.color}`, borderRadius:16, overflow:"hidden", background:"#fff", boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", fontSize:160, color:`${item.color}22`, fontWeight:900, userSelect:"none", pointerEvents:"none", lineHeight:1 }}>{item.letter}</div>
        <canvas ref={canvasRef} width={280} height={200}
          onMouseDown={startDraw} onMouseMove={doDraw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={doDraw} onTouchEnd={endDraw}
          style={{ display:"block", cursor:"crosshair", touchAction:"none" }}/>
        <svg width={280} height={200} style={{ position:"absolute", top:0, left:0, pointerEvents:"none" }}>
          {paths.map((p, i) => i < paths.length-1 && (
            <line key={`l${i}`} x1={p.x} y1={p.y} x2={paths[i+1].x} y2={paths[i+1].y}
              stroke={`${item.color}55`} strokeWidth={2} strokeDasharray="6,4"/>
          ))}
          {paths.map((p, i) => {
            const hit = i < dotsHit.length;
            return (
              <g key={`d${i}`}>
                <circle cx={p.x} cy={p.y} r={14} fill={hit ? item.color : "white"} stroke={item.color} strokeWidth={2.5}/>
                <text x={p.x} y={p.y+5} textAnchor="middle" fontSize={11} fontWeight="bold" fill={hit ? "#fff" : item.color}>{i+1}</text>
              </g>
            );
          })}
        </svg>
      </div>
      {praised && (
        <p style={{ color:earnedStars===3?C.green:C.orange, fontWeight:900, fontSize:18, margin:"12px 0 0", animation:"popIn 0.4s" }}>
          {earnedStars===3 ? "🌟🌟🌟 Perfect! +3 stars!" : "⭐ Good try! +1 star!"}
        </p>
      )}
      <div style={{ display:"flex", gap:12, justifyContent:"center", marginTop:16 }}>
        <Btn onClick={clearCanvas} color="#aaa" style={{ padding:"10px 20px", fontSize:14 }}>🗑️ Clear</Btn>
        <Btn onClick={next} color={item.color} style={{ padding:"10px 20px", fontSize:14 }}>Next Letter ▶</Btn>
      </div>
    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomeScreen({ stars, onNav }) {
  const lvl = getLevel(stars); const nxt = nextLevel(stars);
  const [bounce, setBounce] = useState(false);
  useEffect(()=>{ const t=setInterval(()=>setBounce(b=>!b),1000); return()=>clearInterval(t); },[]);
  return (
    <div style={{ textAlign:"center", padding:"20px 16px" }}>
      <div style={{ fontSize:72, marginBottom:4, transform:bounce?"scale(1.1)":"scale(1)", transition:"transform 0.5s" }}>🌟</div>
      <h1 style={{ fontSize:30, color:C.primary, margin:"0 0 4px", fontWeight:900 }}>Reading Stars!</h1>
      <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:`${lvl.color}22`, border:`2px solid ${lvl.color}`, borderRadius:20, padding:"6px 16px", marginBottom:12 }}>
        <span style={{ fontSize:20 }}>{lvl.emoji}</span>
        <span style={{ fontWeight:900, color:lvl.color }}>{lvl.name}</span>
      </div>
      <div style={{ background:"linear-gradient(135deg,#FFE66D,#FF9F1C)", borderRadius:16, padding:"10px 20px", display:"inline-flex", alignItems:"center", gap:8, marginBottom:nxt?12:20, boxShadow:"0 4px 12px rgba(255,159,28,0.3)" }}>
        <span style={{ fontSize:24 }}>⭐</span>
        <span style={{ fontWeight:900, fontSize:22, color:"#7D4E00" }}>{stars} Stars!</span>
      </div>
      {nxt && (
        <div style={{ maxWidth:320, margin:"0 auto 20px" }}>
          <p style={{ fontSize:12, color:"#aaa", margin:"0 0 4px" }}>{nxt.minStars-stars} more stars to reach {nxt.emoji} {nxt.name}!</p>
          <ProgressBar value={stars-lvl.minStars} max={nxt.minStars-lvl.minStars} color={lvl.color} height={10}/>
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, maxWidth:360, margin:"0 auto" }}>
        {[
          { id:"phonics",      emoji:"🔤", label:"Phonics",       color:C.primary,  sub:"Learn letter sounds"   },
          { id:"soundquiz",    emoji:"🔊", label:"Sound Quiz",    color:"#F72585",  sub:"Hear & identify!"      },
          { id:"picmatch",     emoji:"🖼️", label:"Picture Match", color:"#E91E8C",  sub:"Match pics to letters" },
          { id:"blending",     emoji:"🔗", label:"Blending",      color:"#0097A7",  sub:"Blend sounds!"         },
          { id:"wordfamilies", emoji:"🏠", label:"Word Families", color:"#FF6B6B",  sub:"-at, -an, -ig, -og..." },
          { id:"missingletter",emoji:"❓", label:"Missing Letter",color:"#8B5CF6",  sub:"Fill in the blank!"    },
          { id:"sightwords",   emoji:"👁️", label:"Sight Words",   color:C.secondary,sub:"Common words"          },
          { id:"stories", emoji:"📚", label:"Stories", color:C.purple, sub:"Read fun stories" },
          { id:"game", emoji:"🎮", label:"Word Game", color:C.orange, sub:"Play & earn stars" },
          { id:"wordbuilder", emoji:"🔢", label:"Word Builder", color:"#FF9F1C", sub:"Build words!" },
          { id:"tracing",   emoji:"✍️", label:"Tracing",      color:C.green,    sub:"Trace letters"       },
          { id:"syllable",  emoji:"👏", label:"Syllables",    color:"#FF9F1C",  sub:"Clap the beats!"     },
          { id:"sorting",   emoji:"🗂️", label:"Sort Words",   color:"#5E81F4",  sub:"Sort into groups!"   },
          { id:"memory",    emoji:"🧠", label:"Memory Spell", color:"#7C3AED",  sub:"Spell from memory!"  },
          { id:"dashboard", emoji:"📊", label:"My Progress",  color:"#5E81F4",  sub:"See how I'm doing"   },
        ].map(({ id, emoji, label, color, sub }) => (
          <button key={id} onClick={()=>onNav(id)}
            style={{ background:"#fff", border:`3px solid ${color}`, borderRadius:20, padding:"18px 12px", cursor:"pointer", boxShadow:`0 6px 0 ${color}88`, fontFamily:"inherit" }}
            onMouseDown={e=>e.currentTarget.style.cssText+="transform:translateY(4px);box-shadow:0 2px 0 "+color+"88"}
            onMouseUp={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`0 6px 0 ${color}88`;}}>
            <div style={{ fontSize:38, marginBottom:4 }}>{emoji}</div>
            <div style={{ fontWeight:900, fontSize:15, color }}>{label}</div>
            <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>{sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── PHONICS ───────────────────────────────────────────────────────────────────
function PhonicsScreen({ onEarn, progress, onProgress }) {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(false);
  const [animating, setAnimating] = useState(false);
  const item = PHONICS[idx];
  const learned = progress.phonics || {};
  const show = () => {
    if (!shown) {
      setShown(true);
      speak(`${item.letter} says ${PHONETICS[item.letter]}... ${PHONETICS[item.letter]}... like in ${item.word}`, 0.8);
      if (!learned[item.letter]) { onEarn(1); onProgress("phonics", item.letter); }
    }
  };
  const go = (dir) => { setAnimating(true); setTimeout(()=>{ setIdx(i=>(i+dir+PHONICS.length)%PHONICS.length); setShown(false); setAnimating(false); },250); };
  return (
    <div style={{ padding:20, textAlign:"center" }}>
      <h2 style={{ color:C.primary, margin:"0 0 4px", fontSize:22 }}>🔤 Phonics Fun!</h2>
      <p style={{ color:"#aaa", fontSize:12, margin:"0 0 8px" }}>{Object.keys(learned).length}/26 letters learned!</p>
      <ProgressBar value={Object.keys(learned).length} max={26} color={C.primary}/>
      <div style={{ display:"flex", flexWrap:"wrap", gap:4, justifyContent:"center", margin:"12px 0" }}>
        {PHONICS.map(p=>(
          <div key={p.letter} onClick={()=>{ setAnimating(true); setTimeout(()=>{setIdx(PHONICS.indexOf(p)); setShown(false); setAnimating(false);},200); }}
            style={{ width:28, height:28, borderRadius:8, background:learned[p.letter]?p.color:"#eee", color:learned[p.letter]?"#fff":"#aaa", fontWeight:900, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", border:PHONICS[idx].letter===p.letter?`2px solid ${C.dark}`:"2px solid transparent" }}>
            {p.letter}
          </div>
        ))}
      </div>
      <div style={{ opacity:animating?0:1, transform:animating?"scale(0.85)":"scale(1)", transition:"all 0.25s" }}>
        <div style={{ background:item.color, borderRadius:28, padding:"28px 20px", maxWidth:280, margin:"0 auto", boxShadow:`0 8px 0 ${item.color}88` }}>
          <div style={{ fontSize:80 }}>{item.emoji}</div>
          <div style={{ fontSize:96, fontWeight:900, color:"#fff", lineHeight:1, marginTop:4 }}>{item.letter}</div>
          {shown && <div style={{ animation:"popIn 0.4s" }}><div style={{ fontSize:24, color:"#fff", fontWeight:700, marginTop:6 }}>{item.word}</div><div style={{ background:"rgba(255,255,255,0.3)", borderRadius:12, padding:"5px 14px", display:"inline-block", marginTop:6, color:"#fff", fontSize:16, fontStyle:"italic" }}>"{item.word[0].toLowerCase()}..." sound</div></div>}
        </div>
        {!shown ? <Btn onClick={show} color={C.accent} style={{ marginTop:16, color:"#7D4E00" }}>🔊 Hear the Sound!</Btn>
          : <div style={{ marginTop:14 }}><p style={{ color:C.green, fontWeight:700, fontSize:17 }}>{learned[item.letter]?"Already learned! ✅":"⭐ New letter! +1 star!"}</p><button onClick={()=>speak(`${item.letter} says ${PHONETICS[item.letter]}... like in ${item.word}`,0.8)} style={{ background:"none", border:`2px solid ${item.color}`, borderRadius:20, padding:"6px 16px", cursor:"pointer", color:item.color, fontFamily:"inherit", fontSize:14 }}>🔊 Hear again</button></div>}
      </div>
      <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:16 }}>
        <Btn onClick={()=>go(-1)} color="#aaa" style={{ padding:"10px 22px", fontSize:18 }}>◀</Btn>
        <Btn onClick={()=>go(1)} color={C.secondary} style={{ padding:"10px 22px", fontSize:18 }}>▶</Btn>
      </div>
    </div>
  );
}

// ── SIGHT WORDS ───────────────────────────────────────────────────────────────
function SightWordsScreen({ onEarn, progress, onProgress }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const item = SIGHT_WORDS[idx];
  const learned = progress.sightWords || {};
  const flip = () => {
    if (!flipped) { setFlipped(true); speak(item.sentence, 0.8); if (!learned[item.word]) { onEarn(2); onProgress("sightWords", item.word); } }
  };
  const go = (dir) => { setIdx(i=>(i+dir+SIGHT_WORDS.length)%SIGHT_WORDS.length); setFlipped(false); };
  return (
    <div style={{ padding:20, textAlign:"center" }}>
      <h2 style={{ color:C.secondary, margin:"0 0 4px", fontSize:22 }}>👁️ Sight Words</h2>
      <p style={{ color:"#aaa", fontSize:12, margin:"0 0 8px" }}>{Object.keys(learned).length}/{SIGHT_WORDS.length} words learned!</p>
      <ProgressBar value={Object.keys(learned).length} max={SIGHT_WORDS.length} color={C.secondary}/>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center", margin:"12px 0" }}>
        {SIGHT_WORDS.map(w=>(
          <div key={w.word} onClick={()=>{ setIdx(SIGHT_WORDS.indexOf(w)); setFlipped(false); }}
            style={{ padding:"4px 10px", borderRadius:20, background:learned[w.word]?C.secondary:"#eee", color:learned[w.word]?"#fff":"#aaa", fontWeight:700, fontSize:13, cursor:"pointer", border:SIGHT_WORDS[idx].word===w.word?"2px solid #333":"2px solid transparent" }}>
            {w.word}
          </div>
        ))}
      </div>
      <div onClick={flip} style={{ maxWidth:300, margin:"0 auto", height:190, cursor:"pointer" }}>
        {!flipped
          ? <div style={{ background:"linear-gradient(135deg,#4ECDC4,#0abfbc)", borderRadius:24, height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 0 #0abfbc88" }}>
              <div style={{ fontSize:62, fontWeight:900, color:"#fff", letterSpacing:4 }}>{item.word}</div>
              <div style={{ color:"rgba(255,255,255,0.7)", fontSize:13, marginTop:8 }}>Tap to see the sentence!</div>
              <button onClick={e=>{e.stopPropagation();speak(item.word,0.7);}} style={{ background:"rgba(255,255,255,0.25)", border:"none", borderRadius:20, padding:"5px 14px", marginTop:8, cursor:"pointer", color:"#fff", fontFamily:"inherit", fontSize:13 }}>🔊 Say it</button>
            </div>
          : <div style={{ background:"linear-gradient(135deg,#FFE66D,#FF9F1C)", borderRadius:24, height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 0 #cc7a0088", animation:"popIn 0.4s", padding:16 }}>
              <div style={{ fontSize:40 }}>{item.emoji}</div>
              <div style={{ fontSize:20, fontWeight:700, color:"#7D4E00", marginTop:6, lineHeight:1.4 }}>{item.sentence}</div>
              <button onClick={e=>{e.stopPropagation();speak(item.sentence,0.8);}} style={{ background:"rgba(255,255,255,0.4)", border:"none", borderRadius:20, padding:"5px 14px", marginTop:8, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700 }}>🔊 Read it</button>
              {!learned[item.word]?<div style={{ color:C.green, fontWeight:900, marginTop:6 }}>⭐⭐ +2 stars!</div>:<div style={{ color:"#aaa", marginTop:6 }}>Already learned ✅</div>}
            </div>}
      </div>
      <div style={{ display:"flex", gap:12, justifyContent:"center", marginTop:20 }}>
        <Btn onClick={()=>go(-1)} color="#aaa" style={{ padding:"10px 22px", fontSize:18 }}>◀</Btn>
        <Btn onClick={()=>go(1)} color={C.secondary}>Next Word ▶</Btn>
      </div>
    </div>
  );
}

// ── STORIES ───────────────────────────────────────────────────────────────────
function StoriesScreen({ onEarn, stars, progress, onProgress }) {
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  const userLevel = getLevel(stars).level;
  const completed = progress.stories || {};
  if (selected===null) return (
    <div style={{ padding:20, textAlign:"center" }}>
      <h2 style={{ color:C.purple, margin:"0 0 16px", fontSize:22 }}>📚 Choose a Story</h2>
      <div style={{ display:"flex", flexDirection:"column", gap:14, maxWidth:320, margin:"0 auto" }}>
        {STORIES.map((s,i)=>{ const locked=s.level>userLevel; return (
          <button key={i} onClick={()=>{ if(!locked){setSelected(i);setPage(0);}}} disabled={locked}
            style={{ background:locked?"#f5f5f5":"#fff", border:`3px solid ${locked?"#ddd":s.color}`, borderRadius:20, padding:"16px 20px", cursor:locked?"default":"pointer", display:"flex", alignItems:"center", gap:14, boxShadow:locked?"none":`0 6px 0 ${s.color}88`, fontFamily:"inherit", opacity:locked?0.6:1 }}>
            <div style={{ fontSize:40 }}>{locked?"🔒":s.emoji}</div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontWeight:900, fontSize:17, color:locked?"#aaa":s.color }}>{s.title}</div>
              <div style={{ color:"#aaa", fontSize:11 }}>{locked?`Unlock at Level ${s.level}`:`${s.pages.length} pages ${completed[s.title]?"✅":""}`}</div>
            </div>
          </button>
        );})}
      </div>
    </div>
  );
  const story=STORIES[selected]; const pg=story.pages[page]; const isLast=page===story.pages.length-1; const alreadyDone=completed[story.title];
  const nextPage=()=>{ speak(pg.text,0.8); if(isLast){if(!alreadyDone){onEarn(5);onProgress("stories",story.title);}}else setPage(p=>p+1); };
  useEffect(()=>{ speak(pg.text,0.8); },[page]);
  return (
    <div style={{ padding:20, textAlign:"center" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <button onClick={()=>setSelected(null)} style={{ background:"#eee", border:"none", borderRadius:50, padding:"8px 16px", cursor:"pointer", fontFamily:"inherit" }}>◀</button>
        <h2 style={{ color:story.color, margin:0, fontSize:17, flex:1 }}>{story.emoji} {story.title}</h2>
      </div>
      <ProgressBar value={page+1} max={story.pages.length} color={story.color}/>
      <div style={{ marginTop:20, background:"#fff", borderRadius:24, padding:"28px 18px", boxShadow:"0 6px 20px rgba(0,0,0,0.1)", minHeight:190, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", border:`3px solid ${story.color}` }}>
        <div style={{ fontSize:52, marginBottom:14, animation:"popIn 0.5s" }}>{pg.emojis}</div>
        <div style={{ fontSize:24, fontWeight:700, color:"#333", lineHeight:1.5, animation:"popIn 0.5s" }}>{pg.text}</div>
        <div style={{ color:"#aaa", marginTop:12, fontSize:12 }}>Page {page+1} of {story.pages.length}</div>
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:16 }}>
        <button onClick={()=>speak(pg.text,0.8)} style={{ background:"none", border:`2px solid ${story.color}`, borderRadius:50, padding:"10px 18px", cursor:"pointer", color:story.color, fontFamily:"inherit", fontSize:14 }}>🔊 Read aloud</button>
        {page>0 && <Btn onClick={()=>setPage(p=>p-1)} color="#aaa" style={{ padding:"10px 18px", fontSize:14 }}>◀ Back</Btn>}
        <Btn onClick={nextPage} color={isLast?C.green:story.color}>{isLast?"🎉 Finish!":"Next ▶"}</Btn>
      </div>
      {isLast&&alreadyDone&&<p style={{ color:"#aaa", fontSize:13, marginTop:12 }}>Already completed ✅ — read again for fun!</p>}
      {isLast&&!alreadyDone&&<p style={{ color:C.green, fontWeight:900, fontSize:18, marginTop:12, animation:"popIn 0.5s" }}>🎉 ⭐⭐⭐⭐⭐ +5 stars!</p>}
    </div>
  );
}

// ── GAME ──────────────────────────────────────────────────────────────────────
function GameScreen({ onEarn }) {
  const [qIdx, setQIdx] = useState(()=>Math.floor(Math.random()*QUIZ_QUESTIONS.length));
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [particles, setParticles] = useState([]);
  const q = QUIZ_QUESTIONS[qIdx];
  const choose=(i)=>{
    if(selected!==null)return; setSelected(i); setTotal(t=>t+1);
    if(i===q.ans){ setScore(s=>s+1); onEarn(3); speak("Correct! Well done!",0.9,1.3); setParticles(Array.from({length:10},(_,k)=>({id:Date.now()+k,x:20+Math.random()*280,y:60+Math.random()*80}))); setTimeout(()=>setParticles([]),1600); }
    else speak("Try again next time!",0.9);
  };
  const next=()=>{ setSelected(null); setQIdx(Math.floor(Math.random()*QUIZ_QUESTIONS.length)); };
  return (
    <div style={{ padding:20, textAlign:"center", position:"relative" }}>
      {particles.map(p=><FloatParticle key={p.id} x={p.x} y={p.y}/>)}
      <h2 style={{ color:C.orange, margin:"0 0 4px", fontSize:22 }}>🎮 Word Game!</h2>
      <p style={{ color:"#aaa", fontSize:12, margin:"0 0 16px" }}>Score: {score}/{total} — Correct = ⭐⭐⭐!</p>
      <div style={{ background:"linear-gradient(135deg,#FF9F1C,#FF6B6B)", borderRadius:24, padding:"22px 18px", marginBottom:20, boxShadow:"0 8px 0 #cc440088" }}>
        <div style={{ fontSize:46 }}>{q.emoji}</div>
        <div style={{ fontSize:22, fontWeight:900, color:"#fff", marginTop:10, lineHeight:1.4 }}>{q.q}</div>
        <button onClick={()=>speak(q.q,0.85)} style={{ background:"rgba(255,255,255,0.25)", border:"none", borderRadius:20, padding:"5px 14px", marginTop:8, cursor:"pointer", color:"#fff", fontFamily:"inherit", fontSize:13 }}>🔊 Hear question</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {q.opts.map((opt,i)=>{ let bg="#fff",border="#ddd",shadow="#bbb"; if(selected!==null){ if(i===q.ans){bg="#d4edda";border=C.green;shadow=C.green;}else if(i===selected&&i!==q.ans){bg="#f8d7da";border=C.primary;shadow=C.primary;}} return (
          <button key={i} onClick={()=>choose(i)} style={{ background:bg, border:`3px solid ${border}`, borderRadius:16, padding:"14px 8px", fontSize:18, fontWeight:700, cursor:selected?"default":"pointer", boxShadow:`0 5px 0 ${shadow}`, fontFamily:"inherit", transition:"all 0.2s" }}>{opt}</button>
        );})}
      </div>
      {selected!==null&&<div style={{ marginTop:18 }}><p style={{ fontSize:20, fontWeight:900, color:selected===q.ans?C.green:C.primary, animation:"popIn 0.4s" }}>{selected===q.ans?"🎉 Correct! +3 stars!":"❌ The answer was: "+q.opts[q.ans]}</p><Btn onClick={next} color={C.orange}>Next Question ▶</Btn></div>}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function DashboardScreen({ stars, progress }) {
  const lvl=getLevel(stars); const nxt=nextLevel(stars);
  const phonicsLearned=Object.keys(progress.phonics||{}).length;
  const wordsLearned=Object.keys(progress.sightWords||{}).length;
  const storiesRead=Object.keys(progress.stories||{}).length;
  const wordsBuilt=Object.keys(progress.wordBuilder||{}).length;
  const totalWords=WORD_GROUPS.reduce((s,g)=>s+g.words.length,0);
  const stats=[
    { label:"Letters Learned", value:phonicsLearned, max:26, color:C.primary, emoji:"🔤" },
    { label:"Sight Words", value:wordsLearned, max:SIGHT_WORDS.length, color:C.secondary, emoji:"👁️" },
    { label:"Stories Read", value:storiesRead, max:STORIES.length, color:C.purple, emoji:"📚" },
    { label:"Words Built", value:wordsBuilt, max:totalWords, color:C.orange, emoji:"🔢" },
  ];
  return (
    <div style={{ padding:20 }}>
      <h2 style={{ color:"#5E81F4", margin:"0 0 16px", fontSize:22, textAlign:"center" }}>📊 My Progress</h2>
      <div style={{ background:"linear-gradient(135deg,#5E81F4,#A78BFA)", borderRadius:24, padding:20, marginBottom:20, textAlign:"center", color:"#fff", boxShadow:"0 8px 0 #3d5bd488" }}>
        <div style={{ fontSize:52 }}>{lvl.emoji}</div>
        <div style={{ fontWeight:900, fontSize:24 }}>{lvl.name}</div>
        <div style={{ fontSize:40, fontWeight:900, marginTop:4 }}>⭐ {stars}</div>
        {nxt&&<><div style={{ fontSize:13, opacity:0.8, marginTop:4 }}>{nxt.minStars-stars} more stars to reach {nxt.name}!</div><div style={{ marginTop:10 }}><ProgressBar value={stars-lvl.minStars} max={nxt.minStars-lvl.minStars} color="rgba(255,255,255,0.6)" height={10}/></div></>}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {stats.map(({ label, value, max, color, emoji })=>(
          <div key={label} style={{ background:"#fff", borderRadius:20, padding:"16px 20px", boxShadow:"0 4px 12px rgba(0,0,0,0.08)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <span style={{ fontWeight:700, color:"#444", fontSize:15 }}>{emoji} {label}</span>
              <span style={{ fontWeight:900, color, fontSize:18 }}>{value}/{max}</span>
            </div>
            <ProgressBar value={value} max={max} color={color} height={12}/>
            <p style={{ margin:"6px 0 0", fontSize:12, color:"#aaa" }}>{Math.round((value/max)*100)}% complete</p>
          </div>
        ))}
      </div>
      <div style={{ background:"#fff", borderRadius:20, padding:"16px 20px", marginTop:14, boxShadow:"0 4px 12px rgba(0,0,0,0.08)" }}>
        <div style={{ fontWeight:700, color:"#444", fontSize:15, marginBottom:12 }}>🏅 Levels</div>
        {LEVELS.map(l=>(
          <div key={l.level} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, opacity:stars>=l.minStars?1:0.4 }}>
            <div style={{ fontSize:24 }}>{l.emoji}</div>
            <div style={{ flex:1 }}><div style={{ fontWeight:700, color:l.color, fontSize:14 }}>{l.name}</div><div style={{ fontSize:11, color:"#aaa" }}>{l.minStars} stars</div></div>
            {stars>=l.minStars?<div style={{ color:C.green, fontWeight:900, fontSize:16 }}>✅</div>:<div style={{ color:"#ccc", fontSize:13 }}>🔒</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PICTURE MATCH ─────────────────────────────────────────────────────────────
function PictureMatchScreen({ onEarn }) {
  const [qIdx, setQIdx] = useState(()=>Math.floor(Math.random()*PHONICS.length));
  const [selected, setSelected] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [particles, setParticles] = useState([]);
  const item = PHONICS[qIdx];

  const genOptions = useCallback((current) => {
    const others = PHONICS.filter(p=>p.letter!==current.letter)
      .sort(()=>Math.random()-0.5).slice(0,3);
    return [current,...others].sort(()=>Math.random()-0.5);
  },[]);

  useEffect(()=>{
    setOptions(genOptions(PHONICS[qIdx]));
    setSelected(null);
    speak(`What letter does ${PHONICS[qIdx].word} start with?`, 0.85);
  },[qIdx]);

  const choose = (opt) => {
    if (selected) return;
    setSelected(opt.letter);
    setTotal(t=>t+1);
    if (opt.letter===item.letter) {
      setScore(s=>s+1); onEarn(2);
      speak(`Yes! ${item.word} starts with ${item.letter}! ${item.letter} says ${PHONETICS[item.letter]}!`, 0.85, 1.2);
      setParticles(Array.from({length:10},(_,i)=>({id:Date.now()+i,x:20+Math.random()*280,y:60+Math.random()*80})));
      setTimeout(()=>setParticles([]),1600);
    } else {
      speak(`${item.word} starts with ${item.letter}! ${item.letter} says ${PHONETICS[item.letter]}!`, 0.85);
    }
  };

  return (
    <div style={{padding:20,textAlign:"center",position:"relative"}}>
      {particles.map(p=><FloatParticle key={p.id} x={p.x} y={p.y}/>)}
      <h2 style={{color:"#E91E8C",margin:"0 0 2px",fontSize:22}}>🖼️ Picture Match!</h2>
      <p style={{color:"#aaa",fontSize:12,margin:"0 0 16px"}}>Score: {score}/{total} — What letter starts this word?</p>

      <div style={{background:`linear-gradient(135deg,${item.color},${item.color}bb)`,borderRadius:24,padding:"28px 20px",marginBottom:20,boxShadow:`0 8px 0 ${item.color}66`}}>
        <div style={{fontSize:80}}>{item.emoji}</div>
        <div style={{display:"flex",gap:8,justifyContent:"center",alignItems:"center",marginTop:10}}>
          <div style={{width:48,height:52,borderRadius:12,background:"rgba(255,255,255,0.3)",border:"2px dashed rgba(255,255,255,0.7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:900,color:"rgba(255,255,255,0.8)"}}>?</div>
          <div style={{fontSize:26,fontWeight:900,color:"#fff",letterSpacing:3}}>{item.word.slice(1).toUpperCase()}</div>
        </div>
        <button onClick={()=>speak(`What letter does ${item.word} start with?`,0.85)}
          style={{background:"rgba(255,255,255,0.2)",border:"2px solid rgba(255,255,255,0.5)",borderRadius:20,padding:"5px 14px",marginTop:10,cursor:"pointer",color:"#fff",fontFamily:"inherit",fontSize:13}}>
          🔊 Hear it
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,maxWidth:300,margin:"0 auto 18px"}}>
        {options.map(opt=>{
          const isCorrect=opt.letter===item.letter, isSelected=selected===opt.letter;
          let bg="#fff",border=opt.color,shadow=opt.color+"88";
          if(selected){
            if(isCorrect){bg="#d4edda";border=C.green;shadow=C.green+"88";}
            else if(isSelected){bg="#f8d7da";border=C.primary;shadow=C.primary+"88";}
            else{bg="#f9f9f9";border="#ddd";shadow="#ddd";}
          }
          return(
            <button key={opt.letter} onClick={()=>choose(opt)}
              style={{background:bg,border:`3px solid ${border}`,borderRadius:20,padding:"16px 10px",cursor:selected?"default":"pointer",boxShadow:`0 6px 0 ${shadow}`,fontFamily:"inherit",transition:"all 0.2s"}}
              onMouseDown={e=>{if(!selected)e.currentTarget.style.transform="translateY(4px)";}}
              onMouseUp={e=>e.currentTarget.style.transform=""}>
              <div style={{fontSize:40,fontWeight:900,color:selected?(isCorrect?C.green:isSelected?C.primary:"#ccc"):opt.color}}>{opt.letter}</div>
              <div style={{fontSize:11,color:"#aaa",marginTop:2}}>{PHONETICS[opt.letter]}</div>
            </button>
          );
        })}
      </div>

      {selected&&(
        <div style={{animation:"popIn 0.4s"}}>
          <p style={{fontSize:19,fontWeight:900,color:selected===item.letter?C.green:C.primary,margin:"0 0 14px"}}>
            {selected===item.letter?`🎉 "${item.letter}" starts "${item.word}"! +2 ⭐`:`❌ "${item.word}" starts with "${item.letter}"`}
          </p>
          <Btn onClick={()=>setQIdx(Math.floor(Math.random()*PHONICS.length))} color="#E91E8C">Next Picture ▶</Btn>
        </div>
      )}
    </div>
  );
}

// ── SOUND BLENDING ────────────────────────────────────────────────────────────
function BlendingScreen({ onEarn }) {
  const [qIdx, setQIdx] = useState(0);
  const [currentSound, setCurrentSound] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [particles, setParticles] = useState([]);
  const timers = useRef([]);
  const q = BLEND_WORDS[qIdx];

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const playBlend = useCallback(() => {
    clearTimers();
    setPlaying(true);
    q.sounds.forEach((s,i) => {
      const t = setTimeout(()=>{
        setCurrentSound(i);
        speak(PHONETICS[s.toUpperCase()], 0.6, 1.1);
      }, i*1000);
      timers.current.push(t);
    });
    const end = setTimeout(()=>{ setCurrentSound(-1); setPlaying(false); }, q.sounds.length*1000+300);
    timers.current.push(end);
  },[q]);

  useEffect(()=>{
    setSelected(null); setCurrentSound(-1); setPlaying(false);
    clearTimers();
    const t = setTimeout(()=>playBlend(), 500);
    timers.current.push(t);
    return clearTimers;
  },[qIdx]);

  const choose = (word) => {
    if (selected||playing) return;
    setSelected(word); setTotal(t=>t+1);
    if (word===q.word) {
      setScore(s=>s+1); onEarn(3);
      speak(`${q.word}! Great blending!`, 0.85, 1.2);
      setParticles(Array.from({length:10},(_,i)=>({id:Date.now()+i,x:20+Math.random()*280,y:60+Math.random()*80})));
      setTimeout(()=>setParticles([]),1600);
    } else {
      speak(`${q.sounds.map(s=>PHONETICS[s.toUpperCase()]).join("... ")}... ${q.word}!`, 0.8);
    }
  };

  const next = ()=>{ clearTimers(); setQIdx(i=>(i+1)%BLEND_WORDS.length); };

  return (
    <div style={{padding:20,textAlign:"center",position:"relative"}}>
      {particles.map(p=><FloatParticle key={p.id} x={p.x} y={p.y}/>)}
      <h2 style={{color:"#0097A7",margin:"0 0 2px",fontSize:22}}>🔗 Sound Blending!</h2>
      <p style={{color:"#aaa",fontSize:12,margin:"0 0 16px"}}>Score: {score}/{total} — Blend the sounds into a word!</p>

      <div style={{background:"linear-gradient(135deg,#0097A7,#00BCD4)",borderRadius:24,padding:"24px 18px",marginBottom:20,boxShadow:"0 8px 0 #0097a766"}}>
        <div style={{color:"rgba(255,255,255,0.85)",fontSize:14,marginBottom:14,fontWeight:700}}>Listen and blend the sounds!</div>
        <div style={{display:"flex",gap:8,justifyContent:"center",alignItems:"center"}}>
          {q.sounds.map((s,i)=>(
            <span key={i} style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:58,height:66,borderRadius:16,
                background:currentSound===i?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.2)",
                border:`3px solid ${currentSound===i?"#0097A7":"rgba(255,255,255,0.4)"}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:28,fontWeight:900,
                color:currentSound===i?"#0097A7":"#fff",
                transition:"all 0.3s",
                transform:currentSound===i?"scale(1.15)":"scale(1)",
              }}>{s.toUpperCase()}</div>
              {i<q.sounds.length-1&&<span style={{color:"rgba(255,255,255,0.5)",fontSize:20,fontWeight:900}}>+</span>}
            </span>
          ))}
          <span style={{color:"rgba(255,255,255,0.5)",fontSize:20,fontWeight:900}}>= ?</span>
        </div>
        <button onClick={()=>{if(!playing)playBlend();}}
          style={{background:"rgba(255,255,255,0.2)",border:"2px solid rgba(255,255,255,0.5)",borderRadius:20,padding:"7px 16px",marginTop:14,cursor:"pointer",color:"#fff",fontFamily:"inherit",fontSize:13,fontWeight:700}}>
          🔊 Hear sounds again
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,maxWidth:320,margin:"0 auto 18px"}}>
        {q.opts.map(word=>{
          const isCorrect=word===q.word, isSelected=selected===word;
          let bg="#fff",border="#4ECDC4",shadow="#4ECDC488",textColor="#444";
          if(selected){
            if(isCorrect){bg="#d4edda";border=C.green;shadow=C.green+"88";textColor=C.green;}
            else if(isSelected){bg="#f8d7da";border=C.primary;shadow=C.primary+"88";textColor=C.primary;}
            else{bg="#f9f9f9";border="#ddd";shadow="#ddd";textColor="#ccc";}
          }
          return(
            <button key={word} onClick={()=>choose(word)}
              style={{background:bg,border:`3px solid ${border}`,borderRadius:16,padding:"16px 8px",cursor:selected?"default":"pointer",boxShadow:`0 5px 0 ${shadow}`,fontFamily:"inherit",transition:"all 0.2s",fontSize:20,fontWeight:900,color:textColor}}>
              {word}
            </button>
          );
        })}
      </div>

      {selected&&(
        <div style={{animation:"popIn 0.4s"}}>
          <p style={{fontSize:19,fontWeight:900,color:selected===q.word?C.green:C.primary,margin:"0 0 14px"}}>
            {selected===q.word?`🎉 ${q.word}! ${q.emoji} +3 ⭐`:`❌ ${q.sounds.join("+")} = ${q.word} ${q.emoji}`}
          </p>
          <Btn onClick={next} color="#0097A7">Next Word ▶</Btn>
        </div>
      )}
    </div>
  );
}

// ── WORD FAMILIES ─────────────────────────────────────────────────────────────
function WordFamiliesScreen({ onEarn, progress, onProgress }) {
  const [familyIdx, setFamilyIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [options, setOptions] = useState([]);
  const [particles, setParticles] = useState([]);
  const solved = progress.wordFamilies||{};
  const family = WORD_FAMILIES[familyIdx];
  const item = family.words[wordIdx];
  const solvedInFamily = family.words.filter(w=>solved[`${family.family}-${w.word}`]).length;

  const genOptions = (correctLetter) => {
    const wrong = PHONICS.filter(p=>p.letter!==correctLetter)
      .sort(()=>Math.random()-0.5).slice(0,5).map(p=>p.letter);
    return [correctLetter,...wrong].sort(()=>Math.random()-0.5);
  };

  useEffect(()=>{
    setSelected(null);
    setOptions(genOptions(item.letter));
    speak(item.word, 0.8, 1.1);
  },[familyIdx,wordIdx]);

  const choose = (letter) => {
    if (selected) return;
    setSelected(letter);
    if (letter===item.letter) {
      speak(`${letter}... ${family.family.slice(1)}... ${item.word}!`, 0.8, 1.2);
      const key=`${family.family}-${item.word}`;
      if (!solved[key]){ onEarn(3); onProgress("wordFamilies",key); }
      setParticles(Array.from({length:8},(_,i)=>({id:Date.now()+i,x:20+Math.random()*280,y:40+Math.random()*100})));
      setTimeout(()=>setParticles([]),1600);
    } else {
      speak(`Try again! What letter starts ${item.word}?`, 0.85);
    }
  };

  const next = ()=>setWordIdx(i=>(i+1)%family.words.length);

  return (
    <div style={{padding:"16px 16px 20px",textAlign:"center",position:"relative"}}>
      {particles.map(p=><FloatParticle key={p.id} x={p.x} y={p.y}/>)}
      <h2 style={{color:family.color,margin:"0 0 4px",fontSize:22}}>🏠 Word Families!</h2>
      <p style={{color:"#aaa",fontSize:12,margin:"0 0 10px"}}>Tap the starting letter to build the word!</p>

      <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:12,flexWrap:"wrap"}}>
        {WORD_FAMILIES.map((f,i)=>(
          <button key={i} onClick={()=>{setFamilyIdx(i);setWordIdx(0);}}
            style={{background:familyIdx===i?f.color:"#eee",border:"none",borderRadius:20,padding:"5px 11px",cursor:"pointer",fontWeight:700,fontSize:13,color:familyIdx===i?"#fff":"#888",fontFamily:"inherit"}}>
            {f.family}
          </button>
        ))}
      </div>

      <div style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#aaa",marginBottom:3}}>
          <span>{family.family} family</span>
          <span>{solvedInFamily}/{family.words.length} mastered</span>
        </div>
        <ProgressBar value={solvedInFamily} max={family.words.length} color={family.color} height={8}/>
      </div>

      <div style={{background:`${family.color}18`,border:`3px solid ${family.color}44`,borderRadius:24,padding:"20px 16px",marginBottom:16}}>
        <div style={{fontSize:64,marginBottom:10}}>{item.emoji}</div>
        <div style={{display:"flex",gap:10,justifyContent:"center",alignItems:"center"}}>
          <div style={{width:62,height:70,borderRadius:16,
            border:`3px solid ${selected===item.letter?C.green:selected?C.primary:family.color}`,
            background:selected===item.letter?"#d4edda":selected?"#f8d7da":"#fff",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:34,fontWeight:900,
            color:selected===item.letter?C.green:selected?C.primary:family.color,
            boxShadow:`0 4px 0 ${family.color}88`,transition:"all 0.3s",
          }}>{selected||"?"}</div>
          <div style={{background:family.color,borderRadius:16,padding:"12px 18px",boxShadow:`0 4px 0 ${family.color}88`}}>
            <span style={{fontSize:30,fontWeight:900,color:"#fff"}}>{family.family.slice(1).toUpperCase()}</span>
          </div>
        </div>
        <button onClick={()=>speak(item.word,0.75)}
          style={{background:"none",border:`2px solid ${family.color}`,borderRadius:20,padding:"4px 14px",cursor:"pointer",color:family.color,fontFamily:"inherit",fontSize:13,marginTop:10}}>
          🔊 Hear word
        </button>
      </div>

      <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:14}}>
        {options.map(letter=>{
          const ph=PHONICS.find(p=>p.letter===letter);
          const col=ph?ph.color:"#aaa";
          const isCorrect=letter===item.letter, isSelected=selected===letter;
          let bg=col, bs=col+"88";
          if(selected){
            if(isCorrect){bg=C.green;bs=C.green+"88";}
            else if(isSelected){bg=C.primary;bs=C.primary+"88";}
            else{bg="#ccc";bs="#bbb";}
          }
          return(
            <button key={letter} onClick={()=>choose(letter)}
              style={{width:50,height:58,borderRadius:14,background:bg,border:"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:900,cursor:selected?"default":"pointer",color:"#fff",boxShadow:`0 4px 0 ${bs}`,fontFamily:"inherit",transition:"all 0.2s",opacity:selected&&!isCorrect&&!isSelected?0.4:1}}
              onMouseDown={e=>{if(!selected)e.currentTarget.style.transform="translateY(3px)";}}
              onMouseUp={e=>e.currentTarget.style.transform=""}>
              {letter}
            </button>
          );
        })}
      </div>

      {selected&&(
        <div style={{animation:"popIn 0.4s",marginBottom:10}}>
          <p style={{fontSize:18,fontWeight:900,color:selected===item.letter?C.green:C.primary,margin:"0 0 10px"}}>
            {selected===item.letter?`🎉 ${item.word.toUpperCase()}! +3 ⭐`:`❌ It starts with "${item.letter}"!`}
          </p>
          <Btn onClick={next} color={family.color}>Next Word ▶</Btn>
        </div>
      )}
      {!selected&&(
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <Btn onClick={()=>setWordIdx(i=>(i-1+family.words.length)%family.words.length)} color="#bbb" style={{padding:"10px 18px",fontSize:14}}>◀</Btn>
          <Btn onClick={next} color={family.color} style={{padding:"10px 18px",fontSize:14}}>▶</Btn>
        </div>
      )}
    </div>
  );
}

// ── MISSING LETTER ────────────────────────────────────────────────────────────
function MissingLetterScreen({ onEarn }) {
  const [qIdx, setQIdx] = useState(()=>Math.floor(Math.random()*MISSING_WORDS.length));
  const [selected, setSelected] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [particles, setParticles] = useState([]);
  const q = MISSING_WORDS[qIdx];
  const correct = q.word[q.blank];

  const genOptions = (item) => {
    const c = item.word[item.blank];
    const wrong = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").filter(l=>l!==c)
      .sort(()=>Math.random()-0.5).slice(0,3);
    return [c,...wrong].sort(()=>Math.random()-0.5);
  };

  useEffect(()=>{
    setOptions(genOptions(q)); setSelected(null); speak(q.hint, 0.85);
  },[qIdx]);

  const choose = (letter) => {
    if (selected) return;
    setSelected(letter); setTotal(t=>t+1);
    if (letter===correct) {
      setScore(s=>s+1); onEarn(2);
      speak(`${q.word}! Well done!`, 0.85, 1.2);
      setParticles(Array.from({length:10},(_,i)=>({id:Date.now()+i,x:20+Math.random()*280,y:60+Math.random()*80})));
      setTimeout(()=>setParticles([]),1600);
    } else {
      speak(`The missing letter is ${correct}! ${q.word}!`, 0.85);
    }
  };

  return (
    <div style={{padding:20,textAlign:"center",position:"relative"}}>
      {particles.map(p=><FloatParticle key={p.id} x={p.x} y={p.y}/>)}
      <h2 style={{color:"#8B5CF6",margin:"0 0 2px",fontSize:22}}>❓ Missing Letter!</h2>
      <p style={{color:"#aaa",fontSize:12,margin:"0 0 16px"}}>Score: {score}/{total} — Fill in the missing letter!</p>

      <div style={{background:"linear-gradient(135deg,#8B5CF6,#A78BFA)",borderRadius:24,padding:"24px 20px",marginBottom:20,boxShadow:"0 8px 0 #8b5cf666"}}>
        <div style={{fontSize:70,marginBottom:12}}>{q.emoji}</div>
        <div style={{display:"flex",gap:8,justifyContent:"center"}}>
          {q.word.split("").map((letter,i)=>{
            const isMissing=i===q.blank;
            const filled=isMissing&&selected;
            const isRight=filled&&selected===correct;
            const isWrong=filled&&selected!==correct;
            return(
              <div key={i} style={{
                width:58,height:66,borderRadius:14,
                background:isMissing?(isRight?"#d4edda":isWrong?"#f8d7da":"rgba(255,255,255,0.15)"):"rgba(255,255,255,0.9)",
                border:`3px solid ${isMissing?(isRight?C.green:isWrong?C.primary:"rgba(255,255,255,0.6)"):"rgba(255,255,255,0.3)"}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:30,fontWeight:900,
                color:isMissing?(filled?(isRight?C.green:C.primary):"#fff"):"#8B5CF6",
                transition:"all 0.3s",
              }}>
                {isMissing?(selected||"_"):letter}
              </div>
            );
          })}
        </div>
        <p style={{color:"rgba(255,255,255,0.75)",fontSize:13,margin:"10px 0 6px",fontStyle:"italic"}}>{q.hint}</p>
        <button onClick={()=>speak(q.hint,0.85)}
          style={{background:"rgba(255,255,255,0.2)",border:"2px solid rgba(255,255,255,0.5)",borderRadius:20,padding:"5px 14px",cursor:"pointer",color:"#fff",fontFamily:"inherit",fontSize:13}}>
          🔊 Hear hint
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,maxWidth:280,margin:"0 auto 18px"}}>
        {options.map(letter=>{
          const ph=PHONICS.find(p=>p.letter===letter);
          const col=ph?ph.color:"#8B5CF6";
          const isCorrect=letter===correct, isSelected=selected===letter;
          let bg="#fff",border=col,shadow=col+"88";
          if(selected){
            if(isCorrect){bg="#d4edda";border=C.green;shadow=C.green+"88";}
            else if(isSelected){bg="#f8d7da";border=C.primary;shadow=C.primary+"88";}
            else{bg="#f9f9f9";border="#ddd";shadow="#ddd";}
          }
          return(
            <button key={letter} onClick={()=>choose(letter)}
              style={{background:bg,border:`3px solid ${border}`,borderRadius:16,padding:"18px 8px",cursor:selected?"default":"pointer",boxShadow:`0 5px 0 ${shadow}`,fontFamily:"inherit",transition:"all 0.2s"}}
              onMouseDown={e=>{if(!selected)e.currentTarget.style.transform="translateY(4px)";}}
              onMouseUp={e=>e.currentTarget.style.transform=""}>
              <div style={{fontSize:34,fontWeight:900,color:selected?(isCorrect?C.green:isSelected?C.primary:"#ccc"):col}}>{letter}</div>
              <div style={{fontSize:11,color:"#aaa",marginTop:2}}>{PHONETICS[letter]||""}</div>
            </button>
          );
        })}
      </div>

      {selected&&(
        <div style={{animation:"popIn 0.4s"}}>
          <p style={{fontSize:19,fontWeight:900,color:selected===correct?C.green:C.primary,margin:"0 0 14px"}}>
            {selected===correct?`🎉 ${q.word}! +2 ⭐`:`❌ The missing letter is "${correct}"!`}
          </p>
          <Btn onClick={()=>setQIdx(Math.floor(Math.random()*MISSING_WORDS.length))} color="#8B5CF6">Next Word ▶</Btn>
        </div>
      )}
    </div>
  );
}

// ── SOUND QUIZ ────────────────────────────────────────────────────────────────
function SoundQuizScreen({ onEarn }) {
  const [current, setCurrent] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [particles, setParticles] = useState([]);

  const newQuestion = useCallback(() => {
    const item = PHONICS[Math.floor(Math.random() * PHONICS.length)];
    const others = [...PHONICS].filter(p => p.letter !== item.letter);
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }
    const opts = [item, ...others.slice(0, 3)];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    setCurrent(item);
    setOptions(opts);
    setSelected(null);
  }, []);

  useEffect(() => { newQuestion(); }, []);

  const playSound = useCallback((item) => {
    speak(`${PHONETICS[item.letter]}... ${PHONETICS[item.letter]}`, 0.65, 1.15);
  }, []);

  useEffect(() => {
    if (current) setTimeout(() => playSound(current), 400);
  }, [current]);

  const choose = (opt) => {
    if (selected) return;
    setSelected(opt.letter);
    setTotal(t => t + 1);
    if (opt.letter === current.letter) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      onEarn(2);
      speak(`Yes! ${current.letter} says ${PHONETICS[current.letter]}! Like in ${current.word}!`, 0.85, 1.2);
      setParticles(Array.from({ length: 10 }, (_, i) => ({ id: Date.now() + i, x: 20 + Math.random() * 280, y: 60 + Math.random() * 80 })));
      setTimeout(() => setParticles([]), 1600);
    } else {
      setStreak(0);
      speak(`The answer is ${current.letter}. ${current.letter} says ${PHONETICS[current.letter]}, like in ${current.word}.`, 0.85);
    }
  };

  if (!current) return null;

  return (
    <div style={{ padding:20, textAlign:"center", position:"relative" }}>
      {particles.map(p => <FloatParticle key={p.id} x={p.x} y={p.y}/>)}

      <h2 style={{ color:"#F72585", margin:"0 0 2px", fontSize:22 }}>🔊 Sound Quiz!</h2>
      <p style={{ color:"#aaa", fontSize:12, margin:"0 0 16px" }}>
        Score: {score}/{total}{streak >= 3 ? ` 🔥 ${streak} in a row!` : ""}
      </p>

      {/* Sound prompt card */}
      <div style={{ background:"linear-gradient(135deg,#F72585,#7209B7)", borderRadius:24, padding:"28px 20px", marginBottom:22, boxShadow:"0 8px 0 #7209b766" }}>
        <div style={{ fontSize:15, fontWeight:700, color:"rgba(255,255,255,0.75)", marginBottom:14, letterSpacing:0.5 }}>
          Which letter makes this sound?
        </div>
        <button
          onClick={() => playSound(current)}
          style={{ background:"rgba(255,255,255,0.18)", border:"3px solid rgba(255,255,255,0.55)", borderRadius:60, padding:"18px 40px", cursor:"pointer", fontSize:52, lineHeight:1, boxShadow:"0 6px 0 rgba(0,0,0,0.18)", transition:"transform 0.1s", fontFamily:"inherit" }}
          onMouseDown={e => e.currentTarget.style.transform="translateY(4px)"}
          onMouseUp={e => e.currentTarget.style.transform=""}>
          🔊
        </button>
        <div style={{ color:"rgba(255,255,255,0.55)", fontSize:12, marginTop:10 }}>Tap to hear the sound again</div>
      </div>

      {/* Letter choices */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, maxWidth:320, margin:"0 auto 18px" }}>
        {options.map(opt => {
          const isCorrect = opt.letter === current.letter;
          const isSelected = selected === opt.letter;
          let bg = "#fff", border = opt.color, shadow = opt.color + "88";
          if (selected) {
            if (isCorrect)       { bg = "#d4edda"; border = C.green;   shadow = C.green + "88"; }
            else if (isSelected) { bg = "#f8d7da"; border = C.primary; shadow = C.primary + "88"; }
            else                 { bg = "#f9f9f9"; border = "#ddd";    shadow = "#ddd"; }
          }
          return (
            <button key={opt.letter} onClick={() => choose(opt)}
              style={{ background:bg, border:`3px solid ${border}`, borderRadius:20, padding:"18px 10px", cursor:selected?"default":"pointer", boxShadow:`0 6px 0 ${shadow}`, fontFamily:"inherit", transition:"all 0.2s" }}
              onMouseDown={e => { if (!selected) e.currentTarget.style.transform="translateY(4px)"; }}
              onMouseUp={e => e.currentTarget.style.transform=""}>
              <div style={{ fontSize:44, fontWeight:900, color: selected ? (isCorrect ? C.green : isSelected ? C.primary : "#ccc") : opt.color }}>{opt.letter}</div>
              <div style={{ fontSize:22, marginTop:2 }}>{opt.emoji}</div>
              {selected && isCorrect && <div style={{ fontSize:11, color:C.green, fontWeight:700, marginTop:4 }}>{opt.word}</div>}
            </button>
          );
        })}
      </div>

      {/* Result + next */}
      {selected && (
        <div style={{ animation:"popIn 0.4s" }}>
          <p style={{ fontSize:19, fontWeight:900, color:selected===current.letter?C.green:C.primary, margin:"0 0 14px" }}>
            {selected===current.letter
              ? `🎉 "${current.letter}" says "${PHONETICS[current.letter]}"! +2 ⭐`
              : `❌ It was "${current.letter}" — sounds like "${PHONETICS[current.letter]}"`}
          </p>
          <Btn onClick={newQuestion} color="#F72585">Next Sound ▶</Btn>
        </div>
      )}
    </div>
  );
}

// ── SYLLABLE CLAP ─────────────────────────────────────────────────────────────
function SyllableScreen({ onEarn }) {
  const [qIdx, setQIdx] = useState(0);
  const [taps, setTaps] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [particles, setParticles] = useState([]);
  const [drumAnim, setDrumAnim] = useState(false);
  const item = SYLLABLE_WORDS[qIdx];

  useEffect(() => {
    setTaps(0); setSubmitted(false);
    speak(item.word, 0.8, 1.1);
  }, [qIdx]);

  const tap = () => {
    if (submitted) return;
    setTaps(t => t + 1);
    setDrumAnim(true); setTimeout(() => setDrumAnim(false), 150);
    speak("tap", 1.3, 1.5);
  };

  const submit = () => {
    if (submitted || taps === 0) return;
    setSubmitted(true); setTotal(t => t + 1);
    const correct = taps === item.syllables;
    if (correct) {
      setScore(s => s + 1); onEarn(3);
      speak(`${taps} syllable${taps>1?"s":""}! Correct! ${item.word}!`, 0.85, 1.2);
      setParticles(Array.from({length:12},(_,i)=>({id:Date.now()+i,x:20+Math.random()*280,y:40+Math.random()*100})));
      setTimeout(() => setParticles([]), 1600);
    } else if (Math.abs(taps - item.syllables) === 1) {
      onEarn(1);
      speak(`${item.word} has ${item.syllables} syllable${item.syllables>1?"s":""}!`, 0.85);
    } else {
      speak(`${item.word} has ${item.syllables} syllable${item.syllables>1?"s":""}! Listen: ${item.parts.join("... ")}`, 0.8);
    }
  };

  return (
    <div style={{ padding:20, textAlign:"center", position:"relative" }}>
      {particles.map(p => <FloatParticle key={p.id} x={p.x} y={p.y}/>)}
      <h2 style={{ color:"#FF9F1C", margin:"0 0 2px", fontSize:22 }}>👏 Syllable Clap!</h2>
      <p style={{ color:"#aaa", fontSize:12, margin:"0 0 16px" }}>Score: {score}/{total} — Tap the drum once for each syllable!</p>
      <div style={{ background:"linear-gradient(135deg,#FF9F1C,#FFE66D)", borderRadius:24, padding:"24px 18px", marginBottom:20, boxShadow:"0 8px 0 #cc7a0066" }}>
        <div style={{ fontSize:64, marginBottom:8 }}>{item.emoji}</div>
        <div style={{ fontSize:36, fontWeight:900, color:"#7D4E00", letterSpacing:2 }}>{item.word}</div>
        <button onClick={() => speak(item.word, 0.7, 1.1)}
          style={{ background:"rgba(255,255,255,0.35)", border:"none", borderRadius:20, padding:"5px 14px", marginTop:8, cursor:"pointer", color:"#7D4E00", fontFamily:"inherit", fontSize:13, fontWeight:700 }}>
          🔊 Hear it
        </button>
      </div>
      <button onClick={tap} disabled={submitted}
        style={{ fontSize:80, background:"none", border:"none", cursor:submitted?"default":"pointer", transition:"transform 0.1s", transform:drumAnim?"scale(0.82)":"scale(1)", marginBottom:8, display:"block", margin:"0 auto 8px" }}>
        🥁
      </button>
      <p style={{ color:"#888", fontSize:14, margin:"0 0 16px" }}>Taps: <strong style={{ fontSize:28, color:C.primary }}>{taps}</strong></p>
      {!submitted ? (
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <Btn onClick={() => setTaps(0)} color="#aaa" style={{ padding:"10px 18px", fontSize:14 }}>🔄 Reset</Btn>
          <Btn onClick={submit} color="#FF9F1C" disabled={taps===0}>✅ Check!</Btn>
        </div>
      ) : (
        <div style={{ animation:"popIn 0.4s" }}>
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginBottom:12 }}>
            {item.parts.map((part, i) => (
              <div key={i} onClick={() => speak(part, 0.7)}
                style={{ background:LETTER_COLORS[i%LETTER_COLORS.length], borderRadius:12, padding:"8px 16px", color:"#fff", fontWeight:900, fontSize:18, cursor:"pointer", boxShadow:"0 4px 0 rgba(0,0,0,0.2)" }}>
                {part}
              </div>
            ))}
          </div>
          <p style={{ fontSize:18, fontWeight:900, color:taps===item.syllables?C.green:Math.abs(taps-item.syllables)===1?C.orange:C.primary, margin:"0 0 14px" }}>
            {taps===item.syllables ? `🎉 ${item.syllables} syllable${item.syllables>1?"s":""}! +3 ⭐` : `"${item.word}" has ${item.syllables} syllable${item.syllables>1?"s":""}!`}
          </p>
          <Btn onClick={() => setQIdx(i => (i+1) % SYLLABLE_WORDS.length)} color="#FF9F1C">Next Word ▶</Btn>
        </div>
      )}
    </div>
  );
}

// ── WORD SORTING ──────────────────────────────────────────────────────────────
function WordSortingScreen({ onEarn }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [result, setResult] = useState(null);
  const [roundScore, setRoundScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [shake, setShake] = useState(false);
  const [particles, setParticles] = useState([]);
  const round = SORT_ROUNDS[roundIdx];
  const item = round.words[wordIdx];

  useEffect(() => {
    setResult(null); setShake(false);
    speak(item.word, 0.8, 1.1);
  }, [wordIdx, roundIdx]);

  const sort = (cat) => {
    if (result) return;
    setTotal(t => t + 1);
    if (cat === item.cat) {
      setResult("correct"); setRoundScore(s => s + 1); onEarn(2);
      speak(`${item.word}! Correct!`, 0.85, 1.2);
      setParticles(Array.from({length:8},(_,i)=>({id:Date.now()+i,x:20+Math.random()*280,y:40+Math.random()*120})));
      setTimeout(() => setParticles([]), 1600);
    } else {
      setResult("wrong"); setShake(true);
      setTimeout(() => setShake(false), 500);
      speak(`${item.word} goes in ${round.categories[item.cat]}!`, 0.85);
    }
  };

  const next = () => {
    const nextIdx = wordIdx + 1;
    if (nextIdx >= round.words.length) {
      if (roundScore >= round.words.length - 1) { onEarn(3); speak("Amazing! Round complete! Bonus stars!", 0.85, 1.2); }
      setRoundIdx(r => (r+1) % SORT_ROUNDS.length);
      setWordIdx(0); setRoundScore(0);
    } else {
      setWordIdx(nextIdx);
    }
  };

  return (
    <div style={{ padding:20, textAlign:"center", position:"relative" }}>
      {particles.map(p => <FloatParticle key={p.id} x={p.x} y={p.y}/>)}
      <h2 style={{ color:"#5E81F4", margin:"0 0 2px", fontSize:22 }}>🗂️ Word Sorting!</h2>
      <p style={{ color:"#aaa", fontSize:12, margin:"0 0 14px" }}>Word {wordIdx+1}/{round.words.length} — Tap the right bucket!</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
        {round.categories.map((cat, i) => (
          <button key={i} onClick={() => sort(i)}
            style={{ background:result&&item.cat===i?round.colors[i]:`${round.colors[i]}22`, border:`3px solid ${round.colors[i]}`, borderRadius:20, padding:"18px 10px", cursor:result?"default":"pointer", fontWeight:900, fontSize:13, color:result&&item.cat===i?"#fff":round.colors[i], fontFamily:"inherit", boxShadow:`0 5px 0 ${round.colors[i]}66`, transition:"all 0.2s" }}>
            {cat}
          </button>
        ))}
      </div>
      <div style={{ background:"#fff", borderRadius:24, padding:"28px 20px", marginBottom:20, boxShadow:"0 6px 20px rgba(0,0,0,0.1)", border:`3px solid ${result==="correct"?C.green:result==="wrong"?C.primary:"#f0f0f0"}`, animation:shake?"shake 0.5s":"none", transition:"border-color 0.3s" }}>
        <div style={{ fontSize:70, marginBottom:10 }}>{item.emoji}</div>
        <div style={{ fontSize:32, fontWeight:900, color:"#333" }}>{item.word}</div>
        <button onClick={() => speak(item.word, 0.8)} style={{ background:"none", border:"2px solid #ddd", borderRadius:20, padding:"4px 14px", marginTop:8, cursor:"pointer", fontFamily:"inherit", fontSize:13, color:"#888" }}>🔊 Hear it</button>
      </div>
      {result && (
        <div style={{ animation:"popIn 0.4s" }}>
          <p style={{ fontSize:18, fontWeight:900, color:result==="correct"?C.green:C.primary, margin:"0 0 14px" }}>
            {result==="correct" ? "🎉 Correct! +2 ⭐" : `❌ Goes in "${round.categories[item.cat]}"`}
          </p>
          <Btn onClick={next} color="#5E81F4">{wordIdx+1>=round.words.length?"Next Round 🎉":"Next Word ▶"}</Btn>
        </div>
      )}
    </div>
  );
}

// ── SPELLING MEMORY ───────────────────────────────────────────────────────────
function SpellingMemoryScreen({ onEarn }) {
  const [level, setLevel] = useState("easy");
  const [qIdx, setQIdx] = useState(0);
  const [phase, setPhase] = useState("show");
  const [countdown, setCountdown] = useState(3);
  const [placed, setPlaced] = useState([]);
  const [bank, setBank] = useState([]);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [particles, setParticles] = useState([]);
  const timerRef = useRef(null);
  const words = MEMORY_WORDS[level];
  const item = words[qIdx];

  const startSpell = useCallback(() => {
    const shuffled = item.word.split("").map((ch,i) => ({
      id:i, char:ch, color:LETTER_COLORS[i%LETTER_COLORS.length]
    })).sort(() => Math.random() - 0.5);
    setBank(shuffled); setPlaced([]); setPhase("spell"); setResult(null);
  }, [item]);

  useEffect(() => {
    clearInterval(timerRef.current);
    setPhase("show"); setCountdown(3); setResult(null); setPlaced([]); setBank([]);
    speak(item.word, 0.8, 1.1);
    let n = 3;
    timerRef.current = setInterval(() => {
      n--; setCountdown(n);
      if (n <= 0) { clearInterval(timerRef.current); startSpell(); }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qIdx, level]);

  const tapFromBank = (tile) => {
    if (result) return;
    setBank(b => b.filter(t => t.id !== tile.id));
    setPlaced(p => [...p, tile]);
  };

  const tapFromPlaced = (tile) => {
    if (result) return;
    setPlaced(p => p.filter(t => t.id !== tile.id));
    setBank(b => [...b, tile]);
  };

  useEffect(() => {
    if (phase !== "spell" || placed.length !== item.word.length || result) return;
    const spelled = placed.map(t => t.char).join("");
    if (spelled === item.word) {
      setResult("correct"); setScore(s => s + 1); onEarn(5);
      speak(`${item.word}! Perfect memory!`, 0.85, 1.2);
      setParticles(Array.from({length:15},(_,i)=>({id:Date.now()+i,x:20+Math.random()*280,y:40+Math.random()*100})));
      setTimeout(() => setParticles([]), 1600);
    } else {
      setResult("wrong");
      speak(`Almost! The word was ${item.word}`, 0.85);
    }
  }, [placed]);

  const next = () => {
    clearInterval(timerRef.current);
    const nextIdx = (qIdx + 1) % words.length;
    if (nextIdx === 0 && level === "easy" && score >= 5) setLevel("hard");
    setQIdx(nextIdx);
  };

  const switchLevel = (lv) => { clearInterval(timerRef.current); setLevel(lv); setQIdx(0); setScore(0); };

  return (
    <div style={{ padding:20, textAlign:"center", position:"relative" }}>
      {particles.map(p => <FloatParticle key={p.id} x={p.x} y={p.y}/>)}
      <h2 style={{ color:"#7C3AED", margin:"0 0 2px", fontSize:22 }}>🧠 Spell from Memory!</h2>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <span style={{ color:"#aaa", fontSize:12 }}>Score: {score} ⭐</span>
        <div style={{ display:"flex", gap:6 }}>
          {["easy","hard"].map(lv => (
            <button key={lv} onClick={() => switchLevel(lv)}
              style={{ background:level===lv?"#7C3AED":"#eee", border:"none", borderRadius:20, padding:"4px 12px", cursor:"pointer", color:level===lv?"#fff":"#888", fontFamily:"inherit", fontSize:12, fontWeight:700 }}>
              {lv==="easy"?"Easy 3-letter":"Hard 4-letter"}
            </button>
          ))}
        </div>
      </div>
      {phase === "show" && (
        <div>
          <div style={{ background:"linear-gradient(135deg,#7C3AED,#A78BFA)", borderRadius:24, padding:"28px 20px", marginBottom:16, boxShadow:"0 8px 0 #7c3aed66" }}>
            <div style={{ fontSize:70, marginBottom:10 }}>{item.emoji}</div>
            <div style={{ fontSize:48, fontWeight:900, color:"#fff", letterSpacing:4 }}>{item.word.toUpperCase()}</div>
            <p style={{ color:"rgba(255,255,255,0.7)", fontSize:14, margin:"8px 0 0" }}>Remember this word!</p>
          </div>
          <div style={{ background:"#e0e0e0", borderRadius:20, height:14, overflow:"hidden", maxWidth:280, margin:"0 auto 6px" }}>
            <div style={{ background:"#7C3AED", height:"100%", borderRadius:20, width:`${(countdown/3)*100}%`, transition:"width 1s linear" }}/>
          </div>
          <p style={{ color:"#888", fontSize:13, margin:0 }}>Hiding in {countdown}s...</p>
        </div>
      )}
      {phase === "spell" && (
        <div>
          <div style={{ background:"#f5f0ff", border:"3px solid #A78BFA", borderRadius:24, padding:"20px 16px", marginBottom:16 }}>
            <div style={{ fontSize:50, marginBottom:8 }}>{item.emoji}</div>
            <p style={{ color:"#888", fontSize:13, margin:"0 0 10px" }}>Tap letters to spell the word!</p>
            <div style={{ display:"flex", gap:8, justifyContent:"center", minHeight:60, alignItems:"center" }}>
              {placed.map((tile) => (
                <div key={tile.id} onClick={() => tapFromPlaced(tile)}
                  style={{ width:48, height:56, borderRadius:12, background:tile.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontWeight:900, color:"#fff", boxShadow:`0 4px 0 ${tile.color}88`, cursor:result?"default":"pointer" }}>
                  {tile.char.toUpperCase()}
                </div>
              ))}
              {Array.from({length: item.word.length - placed.length}).map((_,i) => (
                <div key={i} style={{ width:48, height:56, borderRadius:12, background:"#e0e0e0", border:"2px dashed #bbb" }}/>
              ))}
            </div>
          </div>
          <div style={{ background:"#f0f0f0", borderRadius:20, padding:"12px 10px", marginBottom:14, display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", minHeight:64 }}>
            {bank.map(tile => (
              <div key={tile.id} onClick={() => tapFromBank(tile)}
                style={{ width:52, height:60, borderRadius:12, background:tile.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontWeight:900, color:"#fff", boxShadow:`0 4px 0 ${tile.color}88`, cursor:"pointer" }}>
                {tile.char.toUpperCase()}
              </div>
            ))}
          </div>
          {result && (
            <div style={{ animation:"popIn 0.4s" }}>
              <p style={{ fontSize:18, fontWeight:900, color:result==="correct"?C.green:C.primary, margin:"0 0 14px" }}>
                {result==="correct" ? "🧠 Perfect Memory! +5 ⭐" : `❌ The word was: ${item.word.toUpperCase()}`}
              </p>
              <Btn onClick={next} color="#7C3AED">Next Word ▶</Btn>
            </div>
          )}
          {!result && (
            <Btn onClick={() => { setBank(b => [...b, ...placed]); setPlaced([]); }} color="#aaa" style={{ padding:"10px 18px", fontSize:14 }}>🔄 Reset</Btn>
          )}
        </div>
      )}
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [stars, setStars] = useState(0);
  const [particles, setParticles] = useState([]);
  const [progress, setProgress] = useState({ phonics:{}, sightWords:{}, stories:{}, wordBuilder:{}, wordFamilies:{} });

  const earn = useCallback((n) => {
    setStars(s => {
      const ns = s + n;
      if (getLevel(ns).level > getLevel(s).level) setTimeout(()=>speak(`Level up! You are now a ${getLevel(ns).name}!`,0.85,1.2),300);
      return ns;
    });
    setParticles(p=>[...p,...Array.from({length:n*2},(_,i)=>({id:Date.now()+i,x:20+Math.random()*280,y:40+Math.random()*60}))]);
    setTimeout(()=>setParticles([]),1600);
  }, []);

  const trackProgress = useCallback((type, key) => {
    setProgress(p=>({ ...p, [type]:{ ...p[type], [key]:true } }));
  }, []);

  const NAV = [
    { id:"home",         emoji:"🏠", label:"Home"     },
    { id:"phonics",      emoji:"🔤", label:"Phonics"  },
    { id:"soundquiz",    emoji:"🔊", label:"Sounds"   },
    { id:"picmatch",     emoji:"🖼️", label:"Match"    },
    { id:"blending",     emoji:"🔗", label:"Blend"    },
    { id:"wordfamilies", emoji:"🏠", label:"Families" },
    { id:"missingletter",emoji:"❓", label:"Missing"  },
    { id:"wordbuilder",  emoji:"🔢", label:"Build"    },
    { id:"sightwords",   emoji:"👁️", label:"Words"    },
    { id:"stories",      emoji:"📚", label:"Stories"  },
    { id:"game",         emoji:"🎮", label:"Game"     },
    { id:"tracing",      emoji:"✍️", label:"Trace"   },
    { id:"syllable",     emoji:"👏", label:"Clap"    },
    { id:"sorting",      emoji:"🗂️", label:"Sort"    },
    { id:"memory",       emoji:"🧠", label:"Memory"  },
    { id:"dashboard",    emoji:"📊", label:"Stats"   },
  ];

  return (
    <div style={{ fontFamily:"'Comic Sans MS','Chalkboard SE',cursive", background:C.bg, minHeight:"100vh", display:"flex", flexDirection:"column", maxWidth:420, margin:"0 auto", position:"relative", overflow:"hidden" }}>
      <style>{`
        @keyframes floatUp { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-80px)} }
        @keyframes popIn { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
        .nav-bar::-webkit-scrollbar { display:none; }
      `}</style>
      {particles.map(p=><FloatParticle key={p.id} x={p.x} y={p.y}/>)}
      <div style={{ background:"linear-gradient(90deg,#FF6B6B,#FF9F1C)", padding:"12px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:18, fontWeight:900, color:"#fff" }}>⭐ Reading Stars</span>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ background:"rgba(255,255,255,0.25)", borderRadius:20, padding:"4px 12px", color:"#fff", fontWeight:900, fontSize:15 }}>⭐ {stars}</div>
          <div style={{ background:"rgba(255,255,255,0.2)", borderRadius:20, padding:"4px 10px", color:"#fff", fontSize:13, fontWeight:700 }}>{getLevel(stars).emoji}</div>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", paddingBottom:70 }}>
        {screen==="home" && <HomeScreen stars={stars} onNav={setScreen}/>}
        {screen==="phonics" && <PhonicsScreen onEarn={earn} progress={progress} onProgress={trackProgress}/>}
        {screen==="soundquiz" && <SoundQuizScreen onEarn={earn}/>}
        {screen==="picmatch" && <PictureMatchScreen onEarn={earn}/>}
        {screen==="blending" && <BlendingScreen onEarn={earn}/>}
        {screen==="wordfamilies" && <WordFamiliesScreen onEarn={earn} progress={progress} onProgress={trackProgress}/>}
        {screen==="missingletter" && <MissingLetterScreen onEarn={earn}/>}
        {screen==="sightwords" && <SightWordsScreen onEarn={earn} progress={progress} onProgress={trackProgress}/>}
        {screen==="stories" && <StoriesScreen onEarn={earn} stars={stars} progress={progress} onProgress={trackProgress}/>}
        {screen==="game" && <GameScreen onEarn={earn}/>}
        {screen==="wordbuilder" && <WordBuilderScreen onEarn={earn} progress={progress} onProgress={trackProgress}/>}
        {screen==="tracing" && <TracingScreen onEarn={earn}/>}
        {screen==="syllable" && <SyllableScreen onEarn={earn}/>}
        {screen==="sorting" && <WordSortingScreen onEarn={earn}/>}
        {screen==="memory" && <SpellingMemoryScreen onEarn={earn}/>}
        {screen==="dashboard" && <DashboardScreen stars={stars} progress={progress}/>}
      </div>
      <div className="nav-bar" style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:420, background:"#fff", borderTop:"3px solid #f0f0f0", display:"flex", overflowX:"auto", WebkitOverflowScrolling:"touch", msOverflowStyle:"none", scrollbarWidth:"none", padding:"6px 0", zIndex:50 }}>
        {NAV.map(({ id, emoji, label })=>(
          <button key={id} onClick={()=>setScreen(id)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:1, padding:"3px 6px", minWidth:50, flexShrink:0, opacity:screen===id?1:0.45, transform:screen===id?"scale(1.15)":"scale(1)", transition:"all 0.2s", fontFamily:"inherit" }}>
            <span style={{ fontSize:18 }}>{emoji}</span>
            <span style={{ fontSize:9, fontWeight:700, color:screen===id?C.primary:"#aaa" }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
