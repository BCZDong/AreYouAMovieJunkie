import json
import csv

with open("data.json") as json_file, open("TMDB_personinfo.csv", "w",encoding='utf-8') as csv_file:
    csv_file = csv.writer(csv_file, lineterminator='\n')
    a = json.load(json_file)
    csv_file.writerow(["id", "name", "DOB", "image"])
    for item in a:
        csv_file.writerow([item['personId'], item['name'], item['dayofbirth'], item['profile']])