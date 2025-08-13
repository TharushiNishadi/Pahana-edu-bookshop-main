import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../CSS/Card.css';

const CustomToastContainer = () => {
  return (
    <ToastContainer
      position="top-center"
      autoClose={1500}
      className="custom-toast-container"
    />
  );
};

export default CustomToastContainer;
