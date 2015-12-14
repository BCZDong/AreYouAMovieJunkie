import json
import csv

with open("data.json") as json_file, open("TMDB_cast.csv", "w",encoding='utf-8') as csv_file:
    csv_file = csv.writer(csv_file, lineterminator='\n')
    a = json.load(json_file)
    csv_file.writerow(["id", "person_id", "character"])
    for item in a:
        if 'cast' in item:
            for b in item['cast']:
                if len(b['character']) != 0:                     
                    csv_file.writerow([item['id'], b['personId'], b['character']])
        else:
            csv_file.writerow([item['id'], 0])