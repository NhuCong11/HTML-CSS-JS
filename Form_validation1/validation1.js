const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// Đối tượng validator - Object constructor
function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) { // kt tồn tại parentElement
            if (element.parentElement.matches(selector)) { // kiểm tra xem có class selector cần tìm
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    // Lấy ra thẻ form cần validate
    const formElement = $(options.form);

    // Khai báo 1 biến lưu trữ rules
    var selectorRules = {};

    // Hàm thực hiện validate
    function validate(inputElement, rule) {
        // Lấy ra thẻ span class form-message
        const errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.error);

        var errorMessage;

        // Lấy ra các rule của selector
        var rules = selectorRules[rule.selector];

        // lặp qua từng rule và kiểm tra
        // Nếu có lỗi thì dừng kiểm tra
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }

            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }

    // Kiêm tra tồn tại formElement
    if (formElement) {
        // Loại bỏ hành động mặc định của trình duyệt khi submit form
        formElement.onsubmit = (e) => {
            e.preventDefault();

            var isFormValid = true;

            // Thực hiện lặp qua từng rule và validate
            options.rules.forEach((rule) => {
                const inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                // Trường hợp submit với JS
                if (typeof options.onSubmit === 'function') {

                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    var formValues = Array.from(enableInputs).reduce((values, input) => {

                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values;
                                }

                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }

                                values[input.name].push(input.value);

                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }

                        return values
                    }, {}); // convert sang array

                    options.onSubmit(formValues);
                }
                // Trường hợp submit với hành vi mặc định
                else {
                    formElement.submit();
                }
            }
        }

        // Lặp qua mỗi rule và xử lý ( lắng nghe sự kiện blur, input, ...)
        options.rules.forEach((rule) => {

            // Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) { // check xem có là mảng không nếu có lọt vào if
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            // Lấy ra input element
            const inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach((inputElement) => {
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = () => {
                    validate(inputElement, rule);
                }

                // Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = () => {
                    const errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.error);

                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            });
        });
    }

}

// Định nghĩa các rules
// Nguyên tắc các rules: 
// 1. Khi có lỗi return message lỗi
// 2. Khi hợp lệ không trả về undefine

Validator.isRequired = (selector, message) => {
    return {
        selector: selector,
        test: (value) => {
            return value ? undefined : message || 'Vui lòng nhập trường này'
            // trim(): loại bỏ dấu cách
        }
    }
}

Validator.isEmail = (selector, message) => {
    return {
        selector: selector,
        test: (value) => {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Vui lòng nhập lại email'
        }
    }
}

Validator.minLength = (selector, min, message) => {
    return {
        selector: selector,
        test: (value) => {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`;
        }
    }
}

Validator.isConfirmed = (selector, getConfirmValue, message) => {
    return {
        selector: selector,
        test: (value) => {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    }
}