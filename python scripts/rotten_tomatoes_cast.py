import json
import csv

with open("data.json") as json_file, open("rotten_tomatoes_cast.csv", "w",encoding='utf-8') as csv_file:
    csv_file = csv.writer(csv_file, lineterminator='\n')
    a = json.load(json_file)
    csv_file.writerow(["id","IMDB_id", "name", "character", "actor_id"])
    for item in a:
        if 'abridged_cast' in item:
            for b in item['abridged_cast']:
                if 'characters' in b:
                    for c in range(0, len(b['characters'])):
                        csv_file.writerow([item['id'], item['alternate_ids'].get('imdb'), b['name'], b['characters'][c], b['id']])
                else:
                    csv_file.writerow([item['id'], item['alternate_ids'].get('imdb'), b['name'], None, b['id']])       
        else:
            csv_file.writerow([item['id'], 0])