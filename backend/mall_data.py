import math

# Mall store data with coordinates and categories
MALL_DATA = {
    "stores": [
        {"id": 1, "name": "Apple Store", "category": "electronics", "x": 100, "y": 50, "crowd_level": 0.8, "priority": 3},
        {"id": 2, "name": "Samsung", "category": "electronics", "x": 150, "y": 45, "crowd_level": 0.7, "priority": 3},
        {"id": 3, "name": "Nike", "category": "shoes", "x": 200, "y": 100, "crowd_level": 0.9, "priority": 2},
        {"id": 4, "name": "Adidas", "category": "shoes", "x": 180, "y": 110, "crowd_level": 0.6, "priority": 2},
        {"id": 5, "name": "Zara", "category": "clothing", "x": 50, "y": 150, "crowd_level": 0.7, "priority": 1},
        {"id": 6, "name": "H&M", "category": "clothing", "x": 70, "y": 140, "crowd_level": 0.5, "priority": 1},
        {"id": 7, "name": "Sephora", "category": "beauty", "x": 250, "y": 80, "crowd_level": 0.6, "priority": 2},
        {"id": 8, "name": "Starbucks", "category": "food", "x": 30, "y": 30, "crowd_level": 0.9, "priority": 4},
        {"id": 9, "name": "Food Court", "category": "food", "x": 220, "y": 160, "crowd_level": 0.8, "priority": 4},
        {"id": 10, "name": "Best Buy", "category": "electronics", "x": 120, "y": 90, "crowd_level": 0.7, "priority": 3},
        {"id": 11, "name": "Foot Locker", "category": "shoes", "x": 190, "y": 95, "crowd_level": 0.6, "priority": 2},
        {"id": 12, "name": "Forever 21", "category": "clothing", "x": 60, "y": 130, "crowd_level": 0.5, "priority": 1},
    ]
}

# Category to store mapping
CATEGORY_MAP = {
    "electronics": ["Apple Store", "Samsung", "Best Buy"],
    "shoes": ["Nike", "Adidas", "Foot Locker"],
    "clothing": ["Zara", "H&M", "Forever 21"],
    "beauty": ["Sephora"],
    "food": ["Starbucks", "Food Court"]
}

def calculate_distance(store1, store2):
    """Calculate Euclidean distance between two stores"""
    return math.sqrt((store1["x"] - store2["x"])**2 + (store1["y"] - store2["y"])**2)

def get_store_by_category(category):
    """Get stores by category"""
    store_names = CATEGORY_MAP.get(category.lower(), [])
    return [store for store in MALL_DATA["stores"] if store["name"] in store_names]

def get_store_by_name(name):
    """Get store by name"""
    for store in MALL_DATA["stores"]:
        if store["name"].lower() == name.lower():
            return store
    return None