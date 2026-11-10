import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router';

const Product = ({ items }) => {

  const { id } = useParams();

  const [product, setProduct] = useState(null)

  useEffect(() => {
    setProduct(items.find((item) => item.id == id))
    console.log(items.find((item) => item.id == id))
  }, [])

  return (
    <>
      {product && <div className='flex flex-1 items-center justify-center'>Item: {product.name}</div>}

    </>
  )
}

export default Product