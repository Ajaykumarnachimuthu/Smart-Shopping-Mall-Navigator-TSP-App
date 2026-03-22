import React, { useEffect, useRef } from 'react';

const RouteVisualization = ({ coordinates }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!coordinates || coordinates.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions
        canvas.width = 800;
        canvas.height = 500;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Find bounds for scaling
        const xs = coordinates.map(coord => coord[0]);
        const ys = coordinates.map(coord => coord[1]);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        // Add padding
        const padding = 50;
        const scaleX = (canvas.width - 2 * padding) / (maxX - minX || 1);
        const scaleY = (canvas.height - 2 * padding) / (maxY - minY || 1);

        // Transform function
        const transform = (x, y) => ({
            x: padding + (x - minX) * scaleX,
            y: canvas.height - padding - (y - minY) * scaleY
        });

        // Draw grid
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const x = padding + (i / 5) * (canvas.width - 2 * padding);
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, canvas.height - padding);
            ctx.stroke();

            const y = padding + (i / 5) * (canvas.height - 2 * padding);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
        }

        // Draw routes
        ctx.beginPath();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);

        for (let i = 0; i < coordinates.length - 1; i++) {
            const from = transform(coordinates[i][0], coordinates[i][1]);
            const to = transform(coordinates[i + 1][0], coordinates[i + 1][1]);

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();

            // Draw arrow
            const angle = Math.atan2(to.y - from.y, to.x - from.x);
            const arrowSize = 8;
            const arrowX = to.x - arrowSize * Math.cos(angle);
            const arrowY = to.y - arrowSize * Math.sin(angle);

            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(arrowX - arrowSize * Math.sin(angle), arrowY + arrowSize * Math.cos(angle));
            ctx.lineTo(arrowX + arrowSize * Math.sin(angle), arrowY - arrowSize * Math.cos(angle));
            ctx.fillStyle = '#3b82f6';
            ctx.fill();
        }

        // Draw return route
        if (coordinates.length > 0) {
            const last = transform(coordinates[coordinates.length - 1][0], coordinates[coordinates.length - 1][1]);
            const first = transform(coordinates[0][0], coordinates[0][1]);

            ctx.beginPath();
            ctx.moveTo(last.x, last.y);
            ctx.lineTo(first.x, first.y);
            ctx.stroke();
        }

        // Draw points
        coordinates.forEach((coord, index) => {
            const point = transform(coord[0], coord[1]);

            // Draw circle
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = index === 0 ? '#10b981' : '#ef4444';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw number
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(index + 1, point.x, point.y);

            // Draw label
            ctx.fillStyle = '#374151';
            ctx.font = '12px Arial';
            ctx.fillText(`Store ${index + 1}`, point.x, point.y - 12);
        });

        // Draw entrance
        const entrance = transform(coordinates[0][0], coordinates[0][1]);
        ctx.beginPath();
        ctx.arc(entrance.x, entrance.y, 12, 0, 2 * Math.PI);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('START', entrance.x, entrance.y);

    }, [coordinates]);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Route Visualization</h2>
            <div className="overflow-x-auto">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={500}
                    className="w-full h-auto border border-gray-200 rounded-lg"
                />
            </div>
            <div className="mt-4 flex justify-center gap-6 text-sm">
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                    <span>Start Point (Entrance)</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                    <span>Store Locations</span>
                </div>
                <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-blue-500 mr-2"></div>
                    <span>Optimal Route</span>
                </div>
            </div>
        </div>
    );
};

export default RouteVisualization;