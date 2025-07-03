import { Tag as AntTag } from "antd";
import {getRandomColor} from "../utils/getRandomColor.ts";
import type { Tag } from "../types/types.ts";

type Props = {
    tags: Tag[]
}
export const TemplateTag = ({tags}: Props) => {
    return <div>{tags?.map(tag => (
        <AntTag color={getRandomColor(tag.id, 0.3)} style={{color: "black"}} key={tag.name}>{tag.name}</AntTag>
    ))}</div>
}