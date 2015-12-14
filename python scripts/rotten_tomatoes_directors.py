import json
import csv

with open("data2.json") as json_file, open("data2.csv", "w",encoding='utf-8') as csv_file:
	csv_file = csv.writer(csv_file, lineterminator='\n')
	a = json.load(json_file)
	csv_file.writerow(["id", "directors"])
	for item in a:
		if (item['abridged_directors']):
			csv_file.writerow([item['id'], item['abridged_directors']])
		else:
			csv_file.writerow([item['id'], NULL])