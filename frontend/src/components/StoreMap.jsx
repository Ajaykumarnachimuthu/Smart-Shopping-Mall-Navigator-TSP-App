import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StoreMap = ({ stores, onStoreSelect, selectedStore, routeCoordinates }) => {
    const [hoveredStore, setHoveredStore] = useState(null);
    const [mapData, setMapData] = useState(null);

    useEffect(() => {
        // Fetch store data if not provided
        if (!stores) {
            axios.get('http://localhost:5000/api/stores')
                .then(response => {
                    setMapData(response.data.stores);
                })
                .catch(error => console.error('Error fetching store data:', error));
        }
    }, [stores]);

    const displayStores = stores || mapData;
    const canvasRef = React.useRef(null);

    React.useEffect(() => {
        if (!displayStores) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions
        canvas.width = 800;
        canvas.height = 600;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Find bounds for scaling
        const xs = displayStores.map(store => store.x);
        const ys = displayStores.map(store => store.y);
        const minX = Math.min(...xs, 0);
        const maxX = Math.max(...xs, 300);
        const minY = Math.min(...ys, 0);
        const maxY = Math.max(...ys, 200);

        // Add padding
        const padding = 60;
        const scaleX = (canvas.width - 2 * padding) / (maxX - minX);
        const scaleY = (canvas.height - 2 * padding) / (maxY - minY);

        // Transform function
        const transform = (x, y) => ({
            x: padding + (x - minX) * scaleX,
            y: canvas.height - padding - (y - minY) * scaleY
        });

        // Draw background grid
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const x = padding + (i / 10) * (canvas.width - 2 * padding);
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, canvas.height - padding);
            ctx.stroke();

            const y = padding + (i / 10) * (canvas.height - 2 * padding);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
        }

        // Draw route if provided
        if (routeCoordinates && routeCoordinates.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 4]);

            for (let i = 0; i < routeCoordinates.length - 1; i++) {
                const from = transform(routeCoordinates[i][0], routeCoordinates[i][1]);
                const to = transform(routeCoordinates[i + 1][0], routeCoordinates[i + 1][1]);

                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();
            }

            // Return route
            if (routeCoordinates.length > 0) {
                const last = transform(routeCoordinates[routeCoordinates.length - 1][0], routeCoordinates[routeCoordinates.length - 1][1]);
                const first = transform(routeCoordinates[0][0], routeCoordinates[0][1]);

                ctx.beginPath();
                ctx.moveTo(last.x, last.y);
                ctx.lineTo(first.x, first.y);
                ctx.stroke();
            }

            ctx.setLineDash([]);
        }

        // Draw all stores
        displayStores.forEach((store, index) => {
            const point = transform(store.x, store.y);
            const isSelected = selectedStore && selectedStore.id === store.id;
            const isHovered = hoveredStore && hoveredStore.id === store.id;

            // Draw store icon
            ctx.beginPath();
            ctx.arc(point.x, point.y, 12, 0, 2 * Math.PI);

            // Color based on category
            const categoryColors = {
                electronics: '#3b82f6',
                shoes: '#ef4444',
                clothing: '#10b981',
                beauty: '#f59e0b',
                food: '#8b5cf6'
            };

            ctx.fillStyle = categoryColors[store.category] || '#6b7280';
            ctx.fill();
            ctx.strokeStyle = isSelected ? '#000000' : '#ffffff';
            ctx.lineWidth = isSelected ? 3 : 2;
            ctx.stroke();

            // Draw icon
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Simple icons based on category
            const icons = {
                electronics: '📱',
                shoes: '👟',
                clothing: '👕',
                beauty: '💄',
                food: '🍔'
            };

            ctx.fillText(icons[store.category] || '🏪', point.x, point.y);

            // Draw store name on hover or selection
            if (isHovered || isSelected) {
                ctx.fillStyle = '#1f2937';
                ctx.font = 'bold 12px Arial';
                ctx.shadowBlur = 0;
                ctx.fillText(store.name, point.x, point.y - 18);
            }

            // Draw crowd level indicator
            if (store.crowd_level) {
                const crowdRadius = 4;
                const crowdX = point.x + 10;
                const crowdY = point.y - 10;

                ctx.beginPath();
                ctx.arc(crowdX, crowdY, crowdRadius, 0, 2 * Math.PI);
                ctx.fillStyle = store.crowd_level > 0.7 ? '#ef4444' : store.crowd_level > 0.4 ? '#f59e0b' : '#10b981';
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.font = '10px Arial';
                ctx.fillText(Math.round(store.crowd_level * 100) + '%', crowdX, crowdY);
            }
        });

        // Draw entrance
        const entrance = transform(0, 0);
        ctx.beginPath();
        ctx.arc(entrance.x, entrance.y, 15, 0, 2 * Math.PI);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('🚪', entrance.x, entrance.y);
        ctx.font = '10px Arial';
        ctx.fillText('Entrance', entrance.x, entrance.y + 18);

    }, [displayStores, routeCoordinates, selectedStore, hoveredStore]);

    const handleCanvasClick = (e) => {
        if (!displayStores) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        // Find clicked store
        const xs = displayStores.map(store => store.x);
        const ys = displayStores.map(store => store.y);
        const minX = Math.min(...xs, 0);
        const maxX = Math.max(...xs, 300);
        const minY = Math.min(...ys, 0);
        const maxY = Math.max(...ys, 200);

        const padding = 60;
        const scaleXCoord = (canvas.width - 2 * padding) / (maxX - minX);
        const scaleYCoord = (canvas.height - 2 * padding) / (maxY - minY);

        const transformToCanvas = (x, y) => ({
            x: padding + (x - minX) * scaleXCoord,
            y: canvas.height - padding - (y - minY) * scaleYCoord
        });

        let closestStore = null;
        let minDistance = 20; // Click radius

        displayStores.forEach(store => {
            const point = transformToCanvas(store.x, store.y);
            const distance = Math.sqrt((mouseX - point.x) ** 2 + (mouseY - point.y) ** 2);

            if (distance < minDistance) {
                minDistance = distance;
                closestStore = store;
            }
        });

        if (closestStore && onStoreSelect) {
            onStoreSelect(closestStore);
        }
    };

    const handleMouseMove = (e) => {
        if (!displayStores) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        // Find hovered store
        const xs = displayStores.map(store => store.x);
        const ys = displayStores.map(store => store.y);
        const minX = Math.min(...xs, 0);
        const maxX = Math.max(...xs, 300);
        const minY = Math.min(...ys, 0);
        const maxY = Math.max(...ys, 200);

        const padding = 60;
        const scaleXCoord = (canvas.width - 2 * padding) / (maxX - minX);
        const scaleYCoord = (canvas.height - 2 * padding) / (maxY - minY);

        const transformToCanvas = (x, y) => ({
            x: padding + (x - minX) * scaleXCoord,
            y: canvas.height - padding - (y - minY) * scaleYCoord
        });

        let hovered = null;
        let minDistance = 20;

        displayStores.forEach(store => {
            const point = transformToCanvas(store.x, store.y);
            const distance = Math.sqrt((mouseX - point.x) ** 2 + (mouseY - point.y) ** 2);

            if (distance < minDistance) {
                minDistance = distance;
                hovered = store;
            }
        });

        setHoveredStore(hovered);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Mall Map</h2>

            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="w-full h-auto border border-gray-200 rounded-lg cursor-pointer"
                    onClick={handleCanvasClick}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoveredStore(null)}
                />

                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-md text-xs">
                    <p className="font-semibold mb-2">Categories:</p>
                    <div className="space-y-1">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span>Electronics</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            <span>Shoes</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span>Clothing</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            <span>Beauty</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                            <span>Food</span>
                        </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-200">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                            <span>Entrance</span>
                        </div>
                        <div className="flex items-center mt-1">
                            <div className="w-6 h-0.5 bg-blue-500 mr-2"></div>
                            <span>Optimized Route</span>
                        </div>
                        <div className="flex items-center mt-1">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                            <span>Crowd Level Indicator</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Store Info Panel */}
            {hoveredStore && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-gray-800">{hoveredStore.name}</h3>
                            <p className="text-sm text-gray-600">Category: {hoveredStore.category}</p>
                            <p className="text-sm text-gray-600">Location: ({hoveredStore.x}, {hoveredStore.y})</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-700">Crowd Level</p>
                            <div className="mt-1 w-32 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-red-500 rounded-full h-2"
                                    style={{ width: `${hoveredStore.crowd_level * 100}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {Math.round(hoveredStore.crowd_level * 100)}% full
                            </p>
                        </div>
                    </div>

                    {hoveredStore.priority && (
                        <div className="mt-2 text-xs text-gray-500">
                            Priority: {hoveredStore.priority === 4 ? 'High' : hoveredStore.priority === 3 ? 'Medium-High' : hoveredStore.priority === 2 ? 'Medium' : 'Low'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StoreMap;