import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'
import { createProduct, DEFAULT_USER_ID } from '../api'

const AddProduct = ({ refreshProducts }) => {
    const navigate = useNavigate('')

    const [itemName, setItemName] = useState('')
    const [itemUrl, setItemUrl] = useState('')
    const [itemPrice, setItemPrice] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleForm(e) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await createProduct({
                name: itemName,
                price: Number(itemPrice),
                img_url: itemUrl || null,
            }, DEFAULT_USER_ID)
            await refreshProducts()
            navigate('/products')
        } catch (requestError) {
            setError(requestError.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='flex flex-1 items-center justify-center'>
            <form
                onSubmit={handleForm}
                className='flex flex-col gap-2 p-2 bg-[#121212] rounded-lg w-3/4 xl:w-3/8 relative'
            >
                <Link to='/' className='absolute top-2 left-2'>
                    <FontAwesomeIcon icon={faAngleLeft} />
                </Link>
                <fieldset className='mx-auto'>
                    <legend>Adicionar Produto</legend>
                </fieldset>
                <hr />

                <div className='flex flex-col gap-1'>
                    <p className='text-center text-zinc-300'>
                        Preencha os dados básicos. A API fake irá gerar fabricante, loja,
                        categoria, comissão e métricas automaticamente.
                    </p>

                    <label htmlFor='name'>Nome do Produto</label>
                    <input
                        required
                        type='text'
                        id='name'
                        maxLength='150'
                        className='py-1 px-2 text-white bg-white/10'
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                    />

                    <label htmlFor='price'>Preço</label>
                    <input
                        required
                        min='0'
                        step='0.01'
                        type='number'
                        id='price'
                        className='py-1 px-2 text-white bg-white/10'
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                    />

                    <label htmlFor='url'>Imagem do Produto (opcional)</label>
                    <input
                        type='url'
                        id='url'
                        placeholder='https://...'
                        className='py-1 px-2 text-white bg-white/10'
                        value={itemUrl}
                        onChange={(e) => setItemUrl(e.target.value)}
                    />

                    {error && <p className='text-red-400'>{error}</p>}

                    <button
                        type='submit'
                        disabled={loading}
                        className='bg-white/20 rounded-xl w-fit px-5 py-1 mx-auto mt-2 text-white text-lg cursor-pointer disabled:opacity-50'
                    >
                        {loading ? 'Criando...' : 'Adicionar produto'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddProduct
