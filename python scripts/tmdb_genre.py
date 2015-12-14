import json
import csv

with open("data.json") as json_file, open("TMDB_genres.csv", "w",encoding='utf-8') as csv_file:
    csv_file = csv.writer(csv_file, lineterminator='\n')
    a = json.load(json_file)
    csv_file.writerow(["id", "genres"])
    for item in a:
        for b in range(0, len(item['genres'])):                         
            csv_file.writerow([item['id'], item['genres'][b]])
