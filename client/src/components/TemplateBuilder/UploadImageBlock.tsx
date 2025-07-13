import {Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import {useTranslation} from "react-i18next";

type Props = {
    imageUrl?: string;
    onChange: (url: string) => void;
};

export const UploadImageBlock = ({ imageUrl, onChange }: Props) => {
    const { t } = useTranslation();
    return (
        <div style={{ display: 'flex', flexDirection: 'column'}}>
            <Upload
                name="file"
                showUploadList={false}
                customRequest={async ({ file, onSuccess, onError }) => {
                    const formData = new FormData();
                    formData.append('file', file as Blob);
                    formData.append('upload_preset', 'unsigned_images');

                    try {
                        const res = await fetch('https://api.cloudinary.com/v1_1/dosx5bobo/image/upload', {
                            method: 'POST',
                            body: formData,
                        });

                        const data = await res.json();
                        onChange(data.secure_url);
                        onSuccess?.({}, new XMLHttpRequest());
                    } catch (err) {
                        message.error('Upload failed');
                        onError?.(err as Error);
                    }
                }}
            >
                <Button icon={<UploadOutlined />}>
                    {t(imageUrl ? 'changeImage' : 'uploadImage')}
                </Button>
            </Upload>
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt="Uploaded"
                    style={{ width: "30vw", marginTop: 8 }}
                />
            )}
        </div>
    );
};
