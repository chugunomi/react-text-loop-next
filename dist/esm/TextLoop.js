import React from "react";
import { TransitionMotion, spring, } from "react-motion";
import cxs from "cxs";
import { isEqual } from "./isEqual";
import { requestTimeout, clearRequestTimeout } from "./utils";
class TextLoop extends React.Component {
    constructor(props) {
        super(props);
        this.isUnMounting = false;
        this.tickDelay = 0;
        this.tickLoop = 0;
        this.wordBox = null;
        this.willLeave = () => {
            const { height } = this.getDimensions();
            return {
                opacity: spring(this.getOpacity(), this.props.springConfig),
                translate: spring(-height, this.props.springConfig),
            };
        };
        this.willEnter = () => {
            const { height } = this.getDimensions();
            return {
                opacity: this.getOpacity(),
                translate: height,
            };
        };
        this.tick = () => {
            if (!this.isUnMounting) {
                this.setState((state, props) => {
                    const currentWordIndex = (state.currentWordIndex + 1) % state.elements.length;
                    const currentEl = state.elements[currentWordIndex];
                    const updatedState = {
                        currentWordIndex,
                        currentEl,
                        wordCount: (state.wordCount + 1) % 1000,
                        currentInterval: Array.isArray(props.interval)
                            ? props.interval[currentWordIndex % props.interval.length]
                            : props.interval,
                    };
                    if (props.onChange) {
                        props.onChange(updatedState);
                    }
                    return updatedState;
                }, () => {
                    if (this.state.currentInterval > 0) {
                        this.clearTimeouts();
                        this.tickLoop = requestTimeout(this.tick, this.state.currentInterval);
                    }
                });
            }
        };
        this.wrapperStyles = cxs(Object.assign(Object.assign({}, (this.props.mask && { overflow: "hidden" })), {
            display: "inline-block",
            position: "relative",
            verticalAlign: "top",
        }));
        this.elementStyles = cxs({
            display: "inline-block",
            left: 0,
            top: 0,
            whiteSpace: this.props.noWrap ? "nowrap" : "normal",
        });
        const elements = React.Children.toArray(props.children);
        this.state = {
            elements,
            currentEl: elements[0],
            currentWordIndex: 0,
            wordCount: 0,
            currentInterval: Array.isArray(props.interval)
                ? props.interval[0]
                : props.interval,
        };
    }
    componentDidMount() {
        const { delay } = this.props;
        const { currentInterval, elements } = this.state;
        if (currentInterval > 0 && elements.length > 1) {
            this.tickDelay = requestTimeout(() => {
                this.tickLoop = requestTimeout(this.tick, currentInterval);
            }, delay);
        }
    }
    componentDidUpdate(prevProps, prevState) {
        const { interval, children, delay } = this.props;
        const { currentWordIndex } = this.state;
        const currentInterval = Array.isArray(interval)
            ? interval[currentWordIndex % interval.length]
            : interval;
        if (prevState.currentInterval !== currentInterval) {
            this.clearTimeouts();
            if (currentInterval > 0 && React.Children.count(children) > 1) {
                this.tickDelay = requestTimeout(() => {
                    this.tickLoop = requestTimeout(this.tick, currentInterval);
                }, delay);
            }
            else {
                this.setState((state, props) => {
                    const { currentWordIndex: _currentWordIndex } = state;
                    return {
                        currentInterval: Array.isArray(props.interval)
                            ? props.interval[_currentWordIndex % props.interval.length]
                            : props.interval,
                    };
                });
            }
        }
        if (!isEqual(prevProps.children, children)) {
            this.setState({
                elements: React.Children.toArray(children),
            });
        }
    }
    componentWillUnmount() {
        this.isUnMounting = true;
        this.clearTimeouts();
    }
    clearTimeouts() {
        if (this.tickLoop != null) {
            clearRequestTimeout(this.tickLoop);
        }
        if (this.tickDelay != null) {
            clearRequestTimeout(this.tickDelay);
        }
    }
    getOpacity() {
        return this.props.fade ? 0 : 1;
    }
    getDimensions() {
        if (this.wordBox == null) {
            return {
                width: 0,
                height: 0,
            };
        }
        return this.wordBox.getBoundingClientRect();
    }
    getTransitionMotionStyles() {
        const { springConfig } = this.props;
        const { wordCount, currentEl } = this.state;
        return [
            {
                key: `step-${wordCount}`,
                data: {
                    currentEl,
                },
                style: {
                    opacity: spring(1, springConfig),
                    translate: spring(0, springConfig),
                },
            },
        ];
    }
    render() {
        const { className = "" } = this.props;
        return (React.createElement("div", { className: `${this.wrapperStyles} ${className}` },
            React.createElement(TransitionMotion, { willLeave: this.willLeave, willEnter: this.willEnter, styles: this.getTransitionMotionStyles() }, (interpolatedStyles) => {
                const { height, width } = this.getDimensions();
                const parsedWidth = this.wordBox == null ? "auto" : width;
                const parsedHeight = this.wordBox == null ? "auto" : height;
                return (React.createElement("div", { style: {
                        transition: `width ${this.props.adjustingSpeed}ms linear`,
                        height: parsedHeight,
                        width: parsedWidth,
                    } }, interpolatedStyles.map((config) => (React.createElement("div", { className: this.elementStyles, ref: (n) => {
                        this.wordBox = n;
                    }, key: config.key, style: {
                        opacity: config.style.opacity,
                        transform: `translateY(${config.style.translate}px)`,
                        position: this.wordBox == null ? "relative" : "absolute",
                    } }, config.data.currentEl)))));
            })));
    }
}
TextLoop.defaultProps = {
    interval: 3000,
    delay: 0,
    adjustingSpeed: 150,
    springConfig: { stiffness: 340, damping: 30 },
    fade: true,
    mask: false,
    noWrap: true,
};
export default TextLoop;
//# sourceMappingURL=TextLoop.js.map