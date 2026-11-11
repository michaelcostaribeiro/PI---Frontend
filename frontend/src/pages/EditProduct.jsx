import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'

const EditProduct = ({ items, setItems }) => {

    const { id } = useParams();

    const navigate = useNavigate('')

    const [categorias, setCategorias] = useState(['Categoria 1', 'Categoria 2', 'Categoria 3'])

    const [currentItem, setCurrentItem] = useState(null)

    const [itemName, setItemName] = useState('')
    const [selectedCategories, setSelectedCategories] = useState([])
    const [itemUrl, setItemUrl] = useState('')
    const [itemComission, setItemComission] = useState('')
    const [itemStore, setItemStore] = useState('')

    async function handleCheckboxChange(e, currentState, setState) {
        const value = e.target.value;
        const isChecked = e.target.checked;

        if (isChecked) {
            setSelectedCategories([...currentState, value])
        } else {
            setState(currentState.filter((categoria) => categoria !== value))
        }
    }

    async function handleForm(e) {
        e.preventDefault()

        const filteredItem = items.filter((item) => item.id != id)

        setItems([...filteredItem, {
            id: currentItem.id,
            img_url: '',
            name: itemName,
            price: 12,
            clicks: 15,
            sold: 1
        }])

        navigate('/products')

    }

    async function handleDelete(e){
        e.preventDefault()

        const filteredList = items.filter((item) => item.id != id)
        setItems(filteredList)

        navigate('/products')
    }

    useEffect(() => {
        if (items && items.length > 0) {
            const found = items.find((item) => item.id == id);
            if (found) {
                setCurrentItem(found)
                setItemName(found.name)
            }
        }
    }, [])

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
                    <div>
                        {categorias && categorias.map((categoria) => {
                            return <div>
                                <input
                                    type="checkbox"
                                    name="categories"
                                    id={categoria}
                                    value={categoria}
                                    onChange={(e) => handleCheckboxChange(e, selectedCategories, setSelectedCategories)}
                                    checked={selectedCategories.includes(categoria)} />
                                <label htmlFor={categoria}> {categoria}</label>
                            </div>
                        })}
                    </div>

                    <label htmlFor="url">Link</label>
                    <input
                        required
                        type="url"
                        name="url"
                        id="url"
                        className='py-1 px-2 text-white bg-white/10'
                        value={itemUrl}
                        onChange={(e) => setItemUrl(e.target.value)}
                    />

                    <label htmlFor="comission">Comissão</label>
                    <input
                        required
                        type="number"
                        name="comission"
                        id="comission"
                        className='py-1 px-2 text-white bg-white/10'
                        value={itemComission}
                        onChange={(e) => setItemComission(e.target.value)}
                    />

                    <label htmlFor="store">Loja</label>
                    <input
                        required
                        type="text"
                        name="store"
                        id="store"
                        className='py-1 px-2 text-white bg-white/10'
                        value={itemStore}
                        onChange={(e) => setItemStore(e.target.value)}
                    />

                    <div className='flex justify-center gap-2'>
                        <input
                            required
                            type="submit"
                            value="Editar"
                            className='bg-white/20 rounded-xl w-fit px-5 py-1 text-white text-lg cursor-pointer'
                        />
                        <button
                            onClick={(e)=>handleDelete(e)}
                            className='bg-red-800 rounded-xl w-fit px-5 py-1 text-white text-lg cursor-pointer'
                        >Deletar</button>
                    </div>
                </div>

            </form>
        </div>
    )
}

export default EditProduct