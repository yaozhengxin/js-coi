# js-coi：灵活强大的前端校验工具

[![npm version](https://badge.fury.io/js/js-coi.svg)](https://badge.fury.io/js/js-coi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个功能丰富、易于使用的JavaScript数据验证库，支持链式调用和多种常用验证规则。

## ✨ 特性

- 🔗 **链式调用** - 优雅的API设计，支持方法链式调用
- 🛡️ **类型安全** - 完善的类型检查和错误处理
- 🎯 **丰富的验证规则** - 内置多种常用验证方法
- 📱 **移动端友好** - 支持手机号、身份证号等中国本土化验证
- 🚀 **高性能** - 预编译正则表达式，提升验证性能
- 📝 **完整文档** - 详细的JSDoc注释和使用示例
- 🔧 **灵活扩展** - 支持自定义验证规则和正则表达式

## 📦 安装

```bash
# 使用 npm
npm install js-coi

# 使用 yarn
yarn add js-coi
```

## 🚀 快速开始

### 基础用法

```javascript
const Coi = require('js-coi')
// 或者 import Coi from 'js-coi'

// 创建验证器实例
const validator = new Coi()

// 链式调用验证
validator
  .data('test@example.com')
  .label('邮箱')
  .isRequired('不能为空')
  .isEmail('格式不正确')

// 检查验证结果
if (!validator.pass) {
  console.log(validator.errorMessage) // 输出: 邮箱格式不正确
}
```

### 构造函数简化用法

```javascript
// 直接在构造函数中传入数据和标签
const validator = new Coi('13800138000', '手机号')
validator
  .isRequired('不能为空')
  .isPhone('格式不正确')

console.log(validator.pass) // true
```

## 📚 API 文档

### 基础方法

#### `data(input)` - 设置验证数据
```javascript
validator.data('要验证的数据')
```

#### `label(label)` - 设置字段标签
```javascript
validator.label('用户名') // 错误信息会显示为: 用户名不能为空
```

#### `reset()` - 重置验证状态
```javascript
validator.reset() // 清空所有错误，重置验证状态
```

#### `getAllErrors()` - 获取所有错误信息
```javascript
const errors = validator.getAllErrors() // 返回错误信息数组
```

### 验证规则

#### `isRequired(message)` - 必填验证
```javascript
validator.isRequired('不能为空')
// 支持字符串、数组、对象的空值检查
```

#### `minLength(length, message)` - 最小长度
```javascript
validator.minLength(6, '不能少于6位')
```

#### `maxLength(length, message)` - 最大长度
```javascript
validator.maxLength(20, '不能多于20位')
```

#### `lengthRange(min, max, message)` - 长度范围
```javascript
validator.lengthRange(6, 20, '长度必须在6-20之间')
```

#### `numberRange(min, max, message)` - 数值范围
```javascript
validator.numberRange(1, 100, '数值必须在1-100之间')
```

### 格式验证

#### `isEmail(message)` - 邮箱验证
```javascript
validator.isEmail('邮箱格式不正确')
```

#### `isURL(message)` - URL验证
```javascript
validator.isURL('网址格式不正确')
```

#### `isPhone(message)` - 手机号验证（中国大陆）
```javascript
validator.isPhone('手机号格式不正确')
// 支持: 13x, 14x, 15x, 16x, 17x, 18x, 19x
```

#### `isIdCard(message)` - 身份证号验证（18位）
```javascript
validator.isIdCard('身份证号格式不正确')
```

#### `isNumber(message)` - 数字验证
```javascript
validator.isNumber('必须是有效数字')
// 支持整数和小数
```

#### `isPositiveInteger(message)` - 正整数验证
```javascript
validator.isPositiveInteger('必须是正整数')
```

#### `isChinese(message)` - 中文验证
```javascript
validator.isChinese('必须是中文')
```

#### `requireFormat(formatArray, message)` - 格式组合验证
```javascript
// 只允许数字和字母
validator.requireFormat(['number', 'letter'], '只能包含数字和字母')

// 只允许中文
validator.requireFormat(['chinese'], '只能包含中文')

// 允许数字、字母、中文
validator.requireFormat(['number', 'letter', 'chinese'], '格式不正确')
```

### 自定义验证

#### `requireRegexp(regex, message)` - 正则表达式验证
```javascript
validator.requireRegexp(/^[A-Z]{2,}$/, '必须是大写字母且至少2位')
```

#### `custom(validator, message)` - 自定义验证函数
```javascript
validator.custom((value) => {
  return value !== 'admin' // 不能是admin
}, '用户名不能是admin')

// 复杂验证逻辑
validator.custom((value) => {
  // 自定义业务逻辑
  return someComplexValidation(value)
}, '不符合业务规则')
```

## 🎯 使用示例

### 表单验证

```javascript
const Coi = require('js-coi')

function validateUserForm(userData) {
  const validator = new Coi()
  
  // 验证用户名
  validator
    .data(userData.username)
    .label('用户名')
    .isRequired('不能为空')
    .lengthRange(3, 20, '长度必须在3-20位之间')
    .requireFormat(['number', 'letter'], '只能包含数字和字母')
  
  // 验证邮箱
  validator
    .data(userData.email)
    .label('邮箱')
    .isRequired('不能为空')
    .isEmail('格式不正确')
  
  // 验证手机号
  validator
    .data(userData.phone)
    .label('手机号')
    .isRequired('不能为空')
    .isPhone('格式不正确')
  
  // 验证年龄
  validator
    .data(userData.age)
    .label('年龄')
    .isRequired('不能为空')
    .isNumber('必须是数字')
    .numberRange(1, 120, '年龄必须在1-120之间')
  
  return {
    pass: validator.pass,
    message: validator.errorMessage,
    errors: validator.getAllErrors()
  }
}

// 使用示例
const result = validateUserForm({
  username: 'testuser',
  email: 'test@example.com',
  phone: '13800138000',
  age: 25
})

if (!result.pass) {
  console.log('验证失败:', result.message)
  console.log('所有错误:', result.errors)
}
```

### 单字段快速验证

```javascript
// 快速验证邮箱
const emailValidator = new Coi('test@email.com', '邮箱')
emailValidator.isRequired().isEmail()

// 快速验证手机号
const phoneValidator = new Coi('13800138000', '手机号')
phoneValidator.isRequired().isPhone()

// 快速验证身份证
const idValidator = new Coi('11010119900101001X', '身份证')
idValidator.isRequired().isIdCard()
```

## 🔧 高级功能

### 错误信息收集

```javascript
const validator = new Coi()

// 即使验证失败，也可以收集所有错误
validator
  .data('')
  .label('用户名')
  .isRequired('不能为空')
  .minLength(3, '不能少于3位') // 这个不会执行，因为上面已经失败
  
console.log(validator.getAllErrors()) // ['用户名不能为空']
```

### 状态重置

```javascript
const validator = new Coi()

// 第一次验证
validator.data('invalid-email').isEmail('格式错误')
console.log(validator.pass) // false

// 重置后再次验证
validator.reset().data('valid@email.com').isEmail('格式错误')
console.log(validator.pass) // true
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT © [wtfjun](https://github.com/wtfjun)

## 📞 联系方式

如有疑问，欢迎联系：
- GitHub: [@wtfjun](https://github.com/wtfjun)
- 微信: c13266836563（陈小俊）

---

**持续更新中，欢迎关注和反馈！** 🎉
