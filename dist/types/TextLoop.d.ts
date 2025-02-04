import React, { ReactNode } from "react";
import { OpaqueConfig, TransitionStyle } from "react-motion";
import { RequestTimeout } from "./utils";
declare type Props = {
    children?: ReactNode[] | undefined;
    interval: number | number[];
    delay: number;
    adjustingSpeed: number;
    springConfig: {
        stiffness: number;
        damping: number;
    };
    fade: boolean;
    mask: boolean;
    noWrap: boolean;
    className?: string;
    onChange?: Function;
};
declare type State = {
    elements: ReactNode[];
    currentEl: ReactNode;
    currentWordIndex: number;
    wordCount: number;
    currentInterval: number;
};
declare class TextLoop extends React.Component<Props, State> {
    isUnMounting: boolean;
    tickDelay: RequestTimeout;
    tickLoop: RequestTimeout;
    wordBox: HTMLDivElement | null;
    static defaultProps: Props;
    constructor(props: Props);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props, prevState: State): void;
    componentWillUnmount(): void;
    clearTimeouts(): void;
    willLeave: () => {
        opacity: OpaqueConfig;
        translate: OpaqueConfig;
    };
    willEnter: () => {
        opacity: 0 | 1;
        translate: number;
    };
    tick: () => void;
    getOpacity(): 0 | 1;
    getDimensions(): DOMRect | {
        width: 0;
        height: 0;
    };
    wrapperStyles: any;
    elementStyles: any;
    getTransitionMotionStyles(): TransitionStyle[];
    render(): JSX.Element;
}
export default TextLoop;
