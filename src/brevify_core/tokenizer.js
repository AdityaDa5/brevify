const STOPWORDS = new Set([
  "a","about","above","across","after","afterwards","again","against",
  "all","almost","alone","along","already","also","although","always",
  "am","among","amongst","an","and","another","any","anyhow","anyone",
  "anything","anyway","anywhere","are","around","as","at","be","became",
  "because","become","becomes","becoming","been","before","beforehand",
  "behind","being","below","beside","besides","between","beyond","both",
  "but","by","can","cannot","could","did","do","does","doing","done",
  "down","during","each","either","else","elsewhere","enough","etc",
  "even","ever","every","everyone","everything","everywhere","except",
  "few","for","former","formerly","from","further","had","has","have",
  "having","he","hence","her","here","hereafter","hereby","herein",
  "hereupon","hers","herself","him","himself","his","how","however",
  "i","if","in","indeed","into","is","it","its","itself","just",
  "keep","last","latter","latterly","least","less","made","many","may",
  "me","meanwhile","might","mine","more","moreover","most","mostly",
  "much","must","my","myself","namely","neither","never","nevertheless",
  "next","no","nobody","none","noone","nor","not","nothing","now",
  "nowhere","of","off","often","on","once","one","only","onto","or",
  "other","others","otherwise","our","ours","ourselves","out","over",
  "own","per","perhaps","please","put","rather","same","see","seem",
  "seemed","seeming","seems","several","she","should","since","so",
  "some","somehow","someone","something","sometime","sometimes",
  "somewhere","still","such","take","than","that","the","their",
  "theirs","them","themselves","then","thence","there","thereafter",
  "thereby","therefore","therein","thereupon","these","they","this",
  "those","though","through","throughout","thru","thus","to","too",
  "toward","towards","under","until","up","upon","us","very","via",
  "was","we","well","were","what","whatever","when","whence","whenever",
  "where","whereafter","whereas","whereby","wherein","whereupon",
  "wherever","whether","which","while","whither","who","whoever",
  "whole","whom","whose","why","will","with","within","without","would",
  "yet","you","your","yours","yourself","yourselves",

  // contractions
  "ain","aren","aren't","couldn","couldn't","didn","didn't","doesn",
  "doesn't","don","don't","hadn","hadn't","hasn","hasn't","haven",
  "haven't","isn","isn't","mightn","mightn't","mustn","mustn't",
  "needn","needn't","shan","shan't","shouldn","shouldn't","wasn",
  "wasn't","weren","weren't","won","won't","wouldn","wouldn't",

  // common web/article filler
  "said","says","say","mr","mrs","ms","dr","www","http","https","com",
  "org","net","html","jpg","png","gif","pdf","click","here","link",
  "page","article","read","more","less","show","hide","menu","search"
]);

// Common abbreviations that end with a period
const ABBREVIATIONS = new Set([
  "mr", "mrs", "ms", "dr", "prof", "sr", "jr", "inc", "ltd", "corp",
  "etc", "vs", "esp", "approx", "appt", "apt", "dept", "est", "min",
  "max", "misc", "no", "obj", "rev", "st", "ave", "blvd", "rd", "sq",
  "u.s", "u.k", "e.g", "i.e", "a.m", "p.m", "ph.d", "m.d", "b.a",
  "m.a", "b.s", "m.s", "vol", "fig", "ref", "ed", "al", "ft", "lb",
  "oz", "mph", "mpg", "temp", "govt", "assn", "bros", "co", "dist"
]);

function removeStopwords(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .split(/\s+/)
    .filter(word => {
      // Keep words that are not stopwords and have length > 1
      // Also filter out pure numbers (but keep alphanumeric)
      return word.length > 1 && 
             !STOPWORDS.has(word) && 
             !/^\d+$/.test(word);
    })
    .join(" ");
}

export function sentTokenizer(docs, removeStopWords = true) {
  if (!docs || typeof docs !== 'string') {
    return [];
  }

  let normalizedText = docs.replace(/\s+/g, ' ').trim();

  // Protect floats by temporarily replacing them
  const floatMap = new Map();
  let floatCounter = 0;
  normalizedText = normalizedText.replace(/\d+\.\d+/g, (match) => {
    const placeholder = `__FLOAT_${floatCounter}__`;
    floatMap.set(placeholder, match);
    floatCounter++;
    return placeholder;
  });

  // Protect abbreviations by temporarily replacing them
  const abbrMap = new Map();
  let abbrCounter = 0;
  
  const abbrPattern = Array.from(ABBREVIATIONS)
    .map(abbr => abbr.replace(/\./g, '\\.'))
    .join('|');
  
  normalizedText = normalizedText.replace(
    new RegExp(`\\b(${abbrPattern})\\.`, 'gi'),
    (match) => {
      const placeholder = `__ABBR_${abbrCounter}__`;
      abbrMap.set(placeholder, match);
      abbrCounter++;
      return placeholder;
    }
  );

  // Protect single capital letters followed by period (like "A." or "U.S.A.")
  normalizedText = normalizedText.replace(/\b([A-Z])\./g, (match) => {
    const placeholder = `__ABBR_${abbrCounter}__`;
    abbrMap.set(placeholder, match);
    abbrCounter++;
    return placeholder;
  });

  let sentences = normalizedText.split(/[.!?\n]+/);

  // Restore floats and abbreviations
  sentences = sentences.map(sent => {
    let restored = sent;

    floatMap.forEach((value, key) => {
      restored = restored.replace(key, value);
    });

    abbrMap.forEach((value, key) => {
      restored = restored.replace(key, value);
    });
    
    return restored;
  });


  sentences = sentences
    .map(sent => sent.trim())
    .filter(sent => {
      return sent.length > 10 && /[a-zA-Z]/.test(sent);
    });

  if (removeStopWords) {
    sentences = sentences
      .map(sent => removeStopwords(sent))
      .filter(sent => {
        const wordCount = sent.split(/\s+/).filter(w => w.length > 0).length;
        return wordCount >= 3;
      });
  }

  // Remove duplicate sentences (case-insensitive)
  const uniqueSentences = [];
  const seenSentences = new Set();
  
  sentences.forEach(sent => {
    const normalized = sent.toLowerCase().trim();
    if (!seenSentences.has(normalized)) {
      seenSentences.add(normalized);
      uniqueSentences.push(sent);
    }
  });

  return uniqueSentences;
}