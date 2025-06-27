import {Input} from "antd";
import {useState} from "react";
import { useTranslation } from "react-i18next";
import {useNavigate, useSearchParams} from "react-router-dom";
import s from './GlobalSearchInput.module.scss'

export const GlobalSearchInput = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [searchParams] = useSearchParams()

    const clearQueryParam = (param: string) => {
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.delete(param)
        navigate(`/search?${newParams.toString()}`)
    }

    const onSearch = (value?: string) => {
        const q = (value ?? search).trim()
        if (q) {
            navigate(`/search?q=${encodeURIComponent(search)}`);
        } else {
            clearQueryParam('q')
        }
    }
    return(
        <Input.Search
            placeholder={t('searchPlaceholder')}
            onSearch={onSearch}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={s.input}
            allowClear
        />
    )
}