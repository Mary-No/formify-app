import { useQueryFilters } from '../../hooks/useQueryFilters'
import { useSearchTemplatesQuery } from '../../app/templateApi'
import { useGetTagsQuery } from '../../app/templateApi.ts'
import {Card, Select, Spin, List, Typography, Row, Col} from 'antd'
import {type Topic} from '../../types/types.ts'
import { useTranslation } from 'react-i18next'
import { TemplateSearchCard } from '../../components/TemplateSearchCard/TemplateSearchCard.tsx'
import s from "./TemplateSearchPage.module.scss"
import {TOPICS} from '../../constants'

const { Title } = Typography
const { Option } = Select

const isTopic = (value: unknown): value is Topic =>
    typeof value === 'string' && TOPICS.includes(value as Topic)

export const TemplateSearchPage = () => {
    const { filters, setFilters } = useQueryFilters<{
        q?: string
        topic?: string
        tags?: string[]
        order?: 'asc' | 'desc'
    }>()

    const search = filters.q ?? ''
    const selectedTopic = isTopic(filters.topic) ? filters.topic : undefined
    const selectedTags = Array.isArray(filters.tags)
        ? filters.tags
        : filters.tags ? [filters.tags] : []
    const sortOrder = filters.order === 'asc' ? 'asc' : 'desc'

    const { data: allTags } = useGetTagsQuery(20)

    const { data, isLoading} = useSearchTemplatesQuery({
        search,
        topic: selectedTopic,
        tags: selectedTags,
        order: sortOrder,
    })

    const { t } = useTranslation()
    return (
        <Row gutter={16} className={s.container}>
            <Col xs={24} sm={10} md={10} lg={6} xl={6}>
                <Card title={t('filters')} className={s.filters}>
                    <div style={{ marginBottom: 16 }}>
                        <label>{t('topic')}:</label>
                        <Select
                            style={{ width: '100%' }}
                            value={selectedTopic}
                            onChange={value => setFilters({ ...filters, topic: value })}
                            allowClear
                        >
                            {TOPICS.map(topic => (
                                <Select.Option key={topic} value={topic}>
                                    {t(`${topic}`)}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label>{t('tags')}:</label>
                        <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            value={selectedTags}
                            onChange={(values) => setFilters({ ...filters, tags: values })}
                            allowClear
                        >
                            {allTags?.map(tag => (
                                <Option key={tag.value} value={tag.value}>{tag.value}</Option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <label>{t('sort')}:</label>
                        <Select<'asc' | 'desc'>
                            style={{ width: '100%' }}
                            value={sortOrder}
                            onChange={(value) => setFilters({ ...filters, order: value })}
                        >
                            <Option value="desc">{t('sortNewest')}</Option>
                            <Option value="asc">{t('sortOldest')}</Option>
                        </Select>
                    </div>
                </Card>
            </Col>

            <Col xs={24} sm={14} md={14} lg={18} xl={18} className={s.resultsContainer}>
                <Title className={s.results} level={4}>{t('results')}</Title>
                {isLoading ? (
                    <Spin />
                ) : (
                    <List
                        dataSource={data?.templates || []}
                        renderItem={item => (
                           <TemplateSearchCard item={item}/>
                        )}
                    />
                )}
            </Col>
        </Row>
    )
}
