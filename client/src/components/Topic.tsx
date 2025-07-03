import {getRandomColor} from "../utils/getRandomColor.ts";
import type {Topic} from "../types/types.ts";
import s from "./TemplateSearchCard/TemplateSearchCard.module.scss";
import { Tag } from "antd";
import {useTranslation} from "react-i18next";

type Props = {
    topic: Topic
}
export const TemplateTopic = ({topic}: Props) => {
    const { t } = useTranslation()
    return <div>
        <Tag className={s.topic} color={getRandomColor(topic, 0.6)}>{t(`${topic}`)}</Tag>
    </div>
}