import type {OverviewResponse} from "../../../types/types.ts";
import { TemplatesCarousel } from "../TemplatesCarousel/TemplatesCarousel.tsx";
import {useTranslation} from "react-i18next";
import s from './PopularAndLatestTemplates.module.scss'

type Props = {
    data: OverviewResponse | undefined;
}

export const PopularAndLatestTemplates = ({data}:Props)=>{
    const { t } = useTranslation()
    return(
        <div>
            <div>
                <h2 className={s.titles}>{t('popularTemplates')}</h2>
                <TemplatesCarousel templates={data?.popular}  key={`popular-${data?.popular?.[0]?.likesCount}`}/>
            </div>
            <div className={s.latestTemplates}>
                <h2 className={s.titles}>{t('latestTemplates')}</h2>
                <TemplatesCarousel templates={data?.latest}  key={`latest-${data?.latest?.[0]?.likesCount}`}/>
            </div>
        </div>
    )
}