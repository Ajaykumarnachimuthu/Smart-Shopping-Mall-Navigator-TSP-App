import React, { useState, useEffect } from 'react';
import ShoppingForm from './components/ShoppingForm';
import RouteDisplay from './components/RouteDisplay';
import RouteVisualization from './components/RouteVisualization';
import StoreMap from './components/StoreMap';
import axios from 'axios';

// Use environment variable for API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
    const [routeData, setRouteData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [algorithm, setAlgorithm] = useState('greedy');
    const [optimizeFor, setOptimizeFor] = useState('distance');
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);

    useEffect(() => {
        // Fetch all stores for the map
        axios.get(`${API_URL}/stores`)
            .then(response => {
                setStores(response.data.stores);
            })
            .catch(error => {
                console.error('Error fetching stores:', error);
                setError('Failed to connect to the server. Please check your connection.');
            });
    }, []);

    const handleOptimize = async (items) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_URL}/optimize-route`, {
                items: items,
                algorithm: algorithm,
                optimize_for: optimizeFor
            });

            if (response.data.error) {
                setError(response.data.error);
            } else {
                setRouteData(response.data);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to optimize route. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStoreSelect = (store) => {
        setSelectedStore(store);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-10 animate-fadeIn">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Smart Shopping Mall Navigator
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Optimize your shopping route using AI-powered TSP algorithms
                    </p>
                </div>

                {/* Controls */}
                <div className="max-w-6xl mx-auto mb-8 flex gap-4 justify-end flex-wrap">
                    <select
                        value={algorithm}
                        onChange={(e) => setAlgorithm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="greedy">Greedy Algorithm (Fast)</option>
                        <option value="dp">Dynamic Programming (Optimal)</option>
                        <option value="genetic">Genetic Algorithm (Near-Optimal)</option>
                    </select>

                    <select
                        value={optimizeFor}
                        onChange={(e) => setOptimizeFor(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="distance">🚶 Optimize for Distance</option>
                        <option value="time">⏱️ Optimize for Time</option>
                    </select>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    <ShoppingForm onOptimize={handleOptimize} loading={loading} />

                    {routeData && (
                        <RouteDisplay routeData={routeData} />
                    )}
                </div>

                {/* Store Map */}
                <div className="mt-8 max-w-6xl mx-auto">
                    <StoreMap
                        stores={stores}
                        onStoreSelect={handleStoreSelect}
                        selectedStore={selectedStore}
                        routeCoordinates={routeData?.coordinates}
                    />
                </div>

                {/* Route Visualization */}
                {routeData && routeData.coordinates && (
                    <div className="mt-8 max-w-6xl mx-auto">
                        <RouteVisualization coordinates={routeData.coordinates} />
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="max-w-6xl mx-auto mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;