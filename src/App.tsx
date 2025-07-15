import Categories from './components/Categories';
import ProductPage from './components/ProductPage';
import './App.css';
import Header from './components/Header';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import { useEffect, useState } from 'react';
import CategoryContext from './context/CategoryContext';
import CartContext from './context/CartContext';
import ErrorContext from './context/ErrorContext';
import Alert from './components/Alert';
import { CartItemType } from './lib/types';
import PageOverlay from './components/PageOverlay';

function App() {
  const [currentCategory, setCurrentCategory] = useState<string>('All');
  const [cartItemsState, setCartItemsState] = useState<CartItemType[]>([]);
  const [msg, setMsg] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    const items = localStorage.getItem('items');
    if (items) {
      setCartItemsState(JSON.parse(items));
    }
  }, []);

  return (
    <div className="App">
      <Router>
        <CategoryContext.Provider value={{ currentCategory, setCurrentCategory }}>
          <CartContext.Provider value={{ cartItemsState, setCartItemsState, totalPrice, setTotalPrice }}>
            <ErrorContext.Provider value={{ isError, setIsError, msg, setMsg }}>
              <Header showCart={showCart} setShowCart={setShowCart} />
              {showCart ? <PageOverlay></PageOverlay> : ''}

              <Routes>
                <Route path='/' element={<Categories />} />
                <Route path='/:id' element={<Categories />} />
                <Route path='/products/:id' element={<ProductPage setShowCart={setShowCart} />} />
              </Routes>
              <Alert />
            </ErrorContext.Provider>
          </CartContext.Provider>
        </CategoryContext.Provider>
      </Router>
    </div>
  );
}

export default App;