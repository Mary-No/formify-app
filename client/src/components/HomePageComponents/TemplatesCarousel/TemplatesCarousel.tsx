import Slider from 'react-slick'
import { TemplateCard } from '../TemplateCard/TemplateCard.tsx'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import s from "./TemplatesCarousel.module.scss"
import type { Template } from '../../../types/types.ts';

type Props = {
    templates: Template[] | undefined
}

const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
        {
            breakpoint: 1200,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
            },
        },
        {
            breakpoint: 992,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
            },
        },
        {
            breakpoint: 576,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
            },
        },
    ],
}

export const TemplatesCarousel = ({ templates }: Props) => {
    if (!templates || templates.length === 0) return null
    return (
        <Slider className={s.slider} {...settings} >
                {templates.map(t => (
                    <div className={s.card_wrapper} key={t.id} style={{padding: 8}}>
                        <TemplateCard template={t}/>
                    </div>
                ))}
        </Slider>
)
}
