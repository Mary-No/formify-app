import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

type Props = {
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
};

export const MarkdownDescription = ({ description, setDescription }: Props) => {
    return <ReactQuill
                theme="snow"
                value={description}
                onChange={setDescription}
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
};
