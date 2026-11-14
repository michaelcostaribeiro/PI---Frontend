import React from 'react'
import { Link } from 'react-router'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faPen } from '@fortawesome/free-solid-svg-icons'

function Home({ items, loading, error }) {
  return (
    <div className='flex-1 flex flex-col gap-1 items-center justify-center'>
      <h2>Olá Usuário</h2>
      <Link to={'/add'} className='py-2 px-4 bg-white rounded-xl text-black'>+ Adicionar Produto</Link>
      {loading && <p>Carregando produtos...</p>}
      {error && <p className='text-red-400'>{error}</p>}
      <div className='flex flex-wrap gap-1 *:px-2 *:bg-white/10 *:rounded-lg'>
        {items && items.map((item)=>{

          return <Link key={item.id} to={`/edit/${item.id}`}>({item.id})Editar {item.name}</Link>
        })}
      </div>
      <div className='flex gap-1'>
        <Link to={'/login'} className='py-2 px-4 bg-white rounded-xl text-black'><FontAwesomeIcon icon={faUser} /> Logar</Link>
        <Link to={'/register'} className='py-2 px-4 bg-white rounded-xl text-black'><FontAwesomeIcon icon={faPen} /> Registrar</Link>
      </div>
    </div>
  )
}

export default Home