import React from 'react'
import { NavLink } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faBagShopping, faMagnifyingGlassPlus, faGears, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { faTiktok } from '@fortawesome/free-brands-svg-icons'

function NavBar() {
    return (
        <div className='flex flex-col py-2 bg-[#121212] text-xl'>
            <div className='px-2'>
                <NavLink className='block py-3 flex gap-2 font-bold'><FontAwesomeIcon icon={faTiktok} color='#fff' className='bg-gray-500 p-1 rounded-sm' /><span><span className='text-[#25F4EE]'>Affiliate</span> <span className='text-[#FE2C55]'>KPI</span></span></NavLink>
                <hr className='' />
            </div>
            <div className='flex flex-1 flex-col py-3 *:text-left *:py-2.5 *:px-4 *:hover:bg-[#303030]'>
                <NavLink to='/'
                    className={({isActive})=>
                        isActive ? 'bg-[#303030] ':'' + ' transition'}
                >
                    <FontAwesomeIcon icon={faHouse} />
                    <span className='text-white pl-1'>Inicio</span>
                </NavLink>
                <NavLink to='/products'
                    className={({ isActive }) =>
                        isActive ? 'bg-[#303030] ' : '' + ' transition'}
                >
                    <FontAwesomeIcon icon={faBagShopping} /> 
                    <span className='text-white pl-1'>Produtos</span></NavLink>
                <NavLink to='/reports'
                    className={({ isActive }) =>
                        isActive ? 'bg-[#303030] ' : '' + ' transition'}
                >
                    <FontAwesomeIcon icon={faMagnifyingGlassPlus} /> 
                    <span className='text-white pl-1'>Relatórios</span></NavLink>
                <NavLink to='/settings'
                    className={({ isActive }) =>
                        isActive ? 'bg-[#303030] ' : '' + ' transition'}
                >
                    <FontAwesomeIcon icon={faGears} /> 
                    <span className='text-white pl-1'>Configurações</span></NavLink>
            </div>
            <div className='flex justify-between items-center px-2'>
                <span className='bg-[#434242] text-white w-10 h-10 flex justify-center items-center rounded-full text-2xl'>U</span>
                <span className='text-white'>Usuário</span>
                <FontAwesomeIcon icon={faAngleDown} />
            </div>
        </div>
    )
}

export default NavBar