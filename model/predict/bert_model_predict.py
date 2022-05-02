import pandas as pd
import numpy as np
from tqdm import tqdm, trange
import ast
import torch
import json
from keras.preprocessing.sequence import pad_sequences
from sklearn.model_selection import train_test_split
from pytorch_pretrained_bert import BertForTokenClassification, BertForSequenceClassification, BertTokenizer, BertConfig

def out_util(text, tag2idx, model, MAX_LEN):
    tokenizer = BertTokenizer.from_pretrained('bert-base-cased', do_lower_case=False)
  
    sent = tokenizer.tokenize(text)
    
    output = out_util_token(tokenizer, sent, tag2idx, model, MAX_LEN)
    return format_out_util(sent, output)
  

def out_util_token(tokenizer, sent, tag2idx, model, MAX_LEN):
    
    '''
    input: Sentence, BERT trained model, tag mapping
    output: Tag for each word in the sentence
    '''
    b = pad_sequences([tokenizer.convert_tokens_to_ids(sent)],
                          maxlen=MAX_LEN, dtype="long", truncating="post", padding="post")
    c = [[float(i>0) for i in ii] for ii in b]
    
    model.eval()
    with torch.no_grad():
            logits = model(torch.tensor(b), token_type_ids=None,
                               attention_mask=torch.tensor(c))
    d = []
    logits = logits.detach().cpu().numpy()
    d.append([list(p) for p in np.argmax(logits, axis=2)])
    
    dic={}
    for k in tag2idx.keys():
        dic[tag2idx[k]] = k
    
    output = d[0][0]
    output = [ dic[a] for a in output]
    
    return output

def format_out_util(sent, output):
    
    '''
    input: Sentence, Tag for each word in the sentence
    output: List of string locations in the sentence
    '''
    print(output)
    print(sent)

    i = 0
    final_result = []
    while i < len(output):
        if output[i] in ['B-LOC', 'I-LOC'] and i < len(sent):
            print(i)
            result=sent[i]
            j = i + 1
            while j < len(output) and j < len(sent) and output[j] != 'O':
                print(j)
                text = sent[j]
                result = result + ' ' + text
                j += 1
                
            result = result.replace(" ##", "")
            result = result.replace(" ’ ", "’")
            result = result.replace(" .", ".")
            result = result.replace(" ,", ",")
            final_result = final_result + [result]
            i = j
        else:
            i+=1
    return final_result

from cpu_modeling import from_pretrained

def bert_prediction(model, sentence_df):
    
    '''
    input: Dataframe containing article id and sentence text (content)
    output: Dataframe containing sentences and their corresponding location tags
    '''
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    n_gpu = torch.cuda.device_count()
    
    with open('predict/model_config.json') as json_file:
            json_load = json.load(json_file)
            tag2idx = json_load['label_map']
            MAX_LEN = json_load['max_seq_length']

    tag2idx = {int(v): k for k, v in tag2idx.items()}
    tag2idx = {v: k for k, v in tag2idx.items()}
    
    print('Running Model for: ' + str(len(sentence_df)) + ( ' sentences'))
    tqdm.pandas()
    sentence_df['bert_tags'] = sentence_df['content'].progress_apply(lambda x: out_util(x, tag2idx, model, MAX_LEN))

    return sentence_df
    
def single_bert_prediction(model, content):
    
    '''
    input: Dataframe containing article id and sentence text (content)
    output: Dataframe containing sentences and their corresponding location tags
    '''
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    n_gpu = torch.cuda.device_count()
    
    with open('predict/model_config.json') as json_file:
            json_load = json.load(json_file)
            tag2idx = json_load['label_map']
            MAX_LEN = json_load['max_seq_length']

    tag2idx = {int(v): k for k, v in tag2idx.items()}
    tag2idx = {v: k for k, v in tag2idx.items()}
    
    tqdm.pandas()

    return out_util(content, tag2idx, model, MAX_LEN)