import React from 'react';
import cls from 'classnames';
import PropTypes from 'prop-types';
import {
    noop,
    isString,
    isArray,
    isNull,
    isUndefined,
    isFunction
} from 'lodash';
import { cssClasses, strings } from '@douyinfe/semi-foundation/tagInput/constants';
import '@douyinfe/semi-foundation/tagInput/tagInput.scss';
import TagInputFoundation, { TagInputAdapter } from '@douyinfe/semi-foundation/tagInput/foundation';
import { ArrayElement } from '../_base/base';
import { isSemiIcon } from '../_utils';
import BaseComponent from '../_base/baseComponent';
import Tag from '../tag';
import Input from '../input';
import Popover, { PopoverProps } from '../popover';
import Paragraph from '../typography/paragraph';
import { IconClear } from '@douyinfe/semi-icons';

export type Size = ArrayElement<typeof strings.SIZE_SET>;
export type RestTagsPopoverProps = PopoverProps;
type ValidateStatus = "default" | "error" | "warning";

export interface TagInputProps {
    className?: string;
    defaultValue?: string[];
    disabled?: boolean;
    inputValue?: string;
    maxLength?: number;
    max?: number;
    maxTagCount?: number;
    showRestTagsPopover?: boolean;
    restTagsPopoverProps?: RestTagsPopoverProps;
    showContentTooltip?: boolean;
    allowDuplicates?: boolean;
    addOnBlur?: boolean;
    onAdd?: (addedValue: string[]) => void;
    onBlur?: (e: React.MouseEvent<HTMLInputElement>) => void;
    onChange?: (value: string[]) => void;
    onExceed?: ((value: string[]) => void);
    onFocus?: (e: React.MouseEvent<HTMLInputElement>) => void;
    onInputChange?: (value: string, e: React.MouseEvent<HTMLInputElement>) => void;
    onInputExceed?: ((value: string) => void);
    onKeyDown?: (e: React.MouseEvent<HTMLInputElement>) => void;
    onRemove?: (removedValue: string, idx: number) => void;
    placeholder?: string;
    insetLabel?: React.ReactNode;
    insetLabelId?: string;
    prefix?: React.ReactNode;
    renderTagItem?: (value: string, index: number) => React.ReactNode;
    separator?: string | string[] | null;
    showClear?: boolean;
    size?: Size;
    style?: React.CSSProperties;
    suffix?: React.ReactNode;
    validateStatus?: ValidateStatus;
    value?: string[] | undefined;
    autoFocus?: boolean;
    'aria-label'?: string;
}

export interface TagInputState {
    tagsArray?: string[];
    inputValue?: string;
    focusing?: boolean;
    hovering?: boolean;
}

const prefixCls = cssClasses.PREFIX;

class TagInput extends BaseComponent<TagInputProps, TagInputState> {
    static propTypes = {
        children: PropTypes.node,
        style: PropTypes.object,
        className: PropTypes.string,
        disabled: PropTypes.bool,
        allowDuplicates: PropTypes.bool,
        max: PropTypes.number,
        maxTagCount: PropTypes.number,
        maxLength: PropTypes.number,
        showRestTagsPopover: PropTypes.bool,
        restTagsPopoverProps: PropTypes.object,
        showContentTooltip: PropTypes.bool,
        defaultValue: PropTypes.array,
        value: PropTypes.array,
        inputValue: PropTypes.string,
        placeholder: PropTypes.string,
        separator: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        showClear: PropTypes.bool,
        addOnBlur: PropTypes.bool,
        autoFocus: PropTypes.bool,
        renderTagItem: PropTypes.func,
        onBlur: PropTypes.func,
        onFocus: PropTypes.func,
        onChange: PropTypes.func,
        onInputChange: PropTypes.func,
        onExceed: PropTypes.func,
        onInputExceed: PropTypes.func,
        onAdd: PropTypes.func,
        onRemove: PropTypes.func,
        onKeyDown: PropTypes.func,
        size: PropTypes.oneOf(strings.SIZE_SET),
        validateStatus: PropTypes.oneOf(strings.STATUS),
        prefix: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
        suffix: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
        'aria-label': PropTypes.string,
    };

    static defaultProps = {
        showClear: false,
        addOnBlur: false,
        allowDuplicates: true,
        showRestTagsPopover: true,
        autoFocus: false,
        showContentTooltip: true,
        separator: ',',
        size: 'default' as const,
        validateStatus: 'default' as const,
        onBlur: noop,
        onFocus: noop,
        onChange: noop,
        onInputChange: noop,
        onExceed: noop,
        onInputExceed: noop,
        onAdd: noop,
        onRemove: noop,
        onKeyDown: noop,
    };

    inputRef: React.RefObject<HTMLInputElement>;
    foundation: TagInputFoundation;

    constructor(props: TagInputProps) {
        super(props);
        this.foundation = new TagInputFoundation(this.adapter);
        this.state = {
            tagsArray: props.defaultValue || [],
            inputValue: '',
            focusing: false,
            hovering: false
        };
        this.inputRef = React.createRef();
    }

    static getDerivedStateFromProps(nextProps: TagInputProps, prevState: TagInputState) {
        const { value, inputValue } = nextProps;
        const { tagsArray: prevTagsArray } = prevState;
        let tagsArray: string[];
        if (isArray(value)) {
            tagsArray = value;
        } else if ('value' in nextProps && !value) {
            tagsArray = [];
        } else {
            tagsArray = prevTagsArray;
        }
        return {
            tagsArray,
            inputValue: isString(inputValue) ? inputValue : prevState.inputValue
        };
    }

    get adapter(): TagInputAdapter {
        return {
            ...super.adapter,
            setInputValue: (inputValue: string) => {
                this.setState({ inputValue });
            },
            setTagsArray: (tagsArray: string[]) => {
                this.setState({ tagsArray });
            },
            setFocusing: (focusing: boolean) => {
                this.setState({ focusing });
            },
            toggleFocusing: (isFocus: boolean) => {
                const input = this.inputRef && this.inputRef.current;
                if (isFocus) {
                    input && input.focus();
                } else {
                    input && input.blur();
                }
                this.setState({ focusing: isFocus });
            },
            setHovering: (hovering: boolean) => {
                this.setState({ hovering });
            },
            notifyBlur: (e: React.MouseEvent<HTMLInputElement>) => {
                this.props.onBlur(e);
            },
            notifyFocus: (e: React.MouseEvent<HTMLInputElement>) => {
                this.props.onFocus(e);
            },
            notifyInputChange: (v: string, e: React.MouseEvent<HTMLInputElement>) => {
                this.props.onInputChange(v, e);
            },
            notifyTagChange: (v: string[]) => {
                this.props.onChange(v);
            },
            notifyTagAdd: (v: string[]) => {
                this.props.onAdd(v);
            },
            notifyTagRemove: (v: string, idx: number) => {
                this.props.onRemove(v, idx);
            },
            notifyKeyDown: e => {
                this.props.onKeyDown(e);
            },
        };
    }

    componentDidMount() {
        const { disabled, autoFocus } = this.props;
        if (!disabled && autoFocus) {
            this.inputRef.current.focus();
        }
    }

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.foundation.handleInputChange(e);
    };

    handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        this.foundation.handleKeyDown(e);
    };

    handleInputFocus = (e: React.MouseEvent<HTMLInputElement>) => {
        this.foundation.handleInputFocus(e);
    };

    handleInputBlur = (e: React.MouseEvent<HTMLInputElement>) => {
        this.foundation.handleInputBlur(e);
    };

    handleClearBtn = (e: React.MouseEvent<HTMLDivElement>) => {
        this.foundation.handleClearBtn(e);
    };

    /* istanbul ignore next */
    handleClearEnterPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        this.foundation.handleClearEnterPress(e);
    };

    handleTagClose = (idx: number) => {
        this.foundation.handleTagClose(idx);
    };

    handleInputMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        this.foundation.handleInputMouseLeave();
    };

    handleInputMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        this.foundation.handleInputMouseEnter();
    };

    handleClickPrefixOrSuffix = (e: React.MouseEvent<HTMLInputElement>) => {
        this.foundation.handleClickPrefixOrSuffix(e);
    };

    handlePreventMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
        this.foundation.handlePreventMouseDown(e);
    };


    renderClearBtn() {
        const { hovering, tagsArray, inputValue } = this.state;
        const { showClear, disabled } = this.props;
        const clearCls = cls(`${prefixCls}-clearBtn`, {
            [`${prefixCls}-clearBtn-invisible`]: !hovering || (inputValue === '' && tagsArray.length === 0) || disabled,
        });
        if (showClear) {
            return (
                <div
                    role="button"
                    tabIndex={0}
                    aria-label="Clear TagInput value"
                    className={clearCls}
                    onClick={e => this.handleClearBtn(e)}
                    onKeyPress={e => this.handleClearEnterPress(e)}
                >
                    <IconClear />
                </div>
            );
        }
        return null;
    }

    renderPrefix() {
        const { prefix, insetLabel, insetLabelId } = this.props;
        const labelNode = prefix || insetLabel;
        if (isNull(labelNode) || isUndefined(labelNode)) {
            return null;
        }
        const prefixWrapperCls = cls(`${prefixCls}-prefix`, {
            [`${prefixCls}-inset-label`]: insetLabel,
            [`${prefixCls}-prefix-text`]: labelNode && isString(labelNode),
            // eslint-disable-next-line max-len
            [`${prefixCls}-prefix-icon`]: isSemiIcon(labelNode),
        });
        return (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events
            <div 
                className={prefixWrapperCls} 
                onMouseDown={this.handlePreventMouseDown} 
                onClick={this.handleClickPrefixOrSuffix} 
                id={insetLabelId} x-semi-prop="prefix"
            >
                {labelNode}
            </div>
        );
    }

    renderSuffix() {
        const { suffix } = this.props;
        if (isNull(suffix) || isUndefined(suffix)) {
            return null;
        }
        const suffixWrapperCls = cls(`${prefixCls}-suffix`, {
            [`${prefixCls}-suffix-text`]: suffix && isString(suffix),
            // eslint-disable-next-line max-len
            [`${prefixCls}-suffix-icon`]: isSemiIcon(suffix),
        });
        return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
            <div
                className={suffixWrapperCls}
                onMouseDown={this.handlePreventMouseDown}
                onClick={this.handleClickPrefixOrSuffix}
                x-semi-prop="suffix"
            >
                {suffix}
            </div>
        );
    }

    renderTags() {
        const {
            size,
            disabled,
            renderTagItem,
            maxTagCount,
            showContentTooltip,
            showRestTagsPopover,
            restTagsPopoverProps = {},
        } = this.props;
        const { tagsArray } = this.state;
        const tagCls = cls(`${prefixCls}-wrapper-tag`, {
            [`${prefixCls}-wrapper-tag-size-${size}`]: size,
        });
        const typoCls = cls(`${prefixCls}-wrapper-typo`, {
            [`${prefixCls}-wrapper-typo-disabled`]: disabled
        });
        const restTagsCls = cls(`${prefixCls}-wrapper-n`, {
            [`${prefixCls}-wrapper-n-disabled`]: disabled
        });
        const restTags: Array<React.ReactNode> = [];
        const tags: Array<React.ReactNode> = [];
        tagsArray.forEach((value, index) => {
            let item = null;
            if (isFunction(renderTagItem)) {
                item = renderTagItem(value, index);
            } else {
                item = (
                    <Tag
                        className={tagCls}
                        color="white"
                        size={size === 'small' ? 'small' : 'large'}
                        type="light"
                        onClose={() => {
                            !disabled && this.handleTagClose(index);
                        }}
                        closable={!disabled}
                        key={`${index}${value}`}
                        visible
                        aria-label={`${!disabled ? 'Closable ' : ''}Tag: ${value}`}
                    >
                        <Paragraph
                            className={typoCls}
                            ellipsis={{ showTooltip: showContentTooltip, rows: 1 }}
                        >
                            {value}
                        </Paragraph>
                    </Tag>
                );
            }
            if (maxTagCount && index >= maxTagCount) {
                restTags.push(item);
            } else {
                tags.push(item);
            }
        });

        const restTagsContent = (
            <span className={restTagsCls}>+{tagsArray.length - maxTagCount}</span>
        );

        return (
            <>
                {tags}
                {
                    restTags.length > 0 &&
                    (
                        showRestTagsPopover ?
                            (
                                <Popover
                                    content={restTags}
                                    showArrow
                                    trigger="hover"
                                    position="top"
                                    autoAdjustOverflow
                                    {...restTagsPopoverProps}
                                >
                                    {restTagsContent}
                                </Popover>
                            ) : restTagsContent
                    )
                }
            </>
        );
    }

    blur() {
        this.inputRef.current.blur();
    }

    focus() {
        this.inputRef.current.focus();
    }

    render() {
        const {
            size,
            style,
            className,
            disabled,
            placeholder,
            validateStatus,
        } = this.props;

        const {
            focusing,
            hovering,
            tagsArray,
            inputValue
        } = this.state;

        const tagInputCls = cls(prefixCls, className, {
            [`${prefixCls}-focus`]: focusing,
            [`${prefixCls}-disabled`]: disabled,
            [`${prefixCls}-hover`]: hovering && !disabled,
            [`${prefixCls}-error`]: validateStatus === 'error',
            [`${prefixCls}-warning`]: validateStatus === 'warning'
        });

        const inputCls = cls(`${prefixCls}-wrapper-input`);

        const wrapperCls = cls(`${prefixCls}-wrapper`);

        return (
            <div
                style={style}
                className={tagInputCls}
                aria-disabled={disabled}
                aria-label={this.props['aria-label']}
                aria-invalid={validateStatus === 'error'}
                onMouseEnter={e => {
                    this.handleInputMouseEnter(e);
                }}
                onMouseLeave={e => {
                    this.handleInputMouseLeave(e);
                }}
            >
                {this.renderPrefix()}
                <div className={wrapperCls}>
                    {this.renderTags()}
                    <Input
                        aria-label='input value'
                        ref={this.inputRef as any}
                        className={inputCls}
                        disabled={disabled}
                        value={inputValue}
                        size={size}
                        placeholder={tagsArray.length === 0 ? placeholder : ''}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            this.handleKeyDown(e);
                        }}
                        onChange={(v: string, e: React.ChangeEvent<HTMLInputElement>) => {
                            this.handleInputChange(e);
                        }}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                            this.handleInputBlur(e as any);
                        }}
                        onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                            this.handleInputFocus(e as any);
                        }}
                    />
                </div>
                {this.renderClearBtn()}
                {this.renderSuffix()}
            </div>
        );
    }
}

export default TagInput;
export { ValidateStatus };