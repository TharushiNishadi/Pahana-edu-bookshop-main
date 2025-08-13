import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Card.css';
import SecFooter from '../footer2';
import Navigation2 from '../Navigations/navigation2';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/category');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSearchChange = (e) => {
        const normalizedSearchTerm = e.target.value.trim().toLowerCase().replace(/\s+/g, ' ');
        setSearchTerm(normalizedSearchTerm);
    };

    const filteredCategories = categories.filter(category =>
        category.categoryName.trim().toLowerCase().includes(searchTerm)
    );

    const handleCategoryClick = (categoryName) => {
        navigate(`/products/${encodeURIComponent(categoryName)}`);
    };

    return (
        <div>
            <Navigation2 />
            <div className="container mt-6">
                <div className="row mb-4">
                    <div className="col-md-12">
                        <input
                            type="text"
                            className="form-control search-input"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
                <div className="row">
                    {filteredCategories.map((category) => (
                        <div className="col-md-4 mb-4" key={category.id}>
                            <div className="card card-transparent position-relative">
                                <img
                                    src={`/images/${category.categoryImage}`}
                                    className="card-img-top"
                                    alt={category.categoryName}
                                    onClick={() => handleCategoryClick(category.categoryName)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <div className="card-img-overlay">
                                    <h5
                                        className="card-title-overlay"
                                        onClick={() => handleCategoryClick(category.categoryName)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {category.categoryName}
                                    </h5>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <SecFooter/>
        </div>
    );
};

export default CustomerDashboard;

