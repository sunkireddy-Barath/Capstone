"""Generates a realistic MDDS-format sample Excel file for ETL testing."""
import openpyxl
import os

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Villages"

headers = [
    "MDDS STC", "STATE NAME",
    "MDDS DTC", "DISTRICT NAME",
    "MDDS Sub_DT", "SUB-DISTRICT NAME",
    "MDDS PLCN", "Area Name"
]
ws.append(headers)

SAMPLE_DATA = [
    # Maharashtra
    ("27","Maharashtra","497","Nandurbar","03950","Akkalkuwa","525001","Akkalkuwa"),
    ("27","Maharashtra","497","Nandurbar","03950","Akkalkuwa","525002","Manibeli"),
    ("27","Maharashtra","497","Nandurbar","03950","Akkalkuwa","525003","Dhankhedi"),
    ("27","Maharashtra","497","Nandurbar","03950","Akkalkuwa","525004","Chimalkhadi"),
    ("27","Maharashtra","497","Nandurbar","03950","Akkalkuwa","525005","Sinduri"),
    ("27","Maharashtra","497","Nandurbar","03951","Akrani","525010","Akrani"),
    ("27","Maharashtra","497","Nandurbar","03951","Akrani","525011","Toranmal"),
    ("27","Maharashtra","497","Nandurbar","03951","Akrani","525012","Dhadgaon"),
    ("27","Maharashtra","498","Dhule","03960","Dhule","526001","Dhule"),
    ("27","Maharashtra","498","Dhule","03960","Dhule","526002","Shirpur"),
    ("27","Maharashtra","498","Dhule","03960","Dhule","526003","Sakri"),
    ("27","Maharashtra","498","Dhule","03961","Sakri","526010","Sakri Town"),
    ("27","Maharashtra","498","Dhule","03961","Sakri","526011","Pimpalner"),
    # Delhi
    ("07","Delhi","012","Central Delhi","00120","Paharganj","100001","Paharganj"),
    ("07","Delhi","012","Central Delhi","00120","Paharganj","100002","Connaught Place"),
    ("07","Delhi","012","Central Delhi","00120","Paharganj","100003","Karol Bagh"),
    ("07","Delhi","013","North Delhi","00130","Civil Lines","100010","Civil Lines"),
    ("07","Delhi","013","North Delhi","00130","Civil Lines","100011","Timarpur"),
    ("07","Delhi","013","North Delhi","00131","Model Town","100020","Model Town"),
    ("07","Delhi","013","North Delhi","00131","Model Town","100021","Mukherjee Nagar"),
    # Tamil Nadu
    ("33","Tamil Nadu","603","Chennai","06030","Chennai North","600001","Fort"),
    ("33","Tamil Nadu","603","Chennai","06030","Chennai North","600002","Washermanpet"),
    ("33","Tamil Nadu","603","Chennai","06030","Chennai North","600003","Tondiarpet"),
    ("33","Tamil Nadu","603","Chennai","06031","Chennai South","600010","Adyar"),
    ("33","Tamil Nadu","603","Chennai","06031","Chennai South","600011","Velachery"),
    ("33","Tamil Nadu","603","Chennai","06031","Chennai South","600012","Tambaram"),
    ("33","Tamil Nadu","604","Kancheepuram","06040","Kancheepuram","603001","Kancheepuram"),
    ("33","Tamil Nadu","604","Kancheepuram","06040","Kancheepuram","603002","Uthiramerur"),
    # Karnataka
    ("29","Karnataka","572","Bangalore Urban","05720","Bangalore North","560001","Rajajinagar"),
    ("29","Karnataka","572","Bangalore Urban","05720","Bangalore North","560002","Malleshwaram"),
    ("29","Karnataka","572","Bangalore Urban","05720","Bangalore North","560003","Yeshwanthpur"),
    ("29","Karnataka","572","Bangalore Urban","05721","Bangalore South","560010","Jayanagar"),
    ("29","Karnataka","572","Bangalore Urban","05721","Bangalore South","560011","BTM Layout"),
    ("29","Karnataka","572","Bangalore Urban","05721","Bangalore South","560012","Electronic City"),
    ("29","Karnataka","573","Mysore","05730","Mysore","570001","Mysore City"),
    ("29","Karnataka","573","Mysore","05730","Mysore","570002","Nanjangud"),
    # Uttar Pradesh
    ("09","Uttar Pradesh","155","Lucknow","01550","Lucknow","226001","Hazratganj"),
    ("09","Uttar Pradesh","155","Lucknow","01550","Lucknow","226002","Gomti Nagar"),
    ("09","Uttar Pradesh","155","Lucknow","01550","Lucknow","226003","Aliganj"),
    ("09","Uttar Pradesh","155","Lucknow","01551","Malihabad","226010","Malihabad"),
    ("09","Uttar Pradesh","155","Lucknow","01551","Malihabad","226011","Kakori"),
    ("09","Uttar Pradesh","156","Kanpur","01560","Kanpur City","208001","Kanpur City"),
    ("09","Uttar Pradesh","156","Kanpur","01560","Kanpur City","208002","Rawatpur"),
    # Gujarat
    ("24","Gujarat","479","Ahmedabad","04790","Ahmedabad City","380001","Ahmedabad"),
    ("24","Gujarat","479","Ahmedabad","04790","Ahmedabad City","380002","Maninagar"),
    ("24","Gujarat","479","Ahmedabad","04790","Ahmedabad City","380003","Naranpura"),
    ("24","Gujarat","479","Ahmedabad","04791","Daskroi","380010","Vatva"),
    ("24","Gujarat","480","Surat","04800","Surat City","395001","Surat"),
    ("24","Gujarat","480","Surat","04800","Surat City","395002","Athwa"),
    # Rajasthan
    ("08","Rajasthan","083","Jaipur","00830","Jaipur","302001","Jaipur City"),
    ("08","Rajasthan","083","Jaipur","00830","Jaipur","302002","Vaishali Nagar"),
    ("08","Rajasthan","083","Jaipur","00830","Jaipur","302003","Mansarovar"),
    ("08","Rajasthan","083","Jaipur","00831","Sanganer","302010","Sanganer"),
    ("08","Rajasthan","084","Jodhpur","00840","Jodhpur","342001","Jodhpur City"),
    ("08","Rajasthan","084","Jodhpur","00840","Jodhpur","342002","Ratanada"),
    # West Bengal
    ("19","West Bengal","316","Kolkata","03160","Kolkata","700001","Esplanade"),
    ("19","West Bengal","316","Kolkata","03160","Kolkata","700002","Howrah Bridge"),
    ("19","West Bengal","316","Kolkata","03160","Kolkata","700003","Park Street"),
    ("19","West Bengal","316","Kolkata","03161","Garden Reach","700010","Garden Reach"),
    ("19","West Bengal","317","Howrah","03170","Howrah","711001","Howrah City"),
    ("19","West Bengal","317","Howrah","03170","Howrah","711002","Shibpur"),
    # Madhya Pradesh
    ("23","Madhya Pradesh","445","Bhopal","04450","Bhopal City","462001","Bhopal"),
    ("23","Madhya Pradesh","445","Bhopal","04450","Bhopal City","462002","Kolar Road"),
    ("23","Madhya Pradesh","445","Bhopal","04450","Bhopal City","462003","Berasia"),
    # Kerala
    ("32","Kerala","592","Thiruvananthapuram","05920","Thiruvananthapuram","695001","Palayam"),
    ("32","Kerala","592","Thiruvananthapuram","05920","Thiruvananthapuram","695002","Kazhakkoottam"),
    ("32","Kerala","592","Thiruvananthapuram","05920","Thiruvananthapuram","695003","Attingal"),
    # Punjab
    ("03","Punjab","040","Amritsar","00400","Amritsar City","143001","Amritsar"),
    ("03","Punjab","040","Amritsar","00400","Amritsar City","143002","Batala"),
    ("03","Punjab","041","Ludhiana","00410","Ludhiana City","141001","Ludhiana"),
    ("03","Punjab","041","Ludhiana","00410","Ludhiana City","141002","Sahnewal"),
    # Intentional duplicates to test deduplication
    ("27","Maharashtra","497","Nandurbar","03950","Akkalkuwa","525002","Manibeli"),
    ("33","Tamil Nadu","603","Chennai","06030","Chennai North","600001","Fort"),
    # Intentional bad rows (nulls)
    ("","","497","Nandurbar","03950","Akkalkuwa","525999","TestBad"),
    ("27","Maharashtra","","","03950","Akkalkuwa","525998","TestBad2"),
]

for row in SAMPLE_DATA:
    ws.append(row)

out = "etl/sample_mdds_dataset.xlsx"
wb.save(out)
print(f"Sample dataset saved: {out} ({len(SAMPLE_DATA)} rows, includes 2 dupes + 2 bad rows)")
