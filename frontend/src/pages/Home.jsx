import React from 'react'
import { Link } from 'react-router'

function Home() {
  return (
    <div className='flex-1 flex flex-col items-center justify-center'>
      <h2>Olá Usuário</h2>
      <Link to={'/add'} className='py-2 px-4 bg-white rounded-xl text-black'>+ Adicionar Produto</Link>
    </div>
  )
}

export default Home