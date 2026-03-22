import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';

const ShoppingForm = ({ onOptimize, loading }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [availableStores, setAvailableStores] = useState([]);
    const [recommendations, setRecommendations] = useState(null);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [quickSelect, setQuickSelect] = useState('');

    useEffect(() => {
        // Fetch available stores
        axios.get('http://localhost:5000/api/stores')
            .then(response => {
                const options = response.data.stores.map(store => ({
                    value: store.name,
                    label: `${store.name} (${store.category})`,
                    category: store.category,
                    crowdLevel: store.crowd_level
                }));
                setAvailableStores(options);
            })
            .catch(error => console.error('Error fetching stores:', error));
    }, []);

    const handleQuickSelect = (category) => {
        const categoryStores = availableStores.filter(store =>
            store.category === category &&
            !selectedItems.some(item => item.value === store.value)
        );

        setSelectedItems([...selectedItems, ...categoryStores.slice(0, 3)]);
        setQuickSelect('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedItems.length > 0) {
            const items = selectedItems.map(item => item.value);
            onOptimize(items);
        }
    };

    const handleGetRecommendations = async () => {
        if (selectedItems.length > 0) {
            try {
                const items = selectedItems.map(item => item.value);
                const response = await axios.post('http://localhost:5000/api/recommendations', { items });
                setRecommendations(response.data.recommendations);
                setShowRecommendations(true);
            } catch (error) {
                console.error('Error getting recommendations:', error);
            }
        }
    };

    const customStyles = {
        control: (provided) => ({
            ...provided,
            borderRadius: '0.5rem',
            borderColor: '#e5e7eb',
            '&:hover': {
                borderColor: '#3b82f6'
            }
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#e0e7ff',
            borderRadius: '0.375rem'
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: '#1e40af'
        })
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Shopping List</h2>

            {/* Quick Select Categories */}
            <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">Quick Add by Category:</label>
                <div className="flex gap-2 flex-wrap">
                    {['electronics', 'shoes', 'clothing', 'food'].map(category => (
                        <button
                            key={category}
                            onClick={() => handleQuickSelect(category)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                        >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Select Items to Buy</label>
                    <Select
                        isMulti
                        options={availableStores}
                        value={selectedItems}
                        onChange={setSelectedItems}
                        placeholder="Search for stores or items..."
                        styles={customStyles}
                        className="basic-multi-select"
                        classNamePrefix="select"
                    />
                    {selectedItems.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                        </p>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={loading || selectedItems.length === 0}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-transform"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Optimizing...
                            </span>
                        ) : (
                            '🚀 Optimize Route'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleGetRecommendations}
                        disabled={selectedItems.length === 0}
                        className="px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 transform hover:scale-105 transition-transform"
                    >
                        💡 Get Offers
                    </button>
                </div>
            </form>

            {/* Recommendations Modal */}
            {showRecommendations && recommendations && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-80 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">🎁 Nearby Offers & Recommendations</h3>
                            <button
                                onClick={() => setShowRecommendations(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {recommendations.map((rec, idx) => (
                            <div key={idx} className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                    <span className="text-xl mr-2">📍</span>
                                    {rec.store}
                                </h4>
                                <div className="space-y-2">
                                    {rec.nearby.map((near, nearIdx) => (
                                        <div key={nearIdx} className="flex justify-between items-center text-sm p-2 bg-white rounded">
                                            <span className="text-gray-700">{near.name}</span>
                                            <span className="text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
                                                {near.offer}
                                            </span>
                                            <span className="text-gray-400 text-xs">{near.distance}m away</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShoppingForm;