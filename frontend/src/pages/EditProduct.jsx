import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'
import { DEFAULT_USER_ID, getProduct, updateProduct } from '../api'

const EditProduct = ({ refreshProducts }) => {

    const { id } = useParams();

    const navigate = useNavigate('')

    const [itemName, setItemName] = useState('')
    const [itemUrl, setItemUrl] = useState('')
    const [itemPrice, setItemPrice] = useState('')
    const [error, setError] = useState('')

    async function handleForm(e) {
        e.preventDefault()
        try {
            await updateProduct(DEFAULT_USER_ID, id, {
                name: itemName,
                price: Number(itemPrice),
                img_url: itemUrl || null,
            })
            await refreshProducts()
            navigate('/products')
        } catch (requestError) {
            setError(requestError.message)
        }
    }

    useEffect(() => {
        getProduct(DEFAULT_USER_ID, id)
            .then((product) => {
                setItemName(product.name)
                setItemUrl(product.img_url || '')
                setItemPrice(product.price)
            })
            .catch((requestError) => setError(requestError.message))
    }, [id])

    return (
        <div className='flex flex-1 items-center justify-center'>
            <form
                onSubmit={(e) => handleForm(e)}
                className='flex flex-col gap-2 p-2 bg-[#121212] rounded-lg w-3/4 xl:w-3/8 relative'
            >
                <Link to={`/`} className='absolute top-2 left-2'>
                    <FontAwesomeIcon icon={faAngleLeft} />

                </Link>
                <fieldset className='mx-auto'>

                    <legend>Editar Produto</legend>

                </fieldset>
                <hr />



                <div className='flex flex-col gap-1'>

                    <label htmlFor="name">Nome do Produto</label>
                    <input
                        required
                        type="text"
                        name="name"
                        id="name"
                        className='py-1 px-2 text-white bg-white/10'
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                    />
                    <label htmlFor="url">Link</label>
                    <input
                        type="url"
                        name="url"
                        id="url"
                        className='py-1 px-2 text-white bg-white/10'
                        value={itemUrl}
                        onChange={(e) => setItemUrl(e.target.value)}
                    />

                    <label htmlFor="price">Preço</label>
                    <input
                        required
                        type="number"
                        name="price"
                        id="price"
                        className='py-1 px-2 text-white bg-white/10'
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                    />

                    {error && <p className='text-red-400'>{error}</p>}

                    <div className='flex justify-center gap-2'>
                        <input
                            required
                            type="submit"
                            value="Editar"
                            className='bg-white/20 rounded-xl w-fit px-5 py-1 text-white text-lg cursor-pointer'
                        />
                    </div>
                </div>

            </form>
        </div>
    )
}

export default EditProduct