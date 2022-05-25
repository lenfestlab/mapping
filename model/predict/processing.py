import json

# data = open('results/out.json')
# data = json.load(data)

class CompoundParser:
	def __init__(self, nlp):
		self.nlp = nlp
	def load_sent(self, obj):
		self.obj = obj
		self.obj['spans'] = []
		for span_loc in obj['span_locs']:
			span = ""
			for idx in range(span_loc[0], span_loc[1]):
				span += obj['sentence'][idx] + " "

			self.obj['spans'].append(span[:-1])
	def in_span_loc(self,idx):
		for idx2, locs in enumerate(self.obj['span_locs']):
			for x in range(locs[0], locs[1]):
				if x == idx:
					return True
		return False
	def get_compounds(self):
		# print(self.obj)
		road_words = ["avenue", "street", "road", "boulevard"]
		intersections = {}
		contain_words = [" in ", " at "]
		lastEnd = 0
		sentence = self.obj
		lastCompound = False

		for span in self.obj['spans']:
			if ' and ' in span:
				for word in road_words:
					if word in span.lower():
						if 'intersections' in intersections and span not in intersections['intersections']:
							intersections['intersections'].append(span)
						else:
							intersections['intersections'] = [span]

		# Simple one word separations

		for idx, span_loc in enumerate(self.obj['span_locs']):

			if span_loc[0] - lastEnd == 1 and span_loc[0] != 1:
				compound = sentence['sentence'][lastEnd]
				compound_span = sentence['spans'][idx -1] + " " + compound + " " + sentence['spans'][idx ]
				if compound == "and":
					street = False
					for word in road_words:
						if word in compound_span.lower():
							street = True
					if street: 
						if 'intersections' in intersections:
							intersections['intersections'].append(compound_span)
						else:
							intersections['intersections'] = [compound_span]
						continue
				if compound in intersections:
					intersections[compound].append(compound_span)
				else:
					intersections[compound] = [compound_span]
				if lastCompound:
					lastCompound = lastCompound + " " + compound + " "  + sentence['spans'][idx ]
					if 'multi' in intersections:
						intersections['multi'].append(lastCompound)
					else:
						intersections['multi'] = [lastCompound]
				else:
					lastCompound = compound_span
			else:
				lastCompound = ""
			lastEnd = span_loc[1]

		

		sent = " ".join(sentence['sentence'])
		doc = self.nlp(sent)
		span = 0
		span_active = False
		for idx, token in enumerate(doc):
			
			if span < len(self.obj['span_locs']):
				if idx == self.obj['span_locs'][span][0]:
					span_active = True
				if idx == self.obj['span_locs'][span][1]:
					span_active = False
					span += 1
			if span_active:
				# print(token.text)
				if token.head.pos_ == "ADP":
					# print(token.text)
					# print(token.head.head.text)
					frontIdx = token.head.head.i
					for idx2, locs in enumerate(self.obj['span_locs']):
						for x in range(locs[0], locs[1]):
							if x == frontIdx and idx >locs[1]:
								# print(idx)
								new_span = sentence['sentence'][locs[0]:idx+1] 
								# print(new_span)
								if 'prep' in intersections:
									intersections['prep'].append(" ".join(new_span))
								else:
									intersections['prep'] = [" ".join(new_span)]
				if token.dep_ == "appos":
					frontIdx = token.head.i
					for idx2, locs in enumerate(self.obj['span_locs']):
						for x in range(locs[0], locs[1]):
							if x == frontIdx and idx >locs[1]:
								# print(idx)
								new_span = sentence['sentence'][locs[0]:idx+1] 
							
								if 'appos' in intersections:
									intersections['appos'].append(" ".join(new_span))
									# intersections['apposLocs'].append(x)
								else:
									intersections['appos'] = [" ".join(new_span)]
									# intersections['apposLocs'] = [x]

					# token_children = [child.text for child in token.head.head.children]
					# print(token_children)
			if token.pos_ == "NOUN":
				token_children = [child for child in token.head.head.children]
				location_kids = 0
				for child in token_children:
					# print(child.text)
					if self.in_span_loc(child.i) and child.dep_ == "nmod":
						location_kids+=1
				# print(location_kids)


		return intersections


if __name__ == "__main__":
	sentence = {
	    "sentence": ["The", "football", "teams", "from", "Camden", "and", "Timber", "Creek", "high", "schools", "were", "scheduled", "to", "meet", "on", "the", "Farnham", "Park", "field", "in", "October", "."],
	    "spans": ["Camden", "Timber Creek", "Farnham Park"],
	    "span_locs": [
	        [4, 5],
	        [6, 8],
	        [16, 18]
	    ],
	    "span_data": [
	    {
	        "ref": [1201615],
	        "address": "",
	        "latlng": []
	    },
	    {
	        "ref": [],
	        "address": "2021 S John Redditt Dr, Lufkin, TX 75904, USA",
	        "latlng": [31.3111983, -94.7450149]
	    },
	    {
	        "ref": [],
	        "address": "3333 Turtle Creek Dr, Port Arthur, TX 77642, USA",
	        "latlng": [29.9484424, -93.9840698]
	    }],
	    "compounds":
	    {
	        "and": ["Camden and Timber Creek"]
	    }
	}
	processor = CompoundParser(sentence)
	processor.load_sent()