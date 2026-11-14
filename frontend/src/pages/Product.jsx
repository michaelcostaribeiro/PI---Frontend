import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faArrowTrendDown, faArrowTrendUp, faShareNodes, faStore } from '@fortawesome/free-solid-svg-icons'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { DEFAULT_USER_ID, getProduct } from '../api'

const Product = () => {

  const { id } = useParams();

  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')


  async function handleShareButton(e) {
    e.preventDefault()
  }

  useEffect(() => {
    getProduct(DEFAULT_USER_ID, id)
      .then(setProduct)
      .catch((requestError) => setError(requestError.message))
  }, [id])

  const combinedData = product?.metrics?.map((metric) => ({
    name: metric.date.slice(5),
    cliques: metric.clicks,
    views: metric.views,
    vendas: metric.sold,
  })) || []


  return (
    <>
      {error && <p className='p-4 text-red-400'>{error}</p>}
      {!product && !error && <p className='p-4'>Carregando produto...</p>}
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
              <div className={product.trends.clicks >= 0 ? 'text-green-300 font-bold my-auto' : 'text-red-500 font-bold my-auto'}>
                <p>{product.trends.clicks}%</p>
                <FontAwesomeIcon icon={product.trends.clicks >= 0 ? faArrowTrendUp : faArrowTrendDown} />
              </div>
            </div>

            <div>
              <div className='flex flex-col justify-between font-semibold'>
                <p className='text-white'>{product.sold}</p>
                <p className='text-lg'>Vendas</p>
              </div>
              <div className={product.trends.sold >= 0 ? 'text-green-300 font-bold my-auto' : 'text-red-500 font-bold my-auto'}>
                <p>{product.trends.sold}%</p>
                <FontAwesomeIcon icon={product.trends.sold >= 0 ? faArrowTrendUp : faArrowTrendDown} />
              </div>
            </div>

            <div>
              <div className='flex flex-col justify-between font-semibold'>
                <p className='text-white'>R${Number(product.commission).toFixed(2)}</p>
                <p className='text-lg'>Comissão</p>
              </div>
              <div className={product.trends.commission >= 0 ? 'text-green-300 font-bold my-auto' : 'text-red-500 font-bold my-auto'}>
                <p>{product.trends.commission}%</p>
                <FontAwesomeIcon icon={product.trends.commission >= 0 ? faArrowTrendUp : faArrowTrendDown} />
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