import '../CSS/Form.css';
import aboutImage from '../Image/aboutimage.jpg';
import Footer from './footer';
import Navigation from "./Navigations/navigation";


const AboutUs = () => {
    return(
        <>
        <Navigation/>


        <div className="about-abc-container">
            <h1 className="about-abc-heading">About Us</h1>
            <div className="about-abc-content-container">
                <div className="about-abc-content">
                    <p>
                    Pahana Edu Bookshop is truly a proper combination of the tradition and the modernity that brings the future to the present.
                    Over the last five decades it has emerged as a prestigious and the foremost network of bookshops in Sri Lanka, with rapid development
                    and expansion of it’s business activities both in terms of quality and quantity.</p>
                    <p>
                    At Pahana Edu Bookshop, our Vision is to Having become the most prominent Institute storing educational books and various books written on various subjects in and out Sri Lanka and to build an intellectual and educated Generation with full of good morals.
                    </p>
                    <p>
                     At Pahana Edu Bookshop, our Vision is to satisfy the customers by providing quality service based on essential values actively supporting the younger generation of the country to improve their knowledge, attitudes and talents. Work out a plan to meet the challenges faced by the industry, collectively and individually while safeguarding the prestigious name established by Pahana Edu Bookshop as the pioneers of this field..
                    </p>
                </div>
                <div className="about-abc-image">
                    <img src={aboutImage} alt="Pahana Edu Bookshop" />
                </div>
            </div>
        </div>

        <div className="card-container">
                <div className="card text-bg-dark">
                    <div className="card-icon">
                        <i className="bi bi-building"></i>
                    </div>
                    <div className="card-text">
                        <p>10+ Branches</p>
                    </div>
                </div>
                <div className="card text-bg-dark">
                    <div className="card-icon">
                        <i className="bi bi-people-fill"></i>
                    </div>
                    <div className="card-text">
                        <p>500+ Employees</p>
                    </div>
                </div>
                <div className="card text-bg-dark">
                    <div className="card-icon">
                        <i className="bi bi-basket-fill"></i>
                    </div>
                    <div className="card-text">
                        <p>Secure Delivery</p>
                    </div>
                </div>
            </div>


            <Footer/>
        </>
    );
}
export default AboutUs;