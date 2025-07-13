import { Button, Modal, message } from 'antd'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { DynamicForm } from "../../../components/DynamicForm.tsx"
import type { Question } from '../../../types/types.ts'
import { useUpgradeSalesforceMutation, type SalesforceUpgradePayload } from '../../../app/salesforceApi.ts'

export default function ConnectSalesforce() {
    const [modalOpen, setModalOpen] = useState(false)
    const [upgradeSalesforce] = useUpgradeSalesforceMutation()
    const location = useLocation()

    const questions: Question[] = [
        { id: 'companyName', templateId: 'staticTemplate', text: 'Company Name', type: 'SHORT_TEXT', order: 1, required: true, updatedAt: new Date().toISOString() },
        { id: 'lastName', templateId: 'staticTemplate', text: 'Last Name', type: 'SHORT_TEXT', order: 2, required: true, updatedAt: new Date().toISOString() },
        { id: 'email', templateId: 'staticTemplate', text: 'Email', type: 'SHORT_TEXT', order: 3, required: true, updatedAt: new Date().toISOString() },
        { id: 'plan', templateId: 'staticTemplate', text: 'Plan', type: 'SINGLE_CHOICE', order: 4, required: true, options: ['BASIC', 'BUSINESS', 'PREMIUM'], updatedAt: new Date().toISOString() },
    ]

    useEffect(() => {
        if (location.search.includes('crm=connected')) {
            setModalOpen(true)
        }
    }, [location.search])

    const handleConnect = () => {
        window.location.href = 'https://formify-app.onrender.com/salesforce/oauth/auth'
    }

    const onFinish = async (values: Record<string, string | number | boolean>) => {
        try {
            await upgradeSalesforce(values as SalesforceUpgradePayload).unwrap()
            message.success(`CRM Connected!`)
            setModalOpen(false)
        } catch (err: any) {
            console.error(err)
            message.error('Failed to create CRM records')
        }
    }

    return (
        <div>
            <Button variant="outlined" color="primary" onClick={handleConnect}>
                Подключить CRM
            </Button>

            <Modal
                open={modalOpen}
                title="Заполните данные для CRM"
                onCancel={() => setModalOpen(false)}
                footer={null}
            >
                <DynamicForm questions={questions} onFinish={onFinish}/>
            </Modal>
        </div>
    )
}
