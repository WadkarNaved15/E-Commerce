// src/components/Home/CarouselSlideshow.jsx

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import '../../styles/Home/Carousel.css'; // Import your custom CSS file

const CarouselSlideshow = () => {
    return (
        <div className="carousel-container">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={100}
                slidesPerView={1}
                pagination={{ clickable: true }}
                navigation={true}
                autoplay={{ delay: 5000 }}
                loop={true}
            >
                <SwiperSlide>
                    <div className="slide">
                        <img src="/assets/images/StartingatJust11-1720378030046.jpeg" alt="Slide 1"/>
                        <p className="legend">Caption for Slide 1</p>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className="slide">
                        <img src="/assets/images/81eNG85RRhL._SX679_.jpg" alt="Slide 2" />
                        <p className="legend">Caption for Slide 2</p>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className="slide">
                        <img src="/assets/images/61p8tZuW3UL._SX679_.jpg" alt="Slide 3" />
                        <p className="legend">Caption for Slide 3</p>
                    </div>
                </SwiperSlide>
                {/* Add more slides as needed */}
            </Swiper>
        </div>
    );
};

export default CarouselSlideshow;
