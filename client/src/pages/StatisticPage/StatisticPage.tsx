import { useParams, useLocation } from 'react-router-dom';
import { Typography, Table, Spin, Alert, Divider, Card, Row, Col } from 'antd';
import { Pie, Column } from '@ant-design/charts';
import { useGetAggregatedDataQuery } from '../../app/formApi';
import {useEffect} from "react";
import { aggregateInteger } from '../../utils/aggregateInteger.ts';
import { aggregateBoolean } from '../../utils/aggregateBoolean.ts';
import s from './StatisticPage.module.scss'
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

export type BarChartDatum = {
    value: number;
    count: number;
};

export const StatisticPage = () => {
    const { t } = useTranslation();
    const { templateId } = useParams();
    const location = useLocation();
    const { title, description } = location.state || {};
    const { data, isLoading, error, refetch } = useGetAggregatedDataQuery(templateId!);
    useEffect(() => {
        if (location.state?.refetch) {
            refetch();
        }
    }, [location.state, refetch]);

    if (isLoading) return <Spin style={{ display: 'block', marginTop: 64 }} size="large" />;
    if (error || !data) return <Alert message={t('statistics.loadingError')} type="error" showIcon />;


    return (
        <div style={{padding: '24px'}}>
            <Title className={s.title} level={2}>{title}</Title>
            <div className={s.description}
                dangerouslySetInnerHTML={{__html: description}}
            />
            <Divider/>

            {data.questions.map((q) => {

                const dataSource = q.answers.map((a, index) => ({
                    key: index,
                    author: a.author,
                    value:
                        q.type === 'CHECKBOX'
                            ? a.value === true || a.value === 'true'
                                ? t('statistics.yes')
                                : t('statistics.no')
                            : a.value,
                }));

                const columns = [
                    {
                        title: t('statistics.user'),
                        dataIndex: 'author',
                        key: 'author',
                        width: '30%',
                    },
                    {
                        title: t('statistics.answer'),
                        dataIndex: 'value',
                        key: 'value',
                    },
                ];

                return (
                    <Card key={q.id} className={s.card}>
                        <Title level={4}>{q.text}</Title>
                        <Table
                            dataSource={dataSource}
                            columns={columns}
                            pagination={false}
                            scroll={{y: 240}}
                            style={{marginBottom: 24}}
                        />

                        {(q.type === 'INTEGER' || q.type === 'CHECKBOX') && (
                            <Row gutter={16}>
                                {q.type === 'INTEGER' && (
                                    <Col span={24}>
                                        <Column
                                            data={aggregateInteger(q.answers)}
                                            xField="value"
                                            yField="count"
                                            colorField="value"
                                            height={300}
                                            legend={{
                                                position: 'top-left',
                                            }}
                                            tooltip={{
                                                formatter: (datum: BarChartDatum) => ({
                                                    name: t('statistics.answerLabel', {value: datum.value}),
                                                    value: `${datum.count}`,
                                                }),
                                            }}
                                            label={{
                                                position: 'top',
                                                content: (originData: BarChartDatum) => `${originData.count}`,
                                                style: {
                                                    fill: '#595959',
                                                    fontSize: 12,
                                                },
                                            }}
                                            xAxis={{
                                                title: {text: t('statistics.answer')},
                                                type: 'linear',
                                            }}
                                            yAxis={{
                                                title: {text: t('statistics.amount')},
                                                min: 0,
                                                nice: true,
                                            }}
                                            columnWidthRatio={0.4}
                                        />
                                    </Col>
                                )}
                                {q.type === 'CHECKBOX' && (
                                    <Col span={12}>
                                        <Pie
                                            data={aggregateBoolean(q.answers).map(item => ({
                                                ...item,
                                                type: item.value === 'true' ? t('statistics.yes') : t('statistics.no'),
                                                value: item.count,
                                            }))}
                                            angleField="value"
                                            colorField="type"
                                            radius={1}
                                            label={{
                                                type: 'spider',
                                                labelHeight: 28,
                                                content: '{type} ({percentage})',
                                                style: {fontWeight: 'bold'},
                                            }}
                                            legend={{position: 'right'}}
                                            interactions={[{type: 'element-active'}]}
                                            height={300}
                                        />
                                    </Col>
                                )}
                            </Row>
                        )}
                    </Card>
                );
            })}
        </div>
    );
};
