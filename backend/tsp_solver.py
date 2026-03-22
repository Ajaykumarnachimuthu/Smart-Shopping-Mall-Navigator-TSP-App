import math
from itertools import permutations
import numpy as np

class TSPSolver:
    def __init__(self, stores, start_point=None):
        self.stores = stores
        self.start_point = start_point or {"x": 0, "y": 0, "name": "Entrance"}
        self.distance_matrix = self._calculate_distance_matrix()
        
    def _calculate_distance_matrix(self):
        """Calculate distance matrix between all points including start point"""
        points = [self.start_point] + self.stores
        n = len(points)
        matrix = [[0] * n for _ in range(n)]
        
        for i in range(n):
            for j in range(n):
                if i != j:
                    matrix[i][j] = math.sqrt(
                        (points[i]["x"] - points[j]["x"])**2 + 
                        (points[i]["y"] - points[j]["y"])**2
                    )
        return matrix
    
    def greedy_tsp(self):
        """Greedy algorithm for TSP"""
        n = len(self.distance_matrix)
        visited = [False] * n
        path = [0]  # Start from entrance
        visited[0] = True
        total_distance = 0
        
        for _ in range(n - 1):
            current = path[-1]
            min_distance = float('inf')
            next_store = -1
            
            for i in range(n):
                if not visited[i] and self.distance_matrix[current][i] < min_distance:
                    min_distance = self.distance_matrix[current][i]
                    next_store = i
            
            if next_store != -1:
                visited[next_store] = True
                path.append(next_store)
                total_distance += min_distance
        
        # Return to entrance
        total_distance += self.distance_matrix[path[-1]][0]
        
        return path, total_distance
    
    def dynamic_programming_tsp(self):
        """Dynamic Programming solution for TSP (Held-Karp algorithm)"""
        n = len(self.distance_matrix)
        if n > 15:  # DP becomes slow for large n
            return None, float('inf')
        
        # DP[mask][i] = min distance to visit set 'mask' ending at node i
        dp = [[float('inf')] * n for _ in range(1 << n)]
        parent = [[-1] * n for _ in range(1 << n)]
        
        # Initialize: start from node 0
        dp[1 << 0][0] = 0
        
        # Iterate over all masks
        for mask in range(1 << n):
            for i in range(n):
                if dp[mask][i] < float('inf'):
                    # Try all unvisited nodes
                    for j in range(n):
                        if not (mask & (1 << j)):
                            new_mask = mask | (1 << j)
                            new_dist = dp[mask][i] + self.distance_matrix[i][j]
                            if new_dist < dp[new_mask][j]:
                                dp[new_mask][j] = new_dist
                                parent[new_mask][j] = i
        
        # Find minimum distance to complete tour
        full_mask = (1 << n) - 1
        min_distance = float('inf')
        last_node = -1
        
        for i in range(n):
            if i != 0:  # Exclude start node
                total = dp[full_mask][i] + self.distance_matrix[i][0]
                if total < min_distance:
                    min_distance = total
                    last_node = i
        
        # Reconstruct path
        if last_node != -1:
            path = []
            mask = full_mask
            current = last_node
            
            while current != -1:
                path.append(current)
                next_node = parent[mask][current]
                mask &= ~(1 << current)
                current = next_node
            
            path.reverse()
            return path, min_distance
        
        return None, float('inf')
    
    def get_route_details(self, path):
        """Get detailed route information"""
        points = [self.start_point] + self.stores
        route = []
        total_time = 0
        walking_speed = 1.5  # meters per second (approx)
        
        for i in range(len(path) - 1):
            current = points[path[i]]
            next_point = points[path[i + 1]]
            distance = self.distance_matrix[path[i]][path[i + 1]]
            time = distance / walking_speed
            
            route.append({
                "from": current["name"],
                "to": next_point["name"],
                "distance": round(distance, 2),
                "time": round(time, 2)
            })
            total_time += time
        
        # Return to entrance
        last_to_entrance = self.distance_matrix[path[-1]][0]
        route.append({
            "from": points[path[-1]]["name"],
            "to": "Entrance",
            "distance": round(last_to_entrance, 2),
            "time": round(last_to_entrance / walking_speed, 2)
        })
        total_time += last_to_entrance / walking_speed
        
        return route, round(total_time, 2)