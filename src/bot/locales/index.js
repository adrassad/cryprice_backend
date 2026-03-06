import ru from "./ru.js";
import en from "./en.js";

const locales = { ru, en };

export function lanhuage(lang = "en", key) {
  const language = locales[lang] ? lang : "en";
  return locales[language][key] || key;
}
