import json

with open('components.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

components = data['components']
all_have_brand = True

for category, items in components.items():
    for item in items:
        if 'brand' not in item:
            all_have_brand = False
            print(f"Item {item.get('id', 'unknown')} in category {category} missing 'brand' field")

if all_have_brand:
    print('All components have "brand" field')
else:
    print('Some components are missing "brand" field')
