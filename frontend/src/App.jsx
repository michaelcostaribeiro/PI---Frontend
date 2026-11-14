import { Route, Routes } from 'react-router'
import { useCallback, useEffect, useState } from 'react'

// Components
import NavBar from './components/NavBar'

// Pages
import Home from './pages/Home'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Products from './pages/Products'
import Product from './pages/Product'
import AddProduct from './pages/AddProduct'
import EditProduct from './pages/EditProduct'
import Login from './pages/Login'
import Register from './pages/Register'
import { DEFAULT_USER_ID, getProducts } from './api'


function App() {

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProducts = useCallback(() => {
    setLoading(true)
    setError('')
    getProducts(DEFAULT_USER_ID)
      .then(({ produtos }) => setItems(produtos))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])


  return (
    <div className='flex h-screen w-screen'>
      <NavBar />
      <Routes className='flex flex-col'>
        <Route path='/' element={<Home items={items} loading={loading} error={error} />} />
        <Route path='/reports' element={<Reports />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='/products' element={<Products items={items} loading={loading} error={error} />} />
        <Route path='/add' element={<AddProduct />} />
        <Route path='/product/:id' element={<Product />} />
        <Route path='/edit/:id' element={<EditProduct refreshProducts={loadProducts} />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

      </Routes>
    </div>
  )
}

export default App
