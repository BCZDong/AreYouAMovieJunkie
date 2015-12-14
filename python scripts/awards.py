import json
import csv

with open("data.json") as json_file, open("oscars.csv", "w",encoding='utf-8') as csv_file:
    csv_file = csv.writer(csv_file, lineterminator='\n')
    a = json.load(json_file)
    csv_file.writerow(["year", "category", "nominee", "hint", "Won?"])
    for item in a:
        if item['Category']=='Actor -- Leading Role' or item['Category']=='Actress -- Leading Role' or item['Category']=='Actor -- Supporting Role' or item['Category']=='Actress -- Supporting Role' or item['Category']=='Directing' or item['Category']=='Animated Feature Film' or item['Category']=='Best Picture':
            csv_file.writerow([item['Year'][:4], item['Category'], item['Nominee'], item['Additional Info'], item['Won?']])