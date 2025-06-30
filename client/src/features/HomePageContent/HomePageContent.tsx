import { useNavigate } from "react-router-dom"
import {useGetTagsQuery} from "../../app/templateApi.ts"
import {Layout } from "antd"
import s from './HomePageContent.module.scss'
import { TagCloud } from "../../components/HomePageComponents/TagCloud/TagCloud.tsx"
import {PopularAndLatestTemplates} from "../../components/HomePageComponents/PopularAndLatestTemplates/PopularAndLatestTemplates.tsx";
import { useGetOverviewQuery } from "../../app/templateApi.ts"
import {useAppSelector} from "../../app/hooks.ts";
import {useEffect} from "react";

export const HomePageContent = () => {
    const navigate = useNavigate()

    const { data: tags, isLoading: tagsLoading} = useGetTagsQuery(16)
    const { data: ov, isLoading: ovLoading, refetch } = useGetOverviewQuery()

    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            refetch();
        }
    }, [isAuthenticated, refetch]);

    const onTagClick = (tag: string) => navigate(`/search?tags=${encodeURIComponent(tag)}`)

    const {  Content } = Layout
    return  <Content className={s.content}>
        {!tagsLoading && tags && <TagCloud tags={tags} onClick={onTagClick} />}
        {!ovLoading && ov && <PopularAndLatestTemplates data={ov} />}
    </Content>
}