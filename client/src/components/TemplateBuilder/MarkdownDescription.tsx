import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useTranslation } from "react-i18next";

type Props = {
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
};

export const MarkdownDescription = ({ description, setDescription }: Props) => {
    const { t, i18n } = useTranslation();

    return (
        <ReactQuill
            key={i18n.language}
            theme="snow"
            value={description}
            onChange={setDescription}
            placeholder={t('descriptionPlaceholder')}
            modules={{
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['clean']
                ],
            }}
            formats={[
                'bold', 'italic', 'underline', 'strike',
                'list', 'bullet',
            ]}
        />
    );
};
