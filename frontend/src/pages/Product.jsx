import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faArrowTrendDown, faArrowTrendUp, faShareNodes, faStore } from '@fortawesome/free-solid-svg-icons'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const Product = ({ items }) => {

  const { id } = useParams();

  const [product, setProduct] = useState(null)


  async function handleShareButton(e) {
    e.preventDefault()
  }

  useEffect(() => {
    setProduct(items.find((item) => item.id == id))
  }, [])

  const combinedData = product ? [
    { name: 'Seg', cliques: Math.round(product.clicks * 0.4), views: Math.round(123 * 25) , vendas: Math.round(product.sold * 25.4) },
    { name: 'Ter', cliques: Math.round(product.clicks * 0.6), views: Math.round(123 * 25.5) , vendas: Math.round(product.sold * 2.6) },
    { name: 'Qua', cliques: Math.round(product.clicks * 0.5), views: Math.round(123 * 28) , vendas: Math.round(product.sold * 3.5) },
    { name: 'Qui', cliques: Math.round(product.clicks * 0.8), views: Math.round(123 * 80) , vendas: Math.round(product.sold * 6.8) },
    { name: 'Sex', cliques: Math.round(product.clicks * 0.7), views: Math.round(123 * 25) , vendas: Math.round(product.sold * 5.7) },
    { name: 'Sáb', cliques: Math.round(product.clicks * 0.9), views: Math.round(123 * 100) , vendas: Math.round(product.sold * 10.9) },
    { name: 'Dom', cliques: Number(product.clicks), views: Math.round(123 * 250), vendas: Number(product.sold) },
  ] : [];


  return (
    <>
      {product && <div className='flex flex-col gap-2 flex-1 p-4'>
        <div className='flex items-center'>
          <Link to={'/'}>
            <FontAwesomeIcon icon={faAngleLeft} className='text-4xl' />
          </Link>
          <h2 className='m-0'>Detalhes do Produto</h2>
        </div>


        <div className='flex flex-col gap-5 xl:w-200'>
          <div className='flex gap-2'>
            <img src={product.img_url} alt={`${product.name} image`} className='h-35 w-35 rounded-xl bg-white' />
            <div className='flex-1'>
              <h3 className='text-2xl text-white p-1'>{product.name}</h3>
              <div className='flex items-center text-xl'>
                <FontAwesomeIcon icon={faStore} className='text-3xl' />
                <p>{product.store}</p>
              </div>
            </div>
            <button className='cursor-pointer text-3xl my-auto' onClick={(e) => handleShareButton(e)}>
              <FontAwesomeIcon icon={faShareNodes} />
            </button>
          </div>


          <div className='flex gap-8 text-xl 
          *:flex-1 *:rounded-xl *:bg-[#353535] *:h-25 *:py-5 *:px-3 *:flex *:justify-between '>
            <div>
              <div className='flex flex-col justify-between font-semibold'>
                <p className='text-white'>{product.clicks}</p>
                <p className='text-lg'>Cliques</p>
              </div>
              <div className='text-green-300 font-bold my-auto'>
                <p>27%</p>
                <FontAwesomeIcon icon={faArrowTrendUp} />
              </div>
            </div>

            <div>
              <div className='flex flex-col justify-between font-semibold'>
                <p className='text-white'>{product.sold}</p>
                <p className='text-lg'>Vendas</p>
              </div>
              <div className='text-green-300 font-bold my-auto'>
                <p>10%</p>
                <FontAwesomeIcon icon={faArrowTrendUp} />
              </div>
            </div>

            <div>
              <div className='flex flex-col justify-between font-semibold'>
                <p className='text-white'>R${product.price}</p>
                <p className='text-lg'>Comissão</p>
              </div>
              <div className='text-red-500 font-bold my-auto'>
                <p>17%</p>
                <FontAwesomeIcon icon={faArrowTrendDown} />
              </div>
            </div>

          </div>


          {/* Graph Container */}
          <div className='h-70 border border-zinc-700 bg-[#060606] rounded-xl p-4 flex flex-col justify-between'>
            <div className='w-full h-full'>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '0.5rem', color: '#fff' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="cliques" name="Cliques" stroke="#4ade80" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                  <Area type="monotone" dataKey="vendas" name="Vendas" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="views" name="Views" stroke="#fff" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>


      </div>}

    </>
  )
}

export default Product