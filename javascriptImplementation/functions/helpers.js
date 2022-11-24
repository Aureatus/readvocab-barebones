import nlp from "compromise/three";
import { corpusObject } from "corpus-word-freq";
import pkg from "pdfjs-dist";
import WordPOS from "wordpos";
const { getDocument } = pkg;

const punctuationFilter = (wordList) => {
  const invalidCharRegex = /([^\s\w])/g;

  return wordList.replaceAll(invalidCharRegex, " ");
};

const removeDuplicates = (wordList) => {
  return [...new Set(wordList)];
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
  const uniqueWords = removeDuplicates(trimmedWords);
  return uniqueWords;
};

const convertWordForms = (wordList) => {
  return wordList.map((word) => {
    const doc = nlp(word);

    const adjective = doc.adjectives().conjugate().adjective?.text();
    if (adjective) return adjective;

    const verb = doc.verbs().toInfinitive().text();
    if (verb) return verb;

    const noun = doc.nouns().toSingular().text();
    if (noun) return noun;
  });
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

  let filteredWordList = convertWordForms(wordList);

  const uniqueWords = removeDuplicates(filteredWordList);

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

const getDefinitions = async (wordList) => {
  const wordpos = new WordPOS();
  const definitions = await Promise.all(
    wordList.map(async (word) => {
      const wordInfo = await wordpos.lookup(word);
      return wordInfo[0]?.def;
    })
  );
  return definitions;
};

export { getWords, findRareWords, getDefinitions };
