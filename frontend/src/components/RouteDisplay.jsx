import React from 'react';

const RouteDisplay = ({ routeData }) => {
    const { ordered_stores, total_distance, total_time, algorithm_used, route } = routeData;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Optimized Route</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 mb-1">Total Distance</p>
                    <p className="text-2xl font-bold text-blue-700">{total_distance} m</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 mb-1">Estimated Time</p>
                    <p className="text-2xl font-bold text-purple-700">{total_time} min</p>
                </div>
            </div>

            {/* Algorithm Info */}
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                    Algorithm used: <span className="font-semibold text-gray-800 capitalize">{algorithm_used}</span>
                </p>
            </div>

            {/* Ordered Stores */}
            <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Shopping Route Order:</h3>
                <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span className="w-8">📍</span>
                        <span>Entrance (Start)</span>
                    </div>

                    {ordered_stores.map((store, index) => (
                        <div key={store.id} className="flex items-center p-2 bg-gray-50 rounded-lg">
                            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                {index + 1}
                            </span>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800">{store.name}</p>
                                <p className="text-xs text-gray-500">{store.category}</p>
                            </div>
                            {store.crowd_level && (
                                <span className="text-xs text-orange-600">
                                    Crowd: {Math.round(store.crowd_level * 100)}%
                                </span>
                            )}
                        </div>
                    ))}

                    <div className="flex items-center text-sm text-gray-500 mt-2">
                        <span className="w-8">🏁</span>
                        <span>Return to Entrance</span>
                    </div>
                </div>
            </div>

            {/* Step by Step Directions */}
            <div>
                <h3 className="font-semibold text-gray-800 mb-3">Step-by-Step Directions:</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {route.map((step, idx) => (
                        <div key={idx} className="text-sm p-2 border-l-4 border-blue-500 bg-gray-50">
                            <p className="text-gray-800">
                                {step.from} → {step.to}
                            </p>
                            <p className="text-gray-500 text-xs">
                                Distance: {step.distance}m | Time: {step.time}min
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RouteDisplay;