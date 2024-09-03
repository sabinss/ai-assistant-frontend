import React, { useState, useEffect } from 'react';

interface TypingAnimationProps {
    text?: string;
    interval?: number;
}

/**
 * TypingAnimation component props.
 */
const LoadingAnimation: React.FC<TypingAnimationProps> = ({
    text = 'typing',
    interval = 500,
}) => {
    const [dotCount, setDotCount] = useState(1);
    const [animationText, setAnimationText] = useState(`${text}.`);

    useEffect(() => {
        const timer = setInterval(() => {
            setDotCount((prevDotCount) => {
                if (prevDotCount === 3) {
                    setAnimationText(`${text}.`);
                    return 1;
                } else {
                    setAnimationText(`${animationText} .`);
                    return prevDotCount + 1;
                }
            });
        }, interval);

        return () => clearInterval(timer);
    }, [text, interval]);

    return <span className="animate-pulse">{animationText}</span>;
};

export default LoadingAnimation;