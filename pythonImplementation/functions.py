from tika import parser
from PyDictionary import PyDictionary
import enchant
from string import punctuation
import wordfreq
import nltk
dictionary = enchant.Dict("en_GB")
wordLookup = PyDictionary()

def getWords(dir):
    parsed_pdf = parser.from_file(dir)
    data = parsed_pdf['content']
    words = data.split()
    return words

def filteredWords(wordList, rarityThreshold):
    return findRareWords(punctuationFilter(deleteNouns(correctWordFilter(wordList))), rarityThreshold)

def getDefinitions(wordList):
    wordsAndMeanings = {}
    for word in wordList:
        try:
            wordMeaning = wordLookup.meaning(word, disable_errors=True)
            if wordMeaning == None:
                continue
            wordsAndMeanings[word] = wordMeaning
        except Exception:
            pass
    return wordsAndMeanings

def correctWordFilter(wordList):
    return [word for word in wordList if dictionary.check(word)]

def punctuationFilter(wordList):
    invalidChars = set(punctuation)
  
    return [word for word in wordList if (any(char in invalidChars for char in word) == False) and not(any(char.isdigit() for char in word))]

def findRareWords(wordList, threshold):
    rare_words = []
    for word in wordList:
        if wordfreq._word_frequency(word, 'en', 'best', 0) < threshold and word not in rare_words:
            rare_words.append(word)
    return rare_words
    
def deleteNouns(wordList):
    # function to test if something is a noun
    wordList = ' '.join(wordList)
    is_noun = lambda pos: pos[:2] == 'NN'

    tokenized = nltk.word_tokenize(wordList)
    nouns = [word for (word, pos) in nltk.pos_tag(tokenized) if is_noun(pos)]
    noNouns = [word for word in tokenized if word not in nouns]
    return noNouns