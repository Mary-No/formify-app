import {Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

type Props = {
    imageUrl?: string;
    onChange: (url: string) => void;
};

export const UploadImageBlock = ({ imageUrl, onChange }: Props) => {
    return (
        <div>
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
                    {imageUrl ? 'Change image' : 'Upload image'}
                </Button>
            </Upload>
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt="Uploaded"
                    style={{ maxWidth: '100%', marginTop: 8 }}
                />
            )}
        </div>
    );
};
