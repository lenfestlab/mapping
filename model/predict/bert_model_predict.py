import pandas as pd
import numpy as np
from tqdm import tqdm, trange
import ast
import torch
import json
from sklearn.model_selection import train_test_split
from pytorch_pretrained_bert import BertForTokenClassification, BertForSequenceClassification, BertTokenizer, BertConfig
from transformers import BertTokenizerFast

# def out_util(text, tag2idx, model, MAX_LEN):
#     tokenizer = BertTokenizerFast.from_pretrained('bert-base-cased', do_lower_case=False)
#     encodings = tokenizer(sentence, is_split_into_words=True, return_offsets_mapping=True)
#     tokens = tokenizer.convert_ids_to_tokens(encodings.input_ids)
#     return encodings, tokens
    
#     output = out_util_token(tokenizer, sent, tag2idx, model, MAX_LEN)
#     return format_out_util(sent, output)
  

# def out_util_token(tokenizer, sent, tag2idx, model, MAX_LEN):
    
#     '''
#     input: Sentence, BERT trained model, tag mapping
#     output: Tag for each word in the sentence
#     '''
#     # b = pad_sequences([tokenizer.convert_tokens_to_ids(sent)],
#     #                       maxlen=MAX_LEN, dtype="long", truncating="post", padding="post")
#     c = [[float(i>0) for i in ii] for ii in b]
    
#     model.eval()
#     with torch.no_grad():
#             output = model(torch.tensor(b), token_type_ids=None,
#                                attention_mask=torch.tensor(c))
#             logits = output['logits']
#     d = []
#     logits = logits.detach().cpu().numpy()
#     d.append([list(p) for p in np.argmax(logits, axis=2)])
    
#     dic={}
#     for k in tag2idx.keys():
#         dic[tag2idx[k]] = k
    
#     output = d[0][0]
#     output = [ dic[a] for a in output]
#     return output

# def format_out_util(sent, output):
    
#     '''
#     input: Sentence, Tag for each word in the sentence
#     output: List of string locations in the sentence
#     '''
#     print(output)
#     print(sent)

#     i = 0
#     final_result = []
#     while i < len(output):
#         if output[i] in ['B-LOC', 'I-LOC', 'B-ORG', 'I-ORG'] and i < len(sent):
#             print(i)
#             result=sent[i]
#             j = i + 1
#             while j < len(output) and j < len(sent) and output[j] != 'O':
#                 print(j)
#                 text = sent[j]
#                 result = result + ' ' + text
#                 j += 1
                
#             result = result.replace(" ##", "")
#             result = result.replace(" ’ ", "’")
#             result = result.replace(" .", ".")
#             result = result.replace(" ,", ",")
#             final_result = final_result + [result]
#             i = j
#         else:
#             i+=1
#     return final_result

# from cpu_modeling import from_pretrained

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
    
    model.to(device)
    model.eval()

    tokenizer = BertTokenizerFast.from_pretrained('bert-base-cased', do_lower_case=False)
    encoding = tokenizer(content, is_split_into_words=True, return_offsets_mapping=True)
    tokens = tokenizer.convert_ids_to_tokens(encoding.input_ids)

    b_input_ids = torch.LongTensor([encoding['input_ids']]).to(device)
    b_attention_mask = torch.LongTensor([encoding['attention_mask']]).to(device)
    with torch.no_grad():
        outputs = model(b_input_ids, attention_mask=b_attention_mask)
        logits = outputs.logits
        labels = {0:"O", 1:"B-loc", 2:"I-loc", 3:"B-org", 4:"I-org"}
        predictions = torch.argmax(logits, dim=-1).detach().cpu()
        tags = []
        for idx, sentence in enumerate(predictions):
            for idx2, word in enumerate(sentence):
                tag = labels[word.item()]
                tags.append(tag)
        output = zip(tokens,tags)
        output = []
        spacy_token_counter = 0
        span_locs = []
        span_orgs = []
        span_loc_active = False
        span_org_active = False

        span_start = 0
        for idx, tag in enumerate(tags):
            if encoding.offset_mapping[idx][1] == 0:
                continue
            if encoding.offset_mapping[idx][0] == 0:
                if tag == 'B-loc':
                    if span_org_active:
                        span_orgs.append([span_start, spacy_token_counter])
                    span_start = spacy_token_counter
                    span_loc_active = True
                    span_org_active = False
                if tag == 'B-org':
                    if span_loc_active:
                        span_locs.append([span_start, spacy_token_counter])
                    span_start = spacy_token_counter
                    span_org_active = True
                    span_loc_active = False
                if tag == 'O':
                    if span_loc_active:
                        span_locs.append([span_start, spacy_token_counter])
                    if span_org_active:
                        span_orgs.append([span_start, spacy_token_counter])
                    span_loc_active = False
                    span_org_active = False
                spacy_token_counter +=1
        output = {}

        output['sentence'] = content
        output['span_locs'] = span_locs
        output['span_orgs'] = span_orgs

        locs = set()
        for span in output['span_locs']:
            loc = ''
            for x in range(span[0], span[1]):
                loc += output['sentence'][x] + ' '
            locs.add(loc.strip())
        for span in output['span_orgs']:
            org = ''
            for x in range(span[0], span[1]):
                org += output['sentence'][x] + ' '
            locs.add(org.strip())
        output['tags'] = list(locs)
        

        return output