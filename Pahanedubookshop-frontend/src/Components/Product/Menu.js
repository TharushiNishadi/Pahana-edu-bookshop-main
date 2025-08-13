import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../../CSS/Menu.css';
import Footer from '../footer';
import Navigation from '../Navigations/navigation';

const Menu = () => {
    const [categories, setCategories] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState({});

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = () => {
        axios.get('/category')
            .then(response => {
                const categoriesData = response.data;
                setCategories(categoriesData);
                fetchProductsForCategories(categoriesData);
            })
            .catch(error => console.error('Error fetching categories:', error));
    };

    const fetchProductsForCategories = (categories) => {
        categories.forEach(category => {
            axios.get('/product/byCategory', {
                params: {
                    categoryName: category.categoryName
                }
            })
                .then(response => {
                    console.log(`Products for ${category.categoryName}:`, response.data); // Debugging line
                    setProductsByCategory(prevState => ({
                        ...prevState,
                        [category.categoryName]: response.data
                    }));
                })
                .catch(error => console.error(`Error fetching products for ${category.categoryName}:`, error));
        });
    };

    return (
        <div className='main'>
            <Navigation />
            <div className="menu-container">
                <div className="menu-header">
                    <h1 className="menu-heading">
                        <span className="menu-heading-tasty">Now</span> <span className="menu-heading-dishes">Available</span>
                    </h1>
                </div>
            </div>

            <div className="category-products">
                {categories.length === 0 ? (
                    <p>No categories available.</p>
                ) : (
                    categories.map(category => (
                        <div className="category-section" key={category.categoryId}>
                            <h2 className="category-name">{category.categoryName}</h2>
                            <div className="product-list">
                                {productsByCategory[category.categoryName] && productsByCategory[category.categoryName].length === 0 ? (
                                    <p>No products available for this category.</p>
                                ) : (
                                    productsByCategory[category.categoryName] && productsByCategory[category.categoryName].map(product => (
                                        <div className="product-item" key={product.productId}>
                                            <span className="product-name">{product.productName}</span>
                                            <span className="dotted-line"></span>
                                            <span className="product-price">Rs. {product.productPrice.toFixed(2)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <Footer />
        </div>
    );
}

export default Menu;
