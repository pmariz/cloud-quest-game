import { ReactElement, useContext, useEffect, useState } from 'react';
import { ILevel } from '../../Pages/Levels';
import { fetchWrapper } from '../../utils/api';
import { LaunchContext } from '../../utils/types';
import { Button } from '../styles-button';

import { CarouselSlide, CarouselSlides, CarouselWrapper, MainContainer } from './styles-swipper';
import { CarouselContext, DefaultResult, IResult } from './types-context';

interface CarouselProps {
  children: ReactElement[];
  setIsOpen: (e: boolean) => void;
  level: ILevel | undefined;
}

const Carousel = ({ children, setIsOpen, level }: CarouselProps) => {
  const { setDisplayModalClose } = useContext(LaunchContext);
  const [correctAnswer, setCorrectAnswer] = useState(false);
  const [currentslide, setCurrentslide] = useState(0);
  const [finalResult, setFinalResult] = useState(0);
  const [result, setResult] = useState<IResult>(DefaultResult);

  useEffect(() => {
    setFinalResult(Math.round(((result.right / (result.right + result.wrong)) * 100)));
  }, [result]);

  const saveResult = async () => {
    try {
      console.log(level?.id, finalResult);
      const data = await fetchWrapper("/user/result", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          level: level?.id,
          result: finalResult
        })
      });
      console.log(data);
    } catch (err) {
      console.log("Error: ", err);
    }
  }

  const onButtonSwipperClick = () => {
    if (currentslide === activeSlide.length - 1) {
      setIsOpen(false);
      saveResult();
      setDisplayModalClose(true);
      setResult(DefaultResult);
    }
    if (currentslide === 0) { setDisplayModalClose(false) }
    if (currentslide % 2 !== 0 && currentslide !== 0) {
      correctAnswer ? setResult({ ...result, right: result.right + 1 }) : setResult({ ...result, wrong: result.wrong + 1 });
    }
    setCurrentslide((currentslide + 1) % activeSlide.length);
  }

  const activeSlide = children.map((slide: ReactElement, index: number) => (
    <CarouselSlide key={index} active={currentslide === index}>
      {slide}
    </CarouselSlide>
  ));

  return (
    <CarouselContext.Provider value={{ correctAnswer, setCorrectAnswer, currentslide, result, setResult, activeSlide }}>
      <MainContainer>
        <CarouselWrapper>
          <CarouselSlides currentSlide={currentslide}>
            {activeSlide}
          </CarouselSlides>
        </CarouselWrapper>
        <div style={{ position: "absolute", bottom: 30 }}>
          <Button
            variant="primary"
            size="200px"
            onClick={onButtonSwipperClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {(currentslide === 0 ? "Iniciar" : currentslide === activeSlide.length - 1 ? "Terminar" : "Seguinte")}
          </Button>
        </div>
      </MainContainer>
    </CarouselContext.Provider>
  );
}

export default Carousel;