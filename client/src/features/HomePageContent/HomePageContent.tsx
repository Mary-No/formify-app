import { useNavigate } from "react-router-dom"
import {useGetTagsQuery} from "../../app/api.ts"
import {Layout } from "antd"
import s from './HomePageContent.module.scss'
import { TagCloud } from "../../components/HomePageComponents/TagCloud/TagCloud.tsx"
import {PopularAndLatestTemplates} from "../../components/HomePageComponents/PopularAndLatestTemplates/PopularAndLatestTemplates.tsx";
import { useGetOverviewQuery } from "../../app/templateApi.ts"

export const HomePageContent = () => {
    const navigate = useNavigate()

    const { data: tags } = useGetTagsQuery(16)
    const { data: ov } = useGetOverviewQuery()

    const onTagClick = (tag: string) => navigate(`/search?tags=${encodeURIComponent(tag)}`)

    const {  Content } = Layout
    return  <Content className={s.content}>
        {tags && <TagCloud tags={tags!} onClick={onTagClick} />}
        {ov && <PopularAndLatestTemplates data={ov}/>}
    </Content>
}