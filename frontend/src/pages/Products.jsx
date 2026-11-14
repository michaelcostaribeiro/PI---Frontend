import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faMagnifyingGlass, faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router'

function Products({ items, loading, error }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('sold')
  const visibleItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return items
      .filter((item) => !normalizedSearch || `${item.name} ${item.store}`.toLowerCase().includes(normalizedSearch))
      .sort((first, second) => (second[sort] || 0) - (first[sort] || 0))
  }, [items, search, sort])

  return (
    <div className='flex-1 flex flex-col gap-4 p-5'>

      <h2>Meus produtos</h2>
      <div className='flex gap-2 *:py-1.5 *:px-1 *:rounded-2xl *:bg-[#202020] *:border-[#262626] *:border-2'>
        <div className='flex items-center gap-1 flex-1 '>
          <FontAwesomeIcon icon={faMagnifyingGlass} />  <input type="text" name="search" id="search" placeholder='Buscar por nome, loja ou categoria...' className='flex-1' value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <button className='flex gap-1 items-center'> <FontAwesomeIcon icon={faCalendar} />Últimos 7 dias</button>
      </div>
      <div className='flex gap-2 *:flex-1 *:py-1.5 *:px-6 *:rounded-2xl *:bg-[#202020] *:border-[#262626] *:border-2'>
        <button onClick={() => setSort('sold')}>Mais vendidos</button>
        <button onClick={() => setSort('comissao')}>Melhor comissão</button>
        <button onClick={() => setSort('visualizacoes')}>Mais visualizados</button>
      </div>
      <ul className='flex flex-col flex-wrap gap-2
        *:flex *:h-30 *:rounded-xl *:bg-[#202020] *:p-2.5
        xl:flex-row xl:*:min-w-[32.75%]'>

        {loading && <li>Carregando produtos...</li>}
        {error && <li className='text-red-400'>{error}</li>}
        {!loading && !error && visibleItems.map((item) => {
          return <li key={item.id}>
            <Link to={`/product/${item.id}`} className='flex' >

              <img src={item.img_url} alt='' className='bg-white h-full w-25 rounded-xl object-cover' />
              <div className='flex-1 flex flex-col px-5 text-white'>
                <h3 className='flex-1'>{item.name}</h3>
                <div className='flex gap-10 *:flex *:flex-col'>
                  <div>
                    <p>R${Number(item.price).toFixed(2)}</p>
                    <p>Preço</p>
                  </div>
                  <div>
                    <p>{item.clicks}</p>
                    <p>Cliques</p>
                  </div>
                  <div>
                    <p>{item.sold}</p>
                    <p>Vendas</p>
                  </div>
                </div>
              </div>
              <div className='flex items-center text-4xl'>
                <FontAwesomeIcon icon={faAngleRight} />
              </div>
            </Link>
          </li>
        })}
      </ul>
    </div>
  )
}

export default Products