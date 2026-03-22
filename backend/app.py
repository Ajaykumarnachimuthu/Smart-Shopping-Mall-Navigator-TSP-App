from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime
from mall_data import MALL_DATA, get_store_by_category, get_store_by_name, calculate_distance
from tsp_solver import TSPSolver
from genetic_algorithm import GeneticTSP

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS for production
ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', 'https://your-frontend.vercel.app').split(',')
CORS(app, resources={
    r"/api/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for Railway"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Smart Shopping Mall Navigator API",
        "version": "1.0.0"
    })

@app.route('/api/stores', methods=['GET'])
def get_stores():
    """Get all available stores"""
    try:
        return jsonify({
            "stores": MALL_DATA["stores"],
            "categories": list(set(store["category"] for store in MALL_DATA["stores"])),
            "total": len(MALL_DATA["stores"])
        })
    except Exception as e:
        logger.error(f"Error fetching stores: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/optimize-route', methods=['POST'])
def optimize_route():
    """Optimize shopping route"""
    try:
        data = request.json
        items = data.get('items', [])
        algorithm = data.get('algorithm', 'greedy')
        optimize_for = data.get('optimize_for', 'distance')
        
        if not items:
            return jsonify({"error": "No items provided"}), 400
        
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
                algorithm = 'genetic (fallback)'
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
        
        response = {
            "route": route,
            "ordered_stores": ordered_stores,
            "total_distance": round(total_distance, 2),
            "total_time": total_time,
            "algorithm_used": algorithm,
            "coordinates": [(point["x"], point["y"]) for point in ordered_stores],
            "total_stores": len(ordered_stores)
        }
        
        logger.info(f"Route optimized for {len(ordered_stores)} stores using {algorithm}")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error optimizing route: {str(e)}")
        return jsonify({"error": "Failed to optimize route"}), 500

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """Get store recommendations based on items"""
    try:
        data = request.json
        items = data.get('items', [])
        
        recommendations = []
        for item in items:
            store = get_store_by_name(item)
            if store:
                nearby = []
                for other in MALL_DATA["stores"]:
                    if other["id"] != store["id"]:
                        distance = calculate_distance(store, other)
                        if distance < 100:
                            nearby.append({
                                "name": other["name"],
                                "category": other["category"],
                                "distance": round(distance, 2),
                                "offer": f"20% off on {other['category']}" if other['crowd_level'] > 0.7 else "Buy 1 Get 1 Free"
                            })
                recommendations.append({
                    "store": store["name"],
                    "nearby": sorted(nearby, key=lambda x: x["distance"])[:3]
                })
        
        return jsonify({"recommendations": recommendations})
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {str(e)}")
        return jsonify({"error": "Failed to get recommendations"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)