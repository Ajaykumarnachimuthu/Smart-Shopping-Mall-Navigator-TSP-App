from flask import Flask, request, jsonify
from flask_cors import CORS
from mall_data import MALL_DATA, get_store_by_category, get_store_by_name, calculate_distance
from tsp_solver import TSPSolver
from genetic_algorithm import GeneticTSP
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route('/api/stores', methods=['GET'])
def get_stores():
    """Get all available stores"""
    return jsonify({
        "stores": MALL_DATA["stores"],
        "categories": list(set(store["category"] for store in MALL_DATA["stores"]))
    })

@app.route('/api/optimize-route', methods=['POST'])
def optimize_route():
    """Optimize shopping route"""
    data = request.json
    items = data.get('items', [])
    algorithm = data.get('algorithm', 'greedy')  # greedy, dp, genetic
    optimize_for = data.get('optimize_for', 'distance')  # distance, time
    
    # Map items to stores
    selected_stores = []
    for item in items:
        store = get_store_by_name(item)
        if store:
            selected_stores.append(store)
        else:
            # Try to find by category
            category_stores = get_store_by_category(item)
            if category_stores:
                selected_stores.extend(category_stores)
    
    # Remove duplicates
    selected_stores = list({store["id"]: store for store in selected_stores}.values())
    
    if not selected_stores:
        return jsonify({"error": "No matching stores found"}), 400
    
    # Adjust distances based on crowd levels if optimizing for time
    if optimize_for == 'time':
        for store in selected_stores:
            # Add time penalty for crowded stores
            store['crowd_penalty'] = store.get('crowd_level', 0) * 20
    
    # Solve TSP
    solver = TSPSolver(selected_stores)
    
    if algorithm == 'greedy':
        path, total_distance = solver.greedy_tsp()
    elif algorithm == 'dp':
        path, total_distance = solver.dynamic_programming_tsp()
        if path is None:
            # Fallback to genetic if DP fails
            genetic_solver = GeneticTSP(solver.distance_matrix)
            path, total_distance = genetic_solver.evolve()
    elif algorithm == 'genetic':
        genetic_solver = GeneticTSP(solver.distance_matrix)
        path, total_distance = genetic_solver.evolve()
    else:
        path, total_distance = solver.greedy_tsp()
    
    # Get route details
    route, total_time = solver.get_route_details(path)
    
    # Prepare response
    points = [solver.start_point] + selected_stores
    ordered_stores = [points[i] for i in path]
    
    return jsonify({
        "route": route,
        "ordered_stores": ordered_stores,
        "total_distance": round(total_distance, 2),
        "total_time": total_time,
        "algorithm_used": algorithm,
        "coordinates": [(point["x"], point["y"]) for point in ordered_stores]
    })

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """Get store recommendations based on items"""
    data = request.json
    items = data.get('items', [])
    
    # Simple recommendation based on nearby stores
    recommendations = []
    for item in items:
        store = get_store_by_name(item)
        if store:
            # Find nearby stores
            nearby = []
            for other in MALL_DATA["stores"]:
                if other["id"] != store["id"]:
                    distance = calculate_distance(store, other)
                    if distance < 100:  # Within 100 units
                        nearby.append({
                            "name": other["name"],
                            "distance": round(distance, 2),
                            "offer": f"20% off on {other['category']}" if other['crowd_level'] > 0.7 else "Buy 1 Get 1 Free"
                        })
            recommendations.append({
                "store": store["name"],
                "nearby": sorted(nearby, key=lambda x: x["distance"])[:3]
            })
    
    return jsonify({"recommendations": recommendations})

if __name__ == '__main__':
    app.run(debug=True, port=5000)