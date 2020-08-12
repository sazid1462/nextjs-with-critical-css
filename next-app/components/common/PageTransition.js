import { PageTransition as NextPageTransition } from 'next-page-transitions';
import { useRouter } from 'next/router';
import React from 'react';
import TransitionLoader from './TransitionLoader';

const TIMEOUT = 400;

const PageTransition = ({children}) => {
  const router = useRouter();
  return (
    <NextPageTransition
      timeout={TIMEOUT}
      classNames="page-transition"
      loadingComponent={<TransitionLoader/>}
      loadingDelay={500}
      loadingTimeout={{
        enter: TIMEOUT,
        exit: 0
      }}
      skipInitialTransition={true}
      loadingClassNames="loading-indicator"
    >
      <React.Fragment key={router.pathname}>
        {children}
        <style jsx global>
          {`
        .page-transition-enter {
          opacity: 0;
          transform: translate3d(0, 20px, 0);
        }
        .page-transition-enter-active {
          opacity: 1;
          transform: translate3d(0, 0, 0);
          transition: opacity ${TIMEOUT}ms, transform ${TIMEOUT}ms;
        }
        .page-transition-exit {
          opacity: 1;
        }
        .page-transition-exit-active {
          opacity: 0;
          transition: opacity ${TIMEOUT}ms;
        }
        .loading-indicator-appear,
        .loading-indicator-enter {
          opacity: 0;
        }
        .loading-indicator-appear-active,
        .loading-indicator-enter-active {
          opacity: 1;
          transition: opacity ${TIMEOUT}ms;
        }
        `}
        </style>
      </React.Fragment>
    </NextPageTransition>
  )
}

export default PageTransition
