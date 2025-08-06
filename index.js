/**
 * js-coi - A flexible front-end validation tool
 * @author wtfjun
 * @version 1.0.3
 */

/**
 * 预编译的正则表达式模式，提高性能
 */
const REGEX_PATTERNS = {
    email: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+\.){1,63}[a-z0-9]+$/i,
    url: /^(?!mailto:)(?:(?:http|https|ftp):\/\/|\/\/)(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:(\/|\?|#)[^\s]*)?$/i,
    phone: /^1[3-9]\d{9}$/,
    idCard: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
    positiveInteger: /^[1-9]\d*$/,
    number: /^-?\d+(\.\d+)?$/,
    chinese: /^[\u4e00-\u9fa5]+$/,
    whitespace: /^\s*$/
};

/**
 * 格式映射表
 */
const FORMAT_MAP = {
    number: '0-9',
    letter: 'a-zA-Z',
    chinese: '\u4e00-\u9fa5'
};

/**
 * Coi - 数据验证类
 * 支持链式调用的前端数据校验工具
 * 
 * @class Coi
 * @example
 * const validator = new Coi()
 * validator
 *   .data('test@email.com')
 *   .label('邮箱')
 *   .isRequired('不能为空')
 *   .isEmail('格式不正确')
 * 
 * if (!validator.pass) {
 *   console.log(validator.errorMessage)
 * }
 */
class Coi {
    /**
     * 创建一个验证器实例
     * @param {*} input - 要验证的数据
     * @param {string} [label] - 字段标签，会添加到错误信息前
     */
    constructor(input, label) {
        this._input = input;
        this._label = label || '';
        this.errorMessage = '通过校验';
        this.pass = true;
        this._errors = []; // 存储所有错误信息
    }

    /**
     * 设置要验证的数据
     * @param {*} input - 要验证的数据
     * @returns {Coi} 返回当前实例，支持链式调用
     */
    data(input) {
        if (!this.pass) return this;
        this._input = input;
        return this;
    }

    /**
     * 设置字段标签
     * @param {string} label - 字段标签
     * @returns {Coi} 返回当前实例，支持链式调用
     */
    label(label) {
        if (!this.pass) return this;
        if (typeof label !== 'string') {
            this._setError('标签必须是字符串类型');
            return this;
        }
        this._label = label;
        return this;
    }

    /**
     * 必填校验
     * @param {string} message - 错误信息
     * @returns {Coi} 返回当前实例，支持链式调用
     */
    isRequired(message = '不能为空') {
        if (!this.pass) return this;

        const isEmpty = this._input === null || 
                       this._input === undefined || 
                       (typeof this._input === 'string' && REGEX_PATTERNS.whitespace.test(this._input)) ||
                       (Array.isArray(this._input) && this._input.length === 0) ||
                       (typeof this._input === 'object' && Object.keys(this._input).length === 0);

        if (isEmpty) {
            this._setError(message);
        }
        return this;
    }

    /**
     * 最小长度校验
     * @param {number} length - 最小长度
     * @param {string} message - 错误信息
     * @returns {Coi} 返回当前实例，支持链式调用
     */
    minLength(length, message = `不能少于${length}位`) {
        if (!this.pass) return this;
        
        if (!this._validateNumber(length, '长度参数必须是数字')) return this;
        if (!this._hasLength()) return this;

        if (this._getLength() < length) {
            this._setError(message);
        }
        return this;
    }

    /**
     * 最大长度校验
     * @param {number} length - 最大长度
     * @param {string} message - 错误信息
     * @returns {Coi} 返回当前实例，支持链式调用
     */
    maxLength(length, message = `不能多于${length}位`) {
        if (!this.pass) return this;
        
        if (!this._validateNumber(length, '长度参数必须是数字')) return this;
        if (!this._hasLength()) return this;

        if (this._getLength() > length) {
            this._setError(message);
        }
        return this;
    }

    /**
     * 长度范围校验
     * @param {number} min - 最小长度
     * @param {number} max - 最大长度
     * @param {string} message - 错误信息
     * @returns {Coi} 返回当前实例，支持链式调用
     */
    lengthRange(min, max, message = `长度必须在${min}-${max}之间`) {
        if (!this.pass) return this;
        
        if (!this._validateNumber(min, '最小长度参数必须是数字')) return this;
        if (!this._validateNumber(max, '最大长度参数必须是数字')) return this;
        if (!this._hasLength()) return this;

        const length = this._getLength();
        if (length < min || length > max) {
            this._setError(message);
        }
        return this;
    }

    /**
     * 数值范围校验
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @param {string} message - 错误信息
     * @returns {Coi} 返回当前实例，支持链式调用
     */
    numberRange(min, max, message = `数值必须在${min}-${max}之间`) {
        if (!this.pass) return this;
        
        if (!this._validateNumber(min, '最小值参数必须是数字')) return this;
        if (!this._validateNumber(max, '最大值参数必须是数字')) return this;
        
        const num = Number(this._input);
        if (isNaN(num)) {
            this._setError('必须是有效数字');
            return this;
        }

        if (num < min || num > max) {
            this._setError(message);
        }
        return this;
    }

    /**
     * 格式校验（支持数字、字母、中文组合）
     * @param {string[]} formatArray - 允许的格式数组 ['number', 'letter', 'chinese']
     * @param {string} message - 错误信息
     * @returns {Coi} 返回当前实例，支持链式调用
     */
    requireFormat(formatArray, message = '格式不正确') {
        if (!this.pass) return this;
        
        if (!Array.isArray(formatArray)) {
            this._setError('格式参数必须是数组');
            return this;
        }

        if (!this._validateString()) return this;

        const allowedChars = formatArray
            .filter(format => FORMAT_MAP[format])
            .map(format => FORMAT_MAP[format])
            .join('');

        if (!allowedChars) {
            this._setError('无效的格式参数');
            return this;
        }

        const formatReg = new RegExp(`^[${allowedChars}]*$`);
        if (!formatReg.test(this._input)) {
            this._setError(message);
        }
        return this;
    }

    /**
     * 邮箱格式校验
     * @param {string} message - 错误信息
     * @returns {Coi} 返回当前实例，支持链式调用
     */
    isEmail(message = '邮箱格式不正确') {
        if (!this.pass) return this;
        if (!this._validateString()) return this;

        if (!REGEX_PATTERNS.email.test(this._input)) {
            this._setError(message);
        }
        return this;
    }

    /**
     * URL格式校验
     * @param {string} message - 错误信息
     * @returns {Coi} 返回当前实例，支持链式调用
     */
    isURL(message = 'URL格式不正确') {
        if (!this.pass) return this;
        if (!this._validateString()) return this;

        if (!REGEX_PATTERNS.url.test(this._input)) {
            this._setError(message);
        }
        return this;
    }

    /**
     * 手机号格式校验（中国大陆）
     * @param {string} message - 错误信息
     * @returns {Coi} 返回当前实例，支持链式调用
     */
    isPhone(message = '手机号格式不正确') {
        if (!this.pass) return this;
        if (!this._validateString()) return this;

        if (!REGEX_PATTERNS.phone.test(this._input)) {
            this._setError(message);
        }
        return this;
    }

    /**
     * 身份证号格式校验（中国大陆18位）
     * @param {string} message - 错误信息
     * @returns {Coi} 返回当前实例，支持链式调用
     */
    isIdCard(message = '身份证号格式不正确') {
        if (!this.pass) return this;
        if (!this._validateString()) return this;

        if (!REGEX_PATTERNS.idCard.test(this._input)) {
            this._setError(message);
        }
        return this;
    }

    /**
     * 正整数校验
     * @param {string} message - 错误信息
     * @returns {Coi} 返回当前实例，支持链式调用
     */
    isPositiveInteger(message = '必须是正整数') {
        if (!this.pass) return this;
        if (!this._validateString()) return this;

        if (!REGEX_PATTERNS.positiveInteger.test(this._input)) {
            this._setError(message);
        }
        return this;
    }

    /**
     * 数字校验（包括小数）
     * @param {string} message - 错误信息
     * @returns {Coi} 返回当前实例，支持链式调用
     */
    isNumber(message = '必须是有效数字') {
        if (!this.pass) return this;
        
        const num = Number(this._input);
        if (isNaN(num)) {
            this._setError(message);
        }
        return this;
    }

    /**
     * 中文校验
     * @param {string} message - 错误信息
     * @returns {Coi} 返回当前实例，支持链式调用
     */
    isChinese(message = '必须是中文') {
        if (!this.pass) return this;
        if (!this._validateString()) return this;

        if (!REGEX_PATTERNS.chinese.test(this._input)) {
            this._setError(message);
        }
        return this;
    }

    /**
     * 自定义正则表达式校验
     * @param {RegExp} regex - 正则表达式
     * @param {string} message - 错误信息
     * @returns {Coi} 返回当前实例，支持链式调用
     */
    requireRegexp(regex, message = '格式不正确') {
        if (!this.pass) return this;
        
        if (!(regex instanceof RegExp)) {
            this._setError('正则表达式参数无效');
            return this;
        }

        if (!regex.test(String(this._input))) {
            this._setError(message);
        }
        return this;
    }

    /**
     * 自定义校验函数
     * @param {Function} validator - 校验函数，返回true表示通过
     * @param {string} message - 错误信息
     * @returns {Coi} 返回当前实例，支持链式调用
     */
    custom(validator, message = '校验失败') {
        if (!this.pass) return this;
        
        if (typeof validator !== 'function') {
            this._setError('校验器必须是函数');
            return this;
        }

        try {
            if (!validator(this._input)) {
                this._setError(message);
            }
        } catch (error) {
            this._setError('校验函数执行出错');
        }
        return this;
    }

    /**
     * 获取所有错误信息
     * @returns {string[]} 错误信息数组
     */
    getAllErrors() {
        return this._errors.slice();
    }

    /**
     * 重置验证状态
     * @returns {Coi} 返回当前实例，支持链式调用
     */
    reset() {
        this.pass = true;
        this.errorMessage = '通过校验';
        this._errors = [];
        return this;
    }

    // 私有方法

    /**
     * 设置错误信息
     * @private
     * @param {string} message - 错误信息
     */
    _setError(message) {
        const fullMessage = this._label ? `${this._label}${message}` : message;
        this.errorMessage = fullMessage;
        this._errors.push(fullMessage);
        this.pass = false;
    }

    /**
     * 验证参数是否为数字
     * @private
     * @param {*} value - 要验证的值
     * @param {string} errorMessage - 错误信息
     * @returns {boolean} 是否为有效数字
     */
    _validateNumber(value, errorMessage) {
        if (typeof value !== 'number' || isNaN(value)) {
            this._setError(errorMessage);
            return false;
        }
        return true;
    }

    /**
     * 验证输入是否为字符串
     * @private
     * @returns {boolean} 是否为字符串
     */
    _validateString() {
        if (typeof this._input !== 'string') {
            this._setError('必须是字符串类型');
            return false;
        }
        return true;
    }

    /**
     * 检查输入是否具有长度属性
     * @private
     * @returns {boolean} 是否具有长度属性
     */
    _hasLength() {
        if (this._input === null || this._input === undefined) {
            this._setError('数据不能为空');
            return false;
        }
        if (typeof this._input.length !== 'number') {
            this._setError('数据必须具有长度属性');
            return false;
        }
        return true;
    }

    /**
     * 获取输入的长度
     * @private
     * @returns {number} 长度值
     */
    _getLength() {
        if (typeof this._input === 'string') {
            return this._input.length;
        }
        if (Array.isArray(this._input)) {
            return this._input.length;
        }
        return String(this._input).length;
    }
}

module.exports = Coi;
