import { motion, useAnimation } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

const AnimatedComponent = ({
  children,
  animationType = 'fadeIn',
  delay = 0,
  duration = 0.5,
  ...props
}) => {
  const controls = useAnimation();
  const ref = useRef(null);

  useEffect(() => {
    controls.start({
      ...getAnimationVariants(animationType).visible,
      transition: { duration, delay }
    });
  }, [controls, animationType, delay, duration]);

  const getAnimationVariants = type => {
    switch (type) {
      case 'fadeIn':
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        };
      case 'slideInUp':
        return {
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 }
        };
      case 'slideInLeft':
        return {
          hidden: { x: -20, opacity: 0 },
          visible: { x: 0, opacity: 1 }
        };
      case 'slideInRight':
        return {
          hidden: { x: 20, opacity: 0 },
          visible: { x: 0, opacity: 1 }
        };
      case 'scaleIn':
        return {
          hidden: { scale: 0.9, opacity: 0 },
          visible: { scale: 1, opacity: 1 }
        };
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        };
    }
  };

  return (
    <motion.div
      ref={ref}
      initial='hidden'
      animate={controls}
      variants={getAnimationVariants(animationType)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedComponent;
