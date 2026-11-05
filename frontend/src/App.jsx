import { Route, Routes } from 'react-router'

// Components
import NavBar from './components/NavBar'

// Pages
import Home from './pages/Home'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Products from './pages/Products'


function App() {

  return (
    <div className='flex h-screen w-screen'>
      <NavBar/>
      <Routes className='flex flex-col'>
        <Route path='/' element={<Home/>}/>
        <Route path='/reports' element={<Reports/>}/>
        <Route path='/settings' element={<Settings/>}/>
        <Route path='/products' element={<Products/>}/>
      </Routes>
    </div>
  )
}

export default App
