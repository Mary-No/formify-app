import { useNavigate } from "react-router-dom"
import {useGetTagsQuery} from "../../app/templateApi.ts"
import {Grid, Layout} from "antd"
import s from './HomePageContent.module.scss'
import { TagCloud } from "../../components/HomePageComponents/TagCloud/TagCloud.tsx"
import {PopularAndLatestTemplates} from "../../components/HomePageComponents/PopularAndLatestTemplates/PopularAndLatestTemplates.tsx";
import { useGetOverviewQuery } from "../../app/templateApi.ts"


export const HomePageContent = () => {
    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();
    const navigate = useNavigate()
    const tagsLimit = screens.lg ? 16 : 6;


    const { data: tags, isLoading: tagsLoading} = useGetTagsQuery(tagsLimit, {
        skip: screens.lg === undefined,
    })
    const { data: ov, isLoading: ovLoading } = useGetOverviewQuery();

    const onTagClick = (tag: string) => navigate(`/search?tags=${encodeURIComponent(tag)}`)

    const {  Content } = Layout

    return  <Content className={s.content}>
        {!tagsLoading && tags && <TagCloud tags={tags} onClick={onTagClick} />}
        {!ovLoading && ov && <PopularAndLatestTemplates data={ov} />}
    </Content>
}