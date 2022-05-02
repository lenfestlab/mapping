import flair
from flair.models import TextClassifier
from flair.data import Sentence
from flair.models import SequenceTagger
from allennlp.predictors.predictor import Predictor
import allennlp_models.tagging
from spacy import Language
from typing import List
from spacy.tokens import Doc, Span
import re
from transformers import pipeline
import os

os.environ['TRANSFORMERS_CACHE'] = '/storage/transformers_cache/'
os.environ['FLAIR_CACHE_ROOT'] = '/storage/flair_cache/'

def extract_triplets(text):
    """
    Function to parse the generated text and extract the triplets
    """
    triplets = []
    relation, subject, relation, object_ = '', '', '', ''
    text = text.strip()
    current = 'x'
    for token in text.replace("<s>", "").replace("<pad>", "").replace("</s>", "").split():
        if token == "<triplet>":
            current = 't'
            if relation != '':
                triplets.append({'head': subject.strip(), 'type': relation.strip(),'tail': object_.strip()})
                relation = ''
            subject = ''
        elif token == "<subj>":
            current = 's'
            if relation != '':
                triplets.append({'head': subject.strip(), 'type': relation.strip(),'tail': object_.strip()})
            object_ = ''
        elif token == "<obj>":
            current = 'o'
            relation = ''
        else:
            if current == 't':
                subject += ' ' + token
            elif current == 's':
                object_ += ' ' + token
            elif current == 'o':
                relation += ' ' + token
    if subject != '' and relation != '' and object_ != '':
        triplets.append({'head': subject.strip(), 'type': relation.strip(),'tail': object_.strip()})

    return triplets


@Language.factory(
    "rebel",
    requires=["doc.sents"],
    assigns=["doc._.rel"],
    default_config={
        "model_name": "Babelscape/rebel-large",
        "device": -1,
    },
)
class RebelComponent:
    def __init__(
        self,
        nlp,
        name,
        model_name: str,
        device: int,
    ):
        assert model_name is not None, ""
        self.triplet_extractor = pipeline("text2text-generation", model=model_name, tokenizer=model_name, device=device)
        # Register custom extension on the Doc
        if not Doc.has_extension("rel"):
          Doc.set_extension("rel", default={})

    def _generate_triplets(self, sent: Span) -> List[dict]:
          output_ids = self.triplet_extractor(sent.text, return_tensors=True, return_text=False)[0]["generated_token_ids"]["output_ids"]
          extracted_text = self.triplet_extractor.tokenizer.batch_decode(output_ids[0])
          extracted_triplets = extract_triplets(extracted_text[0])
          return extracted_triplets

    def set_annotations(self, doc: Doc, triplets: List[dict]):
        for triplet in triplets:
            # get substring to spacy span
            head_span = re.search(triplet["head"], doc.text)
            tail_span = re.search(triplet["tail"], doc.text)
            # get spacy span
            if head_span is not None:
                head_span = doc.char_span(head_span.start(), head_span.end())
            else:
                head_span = triplet["head"]
            if tail_span is not None:
                tail_span = doc.char_span(tail_span.start(), tail_span.end())
            else:
                tail_span = triplet["tail"]
            offset = (head_span.start, tail_span.start)
            if offset not in doc._.rel:
                doc._.rel[offset] = {"relation": triplet["type"], "head_span": head_span, "tail_span": tail_span}

    def __call__(self, doc: Doc) -> Doc:
        for sent in doc.sents:
            sentence_triplets = self._generate_triplets(sent)
            self.set_annotations(doc, sentence_triplets)
        return doc
    
import spacy


nlp = spacy.load("en_core_web_sm")

nlp.add_pipe("rebel", after="senter", config={
    'device':-1, # Number of the GPU, -1 if want to use CPU
    'model_name':'Babelscape/rebel-large'} # Model used, will default to 'Babelscape/rebel-large' if not given
    )


from flair.models import SequenceTagger
from cleantext import clean
from collections import Counter
from ncr.replace_corefs import resolve
tagger = SequenceTagger.load("Saisam/Inquirer_ner")
tagger2 = SequenceTagger.load("Saisam/Inquirer_ner_loc")


def ner_long(text):
    return [ ner(i) for i in text.split(".")]

def ner(text,tagger_all = True):
    sentence = Sentence(text)

    # run NER over sentence
    if tagger_all:
        tagger.predict(sentence)
    else:
        tagger2.predict(sentence)
    entity_list = []
    for entity in sentence.get_spans('ner'):
        entity_list.append(entity)
    return entity_list
    
def preprocessing(text):
  # coref_text = coref_texts(text)
  return text
  
def postprocessing(entity_list):
  # entity_list = [j for i in entity_list for j in i ]
  entity_list_f = [ get_text_det(i) for i in entity_list]
  
  return entity_list_f

def get_locs(text):
    doc = nlp(text)
    lis = ['country','located in the administrative territorial entity','located in the administrative territorial entity','shares border with','country of citizenship','place of birth','capital','headquarters location','located in or next to body of water','country of origin','mountain range','applies to jurisdiction']
    relation_dicts = [rel_dict for value, rel_dict in doc._.rel.items()]
    final_relevant = []
    for i in relation_dicts:
        if i["relation"] in lis:
            final_relevant.append(i["head_span"].text+" , "+i["tail_span"].text)
    return final_relevant

def get_text_det(comps):
    return { "text" : comps.text, "tag" : comps.tag, "start_position" : comps.start_position, "end_position" : comps.end_position }

def process_loc(entity_list_loc):
    long = []
    for i in entity_list_loc:
        text = i.text
        res = (i.text.split(","))
        resi_start = [i.start_position+text.index(j) for j in res]
        resi_end = [i.start_position+text.index(j)+len(j) for j in res]
        for i,j,k in zip(res, resi_start,resi_end):
            long.append({ "text" : i, "tag" : "LOC", "start_position" : j, "end_position" : k })
    return long
