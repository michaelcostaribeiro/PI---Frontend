import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faBagShopping, faMagnifyingGlassPlus, faGears, faAngleDown, faCalendar, faMagnifyingGlass, faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router'

function Products({items}) {



  return (
    <div className='flex-1 flex flex-col gap-4 p-5'>

      <h2>Meus produtos</h2>
      <div className='flex gap-2 *:py-1.5 *:px-1 *:rounded-2xl *:bg-[#202020] *:border-[#262626] *:border-2'>
        <div className='flex items-center gap-1 flex-1 '>
          <FontAwesomeIcon icon={faMagnifyingGlass} />  <input type="text" name="search" id="search" placeholder='Buscar por nome, loja ou categoria...' className='flex-1' />
        </div>
        <button className='flex gap-1 items-center'> <FontAwesomeIcon icon={faCalendar} />Últimos 7 dias</button>
      </div>
      <div className='flex gap-2 *:flex-1 *:py-1.5 *:px-6 *:rounded-2xl *:bg-[#202020] *:border-[#262626] *:border-2'>
        <button>Mais vendidos</button>
        <button>Melhor comissão</button>
        <button>Mais visualizados</button>
      </div>
      <ul className='flex flex-col flex-wrap gap-2
        *:flex *:h-30 *:rounded-xl *:bg-[#202020] *:p-2.5
        xl:flex-row xl:*:min-w-[32.75%]'>

        {items && items.map((item)=>{
          return <li>
            <div className='bg-white h-full w-25 rounded-xl'>
            </div>

            <div className='flex-1 flex flex-col px-5 text-white'>
              <h3 className='flex-1'>{item.name}</h3>

              <div className='flex gap-10 *:flex *:flex-col'>
                <div>
                  <p>R${item.price}</p>
                  <p>Comissão</p>
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

            <Link to={`/product/${item.id}`} className='flex items-center text-4xl'>
              <FontAwesomeIcon icon={faAngleRight} />
            </Link>
          </li>
        })}
      </ul>
    </div>
  )
}

export default Products