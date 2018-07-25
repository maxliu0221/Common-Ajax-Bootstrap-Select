/*!
 * common Ajax And Static Load  Bootstrap Select
 *
 * Extends existing [Bootstrap Select] & [ Ajax BootStrap Select ] implementations by adding the ability to search via AJAX requests as you type.
 * Originally for CROSCON.
 *
 * @version 0.0.1
 * @author oneisall (max.liu/Zhicong Liu) - https://github.com/maxliu0221
 * @link https://github.com/maxliu0221/Common-Ajax-Bootstrap-Select
 * @copyright 2018 Zhicong Liu
 * @license Released under the GNU GENERAL PUBLIC LICENSE
 *
 * Last build: 2018-07-25 10:40:00
 */
(function ($) {

    /**
     * 对select框进行渲染
     * 定义jquery的扩展方法customAjaxSelect
     * @param options string或Map对象,当是string时,调用methods中的方法,为map时,进行即为渲染的配置文件,进行异步渲染
     * @param param
     * @returns {*}
     */
    $.fn.customAjaxSelect = function (options, param) {
        //1.如果第一个参数是字符串,则调用其对应的方法
        if (typeof options === 'string') {
            if ($.fn.customAjaxSelect.methods.hasOwnProperty(options)) {
                $.fn.customAjaxSelect.methods[options](this, param);
            } else {
                this.selectpicker(options, param);
            }
            return this.val();
        }
        //2.将调用时候传过来的参数和default参数合并
        var config = $.extend(true, {}, $.fn.customAjaxSelect.defaults, options || {});
        //3.添加必要默认值
        var display = config.display;
        var dataName = display.dataName;
        var valueName = display.valueName;
        var textName = display.textName;
        var subtextName = display.subtextName;
        //@TODO 设置一个公共的方法生成preprocessData函数???
        // 有可能可以,但是该方法可能是Ajax-bootstrap-select.js组件调用的请求后的方法,传入的参数有限制
        config.preprocessData = function (result) {
            var elementArray = [];
            var i = 0, len = 0;
            var curr;
            var sub = {};
            if (result.hasOwnProperty(dataName)) {
                if (typeof (result[dataName]) !== "undefined") {
                    elementArray = result[dataName];
                }
                len = elementArray.length;
                var array = [];
                for (; i < len; i++) {
                    curr = elementArray[i];
                    sub = {};
                    if (subtextName != null) {
                        sub = {subtext: curr[subtextName]}
                    }
                    array.push(
                        $.extend(true, curr, {
                            text: curr[textName],
                            value: curr[valueName],
                            data: sub
                        })
                    );
                }
            } else {
                elementArray = result;
                len = elementArray.length;
                array = [];
                for (; i < len; i++) {
                    curr = elementArray[i];
                    sub = {};
                    if (subtextName != null) {
                        sub = {subtext: curr[subtextName]}
                    }
                    array.push(
                        $.extend(true, curr, {
                            text: curr[textName],
                            value: curr[valueName],
                            data: sub
                        })
                    );
                }
            }
            return array;
        };
        //请求参数名设置
        var queryName = config.ajax.queryName;
        config.ajax.data = {};
        config.ajax.data[queryName] = '{{{q}}}';
        var target = $(this);
        if (!target.hasClass("customAjaxSelect")) target.addClass("customAjaxSelect");
        //4.根据配置进行select初始化
        target.selectpicker($.fn.customAjaxSelect.selectPickerDefaults).ajaxSelectPicker(config);
        //5.选择校验
        target.on('hidden.bs.select', function () {
            var $data = target.parents('form').data('bootstrapValidator');
            if (typeof $data !== 'undefined') {
                var name = target.attr('name');
                $data.updateStatus(name, 'NOT_VALIDATED', null).validateField(name);
            }
        });
        //6.大小
        if (display.width) {
            $(".customAjaxSelect button").css("width", display.width);
        }
    };


    /**
     * 异步加载的默认参数配置
     * @type {{ajax: {type: string}, locale: {emptyTitle: string, statusNoResults: string, searchPlaceholder: string}, display: {dataName: string, valueName: string, textName: string, subtextName: null, width: null}, preserveSelected: boolean}}
     */
    $.fn.customAjaxSelect.defaults = {
        ajax: {
            type: 'GET'
        }, locale: {
            emptyTitle: '请选择一个选项',
            statusNoResults: '没有找到匹配项',
            searchPlaceholder: '输入进行查询...',
            errorText: '获取发生异常,请检查网络或联系管理员',
            statusInitialized: '输入文字进行搜索'
        }, display: {
            dataName: 'data',//数据在返回的result json串中的属性名称
            valueName: 'id',//在data各个元素中,值的属性名称
            textName: 'name',//在data各个元素中,展示的属性名称
            subtextName: null,//在data各个元素中,需要后面补充展示信息的属性名称
            width: null //select框会被转成button,这里设置这个展示的宽度,null代表不设置,否则设置
        },
        preserveSelected: false
    };

    /**
     * 静态的默认参数配置
     * @type {{noneSelectedText: string, liveSearch: boolean, noneResultsText: string, liveSearchPlaceholder: string}}
     */
    $.fn.customAjaxSelect.selectPickerDefaults = {
        noneSelectedText: $.fn.customAjaxSelect.defaults.locale.emptyTitle,
        liveSearch: true,
        noneResultsText: $.fn.customAjaxSelect.defaults.locale.statusNoResults,
        liveSearchPlaceholder: $.fn.customAjaxSelect.defaults.locale.searchPlaceholder
    };


    /**
     * 如果传过来的是字符串，代表调用方法。
     * @type {{getValue: (function(*): *), setValue: $.fn.customAjaxSelect.methods.setValue, onceLoad: $.fn.customAjaxSelect.methods.onceLoad, staticLoad: $.fn.customAjaxSelect.methods.staticLoad}}
     */
    $.fn.customAjaxSelect.methods = {
        getValue: function ($target) {
            return $target.val();
        },
        setValue: function ($target, param) {
            $target.val(param);
            $target.selectpicker('refresh');
        },
        onceLoad: function ($target, param) {
            //1,与默认合并
            var config = $.extend(true, {}, $.fn.customAjaxSelect.defaults, param || {});

            //2.添加必要默认值
            var display = config.display;
            var dataName = display.dataName;
            var valueName = display.valueName;
            var textName = display.textName;
            var subtextName = display.subtextName;
            config.preprocessData = function (result) {
                var elementArray = [];
                var i = 0, len = 0;
                var curr;
                var sub = {};
                if (result.hasOwnProperty(dataName)) {
                    if (typeof (result[dataName]) !== "undefined") {
                        elementArray = result[dataName];
                    }
                    len = elementArray.length;
                    var array = [];
                    for (; i < len; i++) {
                        curr = elementArray[i];
                        sub = {};
                        if (subtextName != null) {
                            sub = {subtext: curr[subtextName]}
                        }
                        array.push(
                            $.extend(true, curr, {
                                text: curr[textName],
                                value: curr[valueName],
                                data: sub
                            })
                        );
                    }
                } else {
                    var tempArr = result;
                    if (jQuery.type(result) === "object") {
                        if (result.hasOwnProperty('display')) {
                            delete result['display'];
                        }
                        if (result.hasOwnProperty('ajax')) {
                            delete result['ajax'];
                        }
                        if (result.hasOwnProperty('locale')) {
                            delete result['locale'];
                        }
                        tempArr = [];
                        for (var key in result) {
                            if (result.hasOwnProperty(key))
                                tempArr.push(result[key]);
                        }

                    }
                    elementArray = tempArr;
                    len = elementArray.length;
                    array = [];
                    for (; i < len; i++) {
                        curr = elementArray[i];
                        sub = {};
                        if (subtextName != null) {
                            sub = {subtext: curr[subtextName]}
                        }
                        array.push(
                            $.extend(true, curr, {
                                text: curr[textName],
                                value: curr[valueName],
                                data: sub
                            })
                        );
                    }
                }
                return array;
            };

            if (!$target.hasClass("customAjaxSelect-onceLoad")) $target.addClass("customAjaxSelect-onceLoad");
            var request = $.ajax({
                url: config.ajax.url,
                data: config.ajax.data,
                type: config.ajax.type
            });
            request.done(function (result) {
                $.staticLoadSelect($target, result, config);
                if (config.display.width) {
                    $(".customAjaxSelect-onceLoad button").css("width", config.display.width);
                }
            });
        },
        staticLoad: function ($target, param) {
            //1,与默认合并
            var config = $.extend(true, {}, $.fn.customAjaxSelect.defaults, param || {});
            //2.添加必要默认值
            var display = config.display;
            var dataName = display.dataName;
            var valueName = display.valueName;
            var textName = display.textName;
            var subtextName = display.subtextName;
            config.preprocessData = function (result) {
                var elementArray = [];
                var i = 0, len = 0;
                var curr;
                var sub = {};
                if (result.hasOwnProperty(dataName)) {
                    if (typeof (result[dataName]) !== "undefined") {
                        elementArray = result[dataName];
                    }
                    len = elementArray.length;
                    var array = [];
                    for (; i < len; i++) {
                        curr = elementArray[i];
                        sub = {};
                        if (subtextName != null) {
                            sub = {subtext: curr[subtextName]}
                        }
                        array.push(
                            $.extend(true, curr, {
                                text: curr[textName],
                                value: curr[valueName],
                                data: sub
                            })
                        );
                    }
                } else {
                    var tempArr = result;
                    if (jQuery.type(result) === "object") {
                        if (result.hasOwnProperty('display')) {
                            delete result['display'];
                        }
                        if (result.hasOwnProperty('ajax')) {
                            delete result['ajax'];
                        }
                        if (result.hasOwnProperty('locale')) {
                            delete result['locale'];
                        }
                        tempArr = [];
                        for (var key in result) {
                            if (result.hasOwnProperty(key))
                                tempArr.push(result[key]);
                        }

                    }

                    elementArray = tempArr;
                    len = elementArray.length;
                    array = [];
                    for (; i < len; i++) {
                        curr = elementArray[i];
                        sub = {};
                        if (subtextName != null) {
                            sub = {subtext: curr[subtextName]}
                        }
                        array.push(
                            $.extend(true, curr, {
                                text: curr[textName],
                                value: curr[valueName],
                                data: sub
                            })
                        );
                    }
                }
                return array;
            };

            if (!$target.hasClass("customAjaxSelect-staticLoad")) $target.addClass("customAjaxSelect-staticLoad");
            $.staticLoadSelect($target, param, config);
            if (config.display.width) {
                $(".customAjaxSelect-staticLoad button").css("width", config.display.width);
            }
        }
    };

})(jQuery);
//拓展Jquery方法
$.extend({
    /**
     * 更具HTML标签对象,返回对应的选择配置文件
     * @param $target
     * @returns {*|{ajax: {url: *, type: *, queryName: *}, display: {dataName: *, valueName: *, textName: *, subtextName: *, width: *}}}
     */
    initHtmlConfig: function ($target) {
        var url = $target.attr("ajax-url");
        var type = $target.attr("ajax-type");
        var queryName = $target.attr("ajax-queryName");
        var dataName = $target.attr("ajax-dataName");
        var valueName = $target.attr("ajax-valueName");
        var textName = $target.attr("ajax-textName");
        var subtextName = $target.attr("ajax-subtextName");
        var width = $target.attr("ajax-width");
        var htmlConfig = {
            ajax: {
                url: url,
                type: type,
                queryName: queryName
            }, display: {
                dataName: dataName,//数据在返回的result json串中的属性名称
                valueName: valueName,//在data各个元素中,值的属性名称
                textName: textName,//在data各个元素中,展示的属性名称
                subtextName: subtextName,//在data各个元素中,需要后面补充展示信息的属性名称
                width: width //select框会被转成button,这里设置这个展示的宽度,null代表不设置,否则设置
            }
        };
        htmlConfig = jQuery.removeInvalidElement(htmlConfig);
        return htmlConfig;
    },

    /**
     * 去除config中第一级无效的属性,
     * 底层使用isCustomEmpty判断,即:
     * 属性值为null,undefined,'',则判断为无效
     * 对于无效的配置,则使用默认的配置
     * @param config
     * @returns {*}
     */
    removeInvalidElement: function (config) {
        var invalidKeyArray = [];
        for (var key in config) {
            if (config.hasOwnProperty(key) && $.isCustomEmpty(config[key])) {
                invalidKeyArray.push(key);
            }
        }
        var length = invalidKeyArray.length;
        for (var i = 0; i < length; i++) {
            var invalidKey = invalidKeyArray[i];
            delete config[invalidKey];
        }
        return config;
    },

    /**
     * 判断配置项是否为空的方法
     * @param obj
     * @returns {boolean}
     */
    isCustomEmpty: function (obj) {
        return typeof obj === 'undefined' || obj == null || obj === "";
    },
    /**
     * 静态加载选择框
     * @param $target 选择目标,进行操作的对象
     * @param result 数据
     * @param config 对数据进行解析的配置文件
     */
    staticLoadSelect: function ($target, result, config) {
        var staticLoadSelectConfig = $.extend(true, {}, $.fn.customAjaxSelect.selectPickerDefaults, config || {});
        $target.selectpicker(staticLoadSelectConfig);
        var oldSelect = $target.val();
        var data = config.preprocessData(result);
        $target.empty();
        /*$target.append(
            $("<option></option>").attr(
                "value", "").attr("subtext", "").text(config.locale.emptyTitle)
        );*/
        for (var i = 0; i < data.length; i++) {
            if ($.isCustomEmpty(data[i].data.subtext)) {
                $target.append(
                    $("<option></option>").attr(
                        "value", data[i].value).text(data[i].text)
                );
            } else {
                $target.append(
                    $("<option></option>").attr(
                        "value", data[i].value).text(data[i].text)
                        .attr("data-subtext", data[i].data.subtext)
                );
            }
        }
        $target.selectpicker('val', oldSelect);//默认选中
        $target.selectpicker('refresh');
        $target.on('hidden.bs.select', function () {
            var $data = $target.parents('form').data('bootstrapValidator');
            if (typeof $data !== 'undefined') {
                var name = $target.attr('name');
                $data.updateStatus(name, 'NOT_VALIDATED', null).validateField(name);
            }
        });
    }

});
$(function () {
    //初始化
    //全异步查询
    var $customAjaxSelect = $(".customAjaxSelect");
    $customAjaxSelect.each(function () {
        var $target = $(this);
        var htmlConfig = $.initHtmlConfig($target);
        if (!$.isCustomEmpty(htmlConfig['ajax']['url'])) {
            $target.customAjaxSelect(htmlConfig);

        }
    });
    //全一次查询
    var $onceLoadSelect = $(".customAjaxSelect-onceLoad");
    $onceLoadSelect.each(function () {
        var $target = $(this);
        var htmlConfig = $.initHtmlConfig($target);
        if (!$.isCustomEmpty(htmlConfig['ajax']['url'])) {
            $target.customAjaxSelect('onceLoad', htmlConfig);

        }
    });
    //全静态查询
    var $staticLoadSelect = $(".customAjaxSelect-staticLoad");
    $staticLoadSelect.each(function () {
        var $target = $(this);
        //必要数据
        var selectedVla = $target.val();
        var htmlConfig = $.initHtmlConfig($target);
        var optionHtml = $target.html();
        //清空,重构selectPicker
        $target.empty();
        var config = $.extend(true, {}, $.fn.customAjaxSelect.selectPickerDefaults, htmlConfig || {});
        $target.selectpicker(config);
        $target.append(optionHtml);
        //默认值
        $(this).selectpicker('val', selectedVla);
        //刷新属性
        $target.selectpicker('refresh');
        $target.selectpicker('render');
        //validator
        $target.on('hidden.bs.select', function () {
            var $data = $target.parents('form').data('bootstrapValidator');
            if (typeof $data !== 'undefined') {
                var name = $target.attr('name');
                $data.updateStatus(name, 'NOT_VALIDATED', null).validateField(name);
            }
        });
        //width
        if (htmlConfig.display.width) {
            var $staticLoad = $(".customAjaxSelect-staticLoad");
            var $staticLoadButton = $staticLoad.find("button");
            $staticLoadButton.css("width", htmlConfig.display.width);
        }
    });
});