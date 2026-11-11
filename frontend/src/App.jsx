import { Route, Routes } from 'react-router'
import { useState } from 'react'

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


function App() {

  const [items, setItems] = useState([
    {
      id: 1,
      img_url:'',
      name: 'Copo Térmico',
      price: '50,00',
      clicks: 17400,
      sold: 102
    },
    {
      id: 2,
      img_url:'',
      name: 'Relógio',
      price: '50,00',
      clicks: 17400,
      sold: 102
    },
    {
      id: 3,
      img_url:'',
      name: 'Kit',
      price: '50,00',
      clicks: 17400,
      sold: 102
    },
    {
      id: 4,
      img_url:'',
      name: 'Copo Térmico',
      price: '50,00',
      clicks: 17400,
      sold: 102
    },
    {
      id: 5,
      img_url:'',
      name: 'Relógio',
      price: '50,00',
      clicks: 17400,
      sold: 102
    },
    {
      id: 6,
      img_url:'',
      name: 'Kit',
      price: '50,00',
      clicks: 17400,
      sold: 102
    }
  ])


  return (
    <div className='flex h-screen w-screen'>
      <NavBar/>
      <Routes className='flex flex-col'>
        <Route path='/' element={<Home items={items}/>}/>
        <Route path='/reports' element={<Reports/>}/>
        <Route path='/settings' element={<Settings/>}/>
        <Route path='/products' element={<Products items={items} />} />
        <Route path='/add' element={<AddProduct items={items} setItems={setItems} />} />
        <Route path='/product/:id' element={<Product items={items} />}/>
        <Route path='/edit/:id' element={<EditProduct items={items} setItems={setItems} />} />
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        
      </Routes>
    </div>
  )
}

export default App
