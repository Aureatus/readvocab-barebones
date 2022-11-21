from functions import  getWords, filteredWords, getDefinitions

rareBookWords = filteredWords(getWords('Nietzsche-Beyond-Good-and-Evil.pdf'), 8e-8)

vocab = getDefinitions(rareBookWords)
print(vocab)

v_wordList = []
v_defList = []
for v_word, v_def in vocab.items():
    v_wordList.append(v_word)
    v_defList.append(v_def)