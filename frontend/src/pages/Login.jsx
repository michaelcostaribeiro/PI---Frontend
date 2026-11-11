import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'

const Login = () => {

    const [userEmail, setUserEmail] = useState('')
    const [userPassword, setUserPassword] = useState('')

    async function handleForm(e) {
        e.preventDefault()
    }

    return (
        <div className='flex flex-col flex-1 items-center justify-center'>
            <form
                onSubmit={(e) => handleForm(e)}
                className='flex flex-col gap-2 p-2 bg-[#121212] rounded-lg w-3/4 xl:w-3/8 relative'
            >
                <Link to={`/`} className='absolute top-2 left-2'>
                    <FontAwesomeIcon icon={faAngleLeft} />

                </Link>
                <fieldset className='mx-auto'>
                    <legend>Entrar com sua conta</legend>

                </fieldset>
                <hr />
                <div className='flex flex-col gap-1'>

                    <label htmlFor="name">Email:</label>
                    <input
                        required
                        type="text"
                        name="name"
                        id="name"
                        className='py-1 px-2 text-white bg-white/10'
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                    />


                    <label htmlFor="password">Senha:</label>
                    <input
                        required
                        type="password"
                        name="password"
                        id="password"
                        className='py-1 px-2 text-white bg-white/10'
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                    />
                </div>
                <input
                    required
                    type="submit"
                    value="Entrar"
                    className='bg-white/20 rounded-xl w-fit px-5 py-1 mx-auto text-white text-lg cursor-pointer'
                />
                <Link to={'/register'} className='text-[0.75rem] ml-auto '>Não possui uma conta? Clique aqui!</Link>
            </form>
        </div>
    )
}

export default Login