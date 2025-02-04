"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_motion_1 = require("react-motion");
const cxs_1 = __importDefault(require("cxs"));
const isEqual_1 = require("./isEqual");
const utils_1 = require("./utils");
class TextLoop extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.isUnMounting = false;
        this.tickDelay = 0;
        this.tickLoop = 0;
        this.wordBox = null;
        this.willLeave = () => {
            const { height } = this.getDimensions();
            return {
                opacity: (0, react_motion_1.spring)(this.getOpacity(), this.props.springConfig),
                translate: (0, react_motion_1.spring)(-height, this.props.springConfig),
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
                        this.tickLoop = (0, utils_1.requestTimeout)(this.tick, this.state.currentInterval);
                    }
                });
            }
        };
        this.wrapperStyles = (0, cxs_1.default)(Object.assign(Object.assign({}, (this.props.mask && { overflow: "hidden" })), {
            display: "inline-block",
            position: "relative",
            verticalAlign: "top",
        }));
        this.elementStyles = (0, cxs_1.default)({
            display: "inline-block",
            left: 0,
            top: 0,
            whiteSpace: this.props.noWrap ? "nowrap" : "normal",
        });
        const elements = react_1.default.Children.toArray(props.children);
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
            this.tickDelay = (0, utils_1.requestTimeout)(() => {
                this.tickLoop = (0, utils_1.requestTimeout)(this.tick, currentInterval);
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
            if (currentInterval > 0 && react_1.default.Children.count(children) > 1) {
                this.tickDelay = (0, utils_1.requestTimeout)(() => {
                    this.tickLoop = (0, utils_1.requestTimeout)(this.tick, currentInterval);
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
        if (!(0, isEqual_1.isEqual)(prevProps.children, children)) {
            this.setState({
                elements: react_1.default.Children.toArray(children),
            });
        }
    }
    componentWillUnmount() {
        this.isUnMounting = true;
        this.clearTimeouts();
    }
    clearTimeouts() {
        if (this.tickLoop != null) {
            (0, utils_1.clearRequestTimeout)(this.tickLoop);
        }
        if (this.tickDelay != null) {
            (0, utils_1.clearRequestTimeout)(this.tickDelay);
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
                    opacity: (0, react_motion_1.spring)(1, springConfig),
                    translate: (0, react_motion_1.spring)(0, springConfig),
                },
            },
        ];
    }
    render() {
        const { className = "" } = this.props;
        return (react_1.default.createElement("div", { className: `${this.wrapperStyles} ${className}` },
            react_1.default.createElement(react_motion_1.TransitionMotion, { willLeave: this.willLeave, willEnter: this.willEnter, styles: this.getTransitionMotionStyles() }, (interpolatedStyles) => {
                const { height, width } = this.getDimensions();
                const parsedWidth = this.wordBox == null ? "auto" : width;
                const parsedHeight = this.wordBox == null ? "auto" : height;
                return (react_1.default.createElement("div", { style: {
                        transition: `width ${this.props.adjustingSpeed}ms linear`,
                        height: parsedHeight,
                        width: parsedWidth,
                    } }, interpolatedStyles.map((config) => (react_1.default.createElement("div", { className: this.elementStyles, ref: (n) => {
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
exports.default = TextLoop;
//# sourceMappingURL=TextLoop.js.map