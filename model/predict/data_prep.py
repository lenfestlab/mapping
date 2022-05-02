import pandas as pd
from tqdm import tqdm
import sys

# Given a .csv file of articles, it returns a .csv file with [article_id, sentence]
# For one row in the input .csv file, there will be as many rows as there are sentences in that article.

def break_into_sentences(nlp, articles_csv):
    '''
    Input - Articles csv where each row each an article with 'content' field and 'id' as an article id
    Output - A csv where each row will have the content of a sentence in 'content' column and 'id' as article id
    '''
    sent_list = []
    id_list = []
    print("Number of articles in the input file: ", articles_csv.shape[0])
    for i, row in tqdm(articles_csv.iterrows()):
        if 'content' not in row or 'id' not in row:
            print("Missing column from ['id', 'content'] in the articles csv file: ", articles_csv)
            sys.exit()
        article = row['content']
        id = row['id']
        doc = nlp(article)
        for sent in doc.sents:
            sent = sent.text
            sent = sent.strip(' ').strip('\n')
            if (not '\n' in sent) and len(sent.split(' '))>10:
                sent_list.append(sent)
                id_list.append(id)

    print({'id':id_list,  'content':sent_list})

    sdf = pd.DataFrame({'id':id_list,  'content':sent_list})
    print("Number of sentences in all input articles: ", sdf.shape[0])
    return sdf
    
def break_article_into_sentences(nlp, article, id="default"):
    '''
    Input - Articles csv where each row each an article with 'content' field and 'id' as an article id
    Output - A csv where each row will have the content of a sentence in 'content' column and 'id' as article id
    '''
    sent_list = []
    id_list = []
    order_list = []
    start_char_list = []
    end_char_list = []
    doc = nlp(article)
    for idx, sent in enumerate(doc.sents):
        # print(sent)
        start_char = sent.start_char
        end_char = sent.end_char
        # sent = sent.strip(' ').strip('\n')
        # if (not '\n' in sent) and len(sent.split(' '))>10:
        # if (not '\n' in sent):
        sent_list.append(sent.text)
        # id_list.append(id)
        order_list.append(idx)
        start_char_list.append(start_char)
        end_char_list.append(end_char)

    sdf = pd.DataFrame({'order':order_list, 'content':sent_list, 'start_char':start_char_list, 'end_char':end_char_list})

    print("Number of sentences in all input articles: ", sdf.shape[0])
    return sdf
