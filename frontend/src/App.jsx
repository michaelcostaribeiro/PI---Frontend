import { Route, Routes } from 'react-router'

// Components
import NavBar from './components/NavBar'

// Pages
import Home from './pages/Home'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Products from './pages/Products'
import {  useState } from 'react'


function App() {

  const [items, setItems] = useState([
    {
      id: 1,
      name: 'Copo Térmico',
      price: '50,00',
      clicks: 17400,
      sold: 102
    },
    {
      id: 2,
      name: 'Relógio',
      price: '50,00',
      clicks: 17400,
      sold: 102
    },
    {
      id: 3,
      name: 'Kit',
      price: '50,00',
      clicks: 17400,
      sold: 102
    },
    {
      id: 4,
      name: 'Copo Térmico',
      price: '50,00',
      clicks: 17400,
      sold: 102
    },
    {
      id: 5,
      name: 'Relógio',
      price: '50,00',
      clicks: 17400,
      sold: 102
    },
    {
      id: 6,
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
        <Route path='/' element={<Home/>}/>
        <Route path='/reports' element={<Reports/>}/>
        <Route path='/settings' element={<Settings/>}/>
        <Route path='/products' element={<Products items={items} />} />
      </Routes>
    </div>
  )
}

export default App
