// normalizeText: matndagi nuqta, chiziqcha, bo‘sh joy, unicode shovqinlarni olib tashlaydi
export const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/[\s\-_.]/g, '')                       // space, dash, dot, underscore
      .replace(/[\u200B-\u200D\uFEFF]/g, '')          // zero-width unicode
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '');               // accents
  };
  
  // Oddiy keyword'lar (aynan yozilgan)
  export const forbiddenWordsTelegram = [
    "telegram", "tiligram", "tilgram", "telgram", "telegrm",
    "teligram", "teleqram", "telegarm", "tg", "tlg", "tlgrm",
    "tel", "telega", "tele", "teleg",
    "телеграм", "тг", "тлг", "тлгрм", "тилграм", "тилеграм", "тилеграмм", "тлгм", "тэлеграм"
  ];
  
  export const forbiddenWordsInstagram = [
    "instagram", "insta", "instgram", "instgaram", "instaqram",
    "insta-gram", "instagrm", "instgramm", "inst", "ig", "instagr", "instaaaa",
    "инстаграм", "инста", "инст", "инстграм", "инстаграмм", "иг", "инстаг",
    "1nstagram", "inst@gram", "insta.gram", "insta gram", "insta,gram",
    "i n s t a", "in5tagram", "gram", "gramm",
    "instagram.com", "instagr.am", "https://instagram.com", "https://www.instagram.com",
    "www.instagram.com", "ig://", "ig dot com",
    "follow me on insta", "my instagram", "dm me on insta", "write me on ig", "check my insta"
  ];
  
  export const forbiddenWordsPhone = [
    "phone", "nomer", "number", "call", "call me", "aloqa", "tel", "telefon",
    "raqam", "raqamingiz", "nomeringiz", "nomerim", "telefonim",
    "телефон", "номер", "звонить", "звонок", "моб", "мобилка", "celular",
    "whatsapp", "wa.me", "watsapp", "watsap", "wasap", "vatsap", "votsep", "votsap"
  ];
  
  // Regex pattern'lar — chiziqcha, nuqta bilan yozilganlarni ushlaydi
  export const forbiddenPatternsTelegram = [
    /t[\s\-_.]*e[\s\-_.]*l[\s\-_.]*e[\s\-_.]*g[\s\-_.]*r[\s\-_.]*a[\s\-_.]*m/i,
    /t[\s\-_.]*g/i,
    /t[\s\-_.]*l[\s\-_.]*g/i,
    /t[\s\-_.]*e[\s\-_.]*l/i,
  ];
  
  export const forbiddenPatternsInstagram = [
    /i[\s\-_.]*n[\s\-_.]*s[\s\-_.]*t[\s\-_.]*a[\s\-_.]*g[\s\-_.]*r[\s\-_.]*a[\s\-_.]*m/i,
    /i[\s\-_.]*g/i,
    /i[\s\-_.]*n[\s\-_.]*s[\s\-_.]*t[\s\-_.]*a/i,
  ];
  
  export const forbiddenPatternsPhone = [
    /\+?[\d\s\-_.]{7,}/, // telefon raqamlar orasida chiziq, nuqta, bo‘sh joy bo‘lsa ham
  ];
  
  // Qo‘shimcha umumiy regex
  export const mentionRegex = /@\w{4,}/;                           // @username
  export const linkRegex = /https?:\/\/[^\s]+/;                   // har qanday link
  
  // Yakuniy tekshiruvchi funksiya
  export const isMessageForbidden = (rawMessage, isPremium = false) => {
    if (isPremium) return false;
  
    const lower = rawMessage.toLowerCase();
    const normalized = normalizeText(rawMessage);
  
    const matchKeyword =
      forbiddenWordsTelegram.some(w => lower.includes(w) || normalized.includes(w)) ||
      forbiddenWordsInstagram.some(w => lower.includes(w) || normalized.includes(w)) ||
      forbiddenWordsPhone.some(w => lower.includes(w) || normalized.includes(w));
  
    const matchPattern =
      forbiddenPatternsTelegram.some((re) => re.test(rawMessage)) ||
      forbiddenPatternsInstagram.some((re) => re.test(rawMessage)) ||
      forbiddenPatternsPhone.some((re) => re.test(rawMessage)) ||
      mentionRegex.test(rawMessage) ||
      linkRegex.test(rawMessage);
  
    return matchKeyword || matchPattern;
  };
  