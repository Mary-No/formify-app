import { Button, Input, Space, message, Tooltip } from 'antd';
import { CopyOutlined, ReloadOutlined, KeyOutlined } from '@ant-design/icons';
import {useGenerateApiTokenMutation} from "../../app/odooApi";


export const GenerateApiKey = () => {
    const [generateApiToken, { data, isLoading }] = useGenerateApiTokenMutation();

    const handleGenerate = async () => {
        try {
            await generateApiToken().unwrap();
            message.success('API key сгенерирован!');
        } catch (err) {
            console.error(err);
            message.error('Ошибка при генерации API key');
        }
    };

    const handleCopy = () => {
        if (data?.apiToken) {
            void navigator.clipboard.writeText(data.apiToken);
            void message.success('Скопировано в буфер обмена');
        }
    };

    return (
        <div style={{ maxWidth: 227}}>
            {!data?.apiToken ? (
                <Button
                    type="primary"
                    onClick={handleGenerate}
                    loading={isLoading}
                    icon={<KeyOutlined />}
                    block
                    style={{height:"40px"}}
                >
                    Сгенерировать API key
                </Button>
            ) : (
                <Space.Compact >
                    <Input
                        readOnly
                        value={data.apiToken}
                        style={{height:"40px"}}
                    />
                    <Tooltip title="Скопировать">
                        <Button icon={<CopyOutlined />} style={{height:"40px"}} onClick={handleCopy} />
                    </Tooltip>
                    <Tooltip title="Перегенерировать">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleGenerate}
                            loading={isLoading}
                            style={{height:"40px"}}
                        />
                    </Tooltip>
                </Space.Compact>
            )}
        </div>
    );
};


