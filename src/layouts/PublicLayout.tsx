import { Outlet } from 'react-router-dom'
import Header from '../components/PublicHeader'

const PublicLayout = () => {
    return (
        <>
            <Header />
            <Outlet />
        </>
    )
}

export default PublicLayout