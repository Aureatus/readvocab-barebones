import { getWords, findRareWords } from "./functions/helpers.js";

const words = await getWords("../Nietzsche-Beyond-Good-and-Evil.pdf");

const rareWords = findRareWords(words, 20);

console.log(rareWords);
