import random
import numpy as np

class GeneticTSP:
    def __init__(self, distance_matrix, population_size=100, generations=500, 
                 mutation_rate=0.02, elitism_rate=0.1):
        self.distance_matrix = distance_matrix
        self.n_cities = len(distance_matrix)
        self.population_size = population_size
        self.generations = generations
        self.mutation_rate = mutation_rate
        self.elitism_rate = elitism_rate
        
    def create_individual(self):
        """Create a random route"""
        individual = list(range(1, self.n_cities))  # Exclude start node
        random.shuffle(individual)
        return [0] + individual  # Start from entrance
    
    def calculate_fitness(self, individual):
        """Calculate total distance (lower is better)"""
        total = 0
        for i in range(len(individual) - 1):
            total += self.distance_matrix[individual[i]][individual[i + 1]]
        total += self.distance_matrix[individual[-1]][0]  # Return to entrance
        return 1 / total if total > 0 else float('inf')
    
    def selection(self, population, fitnesses):
        """Tournament selection"""
        tournament_size = 3
        selected = []
        
        for _ in range(len(population)):
            tournament = random.sample(list(zip(population, fitnesses)), tournament_size)
            winner = max(tournament, key=lambda x: x[1])[0]
            selected.append(winner)
        
        return selected
    
    def crossover(self, parent1, parent2):
        """Order crossover (OX)"""
        if len(parent1) <= 2:
            return parent1.copy()
        
        start, end = sorted(random.sample(range(1, len(parent1)), 2))
        
        child = [-1] * len(parent1)
        child[0] = 0  # Start point fixed
        
        # Copy segment from parent1
        for i in range(start, end + 1):
            child[i] = parent1[i]
        
        # Fill remaining from parent2
        current_pos = end + 1
        for i in range(1, len(parent2)):
            if parent2[i] not in child:
                if current_pos >= len(child):
                    current_pos = 1
                while child[current_pos] != -1:
                    current_pos += 1
                    if current_pos >= len(child):
                        current_pos = 1
                child[current_pos] = parent2[i]
        
        return child
    
    def mutate(self, individual):
        """Swap mutation"""
        if random.random() < self.mutation_rate:
            i, j = random.sample(range(1, len(individual)), 2)
            individual[i], individual[j] = individual[j], individual[i]
        return individual
    
    def evolve(self):
        """Run genetic algorithm"""
        # Initialize population
        population = [self.create_individual() for _ in range(self.population_size)]
        best_individual = None
        best_fitness = float('-inf')
        
        for generation in range(self.generations):
            # Calculate fitness
            fitnesses = [self.calculate_fitness(ind) for ind in population]
            
            # Track best
            current_best_idx = np.argmax(fitnesses)
            if fitnesses[current_best_idx] > best_fitness:
                best_fitness = fitnesses[current_best_idx]
                best_individual = population[current_best_idx].copy()
            
            # Selection
            selected = self.selection(population, fitnesses)
            
            # Create new population
            new_population = []
            
            # Elitism
            elite_size = int(self.population_size * self.elitism_rate)
            elite_indices = np.argsort(fitnesses)[-elite_size:]
            for idx in elite_indices:
                new_population.append(population[idx].copy())
            
            # Crossover
            while len(new_population) < self.population_size:
                parent1 = random.choice(selected)
                parent2 = random.choice(selected)
                child = self.crossover(parent1, parent2)
                child = self.mutate(child)
                new_population.append(child)
            
            population = new_population
        
        # Calculate total distance for best individual
        total_distance = 1 / best_fitness if best_fitness > 0 else float('inf')
        
        return best_individual, total_distance