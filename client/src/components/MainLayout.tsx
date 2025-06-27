import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import { Header } from '../features/Header/Header'


const { Content } = Layout

export const MainLayout = () => {
    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: 'inherit' }}>
            <Header />
            <Content style={{ padding: '0 24px' }}>
                <Outlet />
            </Content>
        </Layout>
    )
}
