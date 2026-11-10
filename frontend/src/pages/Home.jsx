import React from 'react'
import { Link } from 'react-router'

function Home({items}) {
  return (
    <div className='flex-1 flex flex-col gap-1 items-center justify-center'>
      <h2>Olá Usuário</h2>
      <Link to={'/add'} className='py-2 px-4 bg-white rounded-xl text-black'>+ Adicionar Produto</Link>
      <div className='flex flex-wrap gap-1 *:px-2 *:bg-white/10 *:rounded-lg'>
        {items && items.map((item)=>{

          return <>
            <Link to={`/edit/${item.id}`}>({item.id})Editar {item.name}</Link>
          </>
        })}
      </div>
    </div>
  )
}

export default Home