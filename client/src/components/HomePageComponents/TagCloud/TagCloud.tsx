import { TagCloud as TC } from 'react-tagcloud'
import s from './TagCloud.module.scss'

type Props = {
    tags: { value: string; count: number }[]
    onClick: (tag: string) => void
}

export const TagCloud = ({ tags, onClick }: Props) => (
    <TC
        minSize={18}
        maxSize={36}
        tags={tags}
        onClick={tag => onClick(tag.value)}
        className={s.tagcloud}
    />
)
