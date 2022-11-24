import nlp from "compromise/three";
import { corpusObject } from "corpus-word-freq";
import pkg from "pdfjs-dist";
import WordPOS from "wordpos";
const { getDocument } = pkg;

const punctuationFilter = (wordList) => {
  const invalidCharRegex = /([^\s\w])/g;

  return wordList.replaceAll(invalidCharRegex, " ");
};

const getWords = async (dir) => {
  const doc = await getDocument(dir).promise;
  const docPages = doc.numPages;
  let text = "";
  for (let i = 1; i <= docPages; i++) {
    const page = await doc.getPage(i);
    const pageInfo = await page.getTextContent();
    const pageText = pageInfo.items.map((item) => item.str);
    text = text.concat(pageText);
  }

  const normalizedText = punctuationFilter(text).trim().replaceAll(/  +/g, " ");
  const words = normalizedText.split(" ");

  const trimmedWords = words.map((word) => word.trim());
  return trimmedWords;
};

const deleteNouns = async (wordList) => {
  const wordpos = new WordPOS();
  const text = wordList.toString().replaceAll(",", " ");
  const Nouns = await wordpos.getNouns(text);
  const noNounWordList = wordList.filter((word) => !Nouns.includes(word));
  return noNounWordList;
};

const findRareWords = (wordList, numberOfWords) => {
  const corpus = corpusObject([
    "NoC",
    "Prep",
    "Neg",
    "Num",
    "NoP",
    "NoP-",
    "Lett",
    "Int",
    "Inf",
    "Conj",
    "Pron",
    "Det",
    "DetP",
    "Gen",
    "Ex",
  ]);
  let uniqueWords = [...new Set(wordList)]; // Remove duplicate words from wordList

  let filteredWordList = uniqueWords.map((word) => {
    const doc = nlp(word);
    const adjective = doc.adjectives().conjugate().adjective?.text().trim();
    if (adjective) return adjective;
    const verb = doc.verbs().toInfinitive().text().trim();
    if (verb) return verb;
    const noun = doc.nouns().toSingular().text().trim();
    if (noun) return noun;
  });

  uniqueWords = [...new Set(filteredWordList)];

  filteredWordList = uniqueWords.filter((word) =>
    corpus.getWordFrequency(word)
  );

  filteredWordList.sort((a, b) => {
    const freqA = corpus.getWordFrequency(a);
    const freqB = corpus.getWordFrequency(b);
    if (freqA > freqB) return 1;
    if (freqA < freqB) return -1;
    return 0;
  });
  const rareWords = filteredWordList.slice(0, numberOfWords);
  return rareWords;
};

export { getWords, deleteNouns, findRareWords };
