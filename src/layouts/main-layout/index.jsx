
import Header from '../../components/header/index'
import './style.scss'

import Sidebar from '../../components/sidebar/index'

import { Outlet } from 'react-router-dom'

function MainLayout() {
    return (
        <div className='main-layout'>

            <div className='main-layout__sidebar'>
                <Sidebar />
            </div>
            <div className='main-layout__right'>
                <Header />
                <Outlet />
            </div>

        </div>
    )
}

export default MainLayout
