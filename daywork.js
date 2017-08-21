/**
 * 日期格式化
 * @param fmt
 * @returns {*}
 * @constructor
 * // var time1 = new Date().Format("yyyy-MM-dd");
 // var time2 = new Date().Format("yyyy-MM-dd HH:mm:ss");
 */
Date.prototype.Format = function(fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


/**
 * 数据定义
 * @type {{weekOrMonthFlag: string, monthData: Array}}
 */
var dayWork = {
    weekOrMonthFlag: 'month', //日期模式还是月份模式
    monthData: [],
    /*
  表格上该月的数据 数据格式为{ time: new Date(),theDayWork: [{

  "name": "UED晨会",
  "time": "2017-08-15 08:06",
  "participants": [
    "赵铁柱",
    "张圣"
  ],
  "address": "金中环大厦16楼"
}]}
*/
    showMonth: new Date(), //展示的是哪个月,精确到月份  客户端实时时间
    selectedDay: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), //当前选中哪一天，精确到天
};

var dayWorkFuntion = {
    /**
     * 点击年月 进行切换
     */
    changeWeekOrMonth: function(option) {
        dayWork.weekOrMonthFlag = option;

        dayWorkFuntion.binding();
    },
    /**
     * 点击选着日期
     */
    selectDay: function(event) {
        var divs = $('.daywork-conter tbody div');
        for (var i = 0; i < divs.length; i++) {
            if (divs[i] === event.target) {
                dayWork.selectedDay = dayWork.monthData[i].time;
                break;
            }
        }
        dayWorkFuntion.binding();

    },
    /**
     * 回到今天
     */
    gotoToday: function(event) {
        dayWork.selectedDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()); //当前选中哪一天，精确到天
        dayWork.showMonth = new Date();
        dayWorkFuntion.initThisMonth();

    },
    /**
     * 改变月份
     * @param num
     */
    changeMonth: function(num) {

        dayWork.showMonth = new Date(dayWork.showMonth.getFullYear(), dayWork.showMonth.getMonth() + num, 1);
        if (dayWork.showMonth.getFullYear() != dayWork.selectedDay.getFullYear() || dayWork.showMonth.getMonth() != dayWork.selectedDay.getMonth()) {

            dayWork.selectedDay = new Date(dayWork.showMonth.getFullYear(), dayWork.showMonth.getMonth(), 1);

        }
        dayWorkFuntion.initThisMonth();

    },

    /**
     * 改变周
     * @param num
     */
    changeWeek: function(num) {
        dayWork.selectedDay = new Date(dayWork.selectedDay.getFullYear(), dayWork.selectedDay.getMonth(), dayWork.selectedDay.getDate() - dayWork.selectedDay.getDay() + 7 * num);
        dayWork.showMonth = new Date(dayWork.selectedDay.getFullYear(), dayWork.selectedDay.getMonth(), 1);

        dayWorkFuntion.initThisMonth();
    },

    /**
     * 新增日程
     */
    addDayWork: function() {
        $.get('./addWork.html', function(res) {
            dayWorkFuntion.addWorkDiv = layer.open({
                type: 1,
                title: '新增日程',

                area: ['700px', '350px'], //宽高
                content: res
            });
        })
    },
    /**
     * 关闭新增日程
     */
    closeAddDayWorkDiv: function() {
        layer.close(dayWorkFuntion.addWorkDiv);
    },

    /**
     * 初始化的月份
     * @param inDay
     */
    initThisMonth: function() {
        dayWork.monthData = [];
        //客户端的实时日期时间
        var inDay = dayWork.showMonth;
        console.log(inDay);

        //获取第一个一个月的第一天是星期几
        var weekDay = new Date(inDay.getFullYear(), inDay.getMonth(), 1).getDay();
        console.log(weekDay); //2

        for (var i = 0 - weekDay + 1; i < 42 - weekDay + 1; i++) {
            console.log(inDay.getMonth()) // 8
                //显示在日历区域的全部时间 通过 Date转化过的
            var theDay = new Date(inDay.getFullYear(), inDay.getMonth(), i);
            //循环得到这个月的每天的日期 theDay
            console.log(theDay);

            dayWork.monthData.push({
                time: theDay,

                theDayWork: []
            });

        }
        console.log(dayWork.monthData); //数组里存着每个对象  

        //发送请求，获取日程信息  日程信息的接口
        $.get("./dayWork.json", function(res, status) {
            //状态为s 并且data数据是存在的
            if (res.status == 's' && res.data) {
                //循环日程信息的数据 调用map办法
                //rowRes是值res.data中的每个对象
                res.data.map(function(rowRes) {
                    //循环日历数据
                    dayWork.monthData.map(function(rowMonth) {
                        //截取rowRes.time中的0到10 位置的元素,是指time中的日期部分，返回新数组 == 格式化后的日期模式
                        //这里rowMonth形参应该是dayWork.monthData数据中的每个对象
                        if (rowRes.time.slice(0, 10) == rowMonth.time.Format("yyyy-MM-dd")) {
                            //有日程的日期  循环到的那个对象
                            rowMonth.theDayWork.push(rowRes);
                        }
                    })

                })
            }
            //渲染数据到页面上
            dayWorkFuntion.binding();
        });

    },
    //绑定数据到页面上进行渲染 
    binding: function() {


        /**
         * 年月切换绑定，所需要绑定的dom   就是点击周获取月的时候切换页面
         */
        (function bindWeekOrMonthFlag() {
            if (dayWork.weekOrMonthFlag == 'week') {

                $('.daywork-conter').attr('data-model', 'week');
                $('.daywork-conter [data-month-flag]').removeClass("btn-danger");
                $('.daywork-conter [data-week-flag]').addClass("btn-danger");
            } else {
                $('.daywork-conter').attr('data-model', 'month');
                $('.daywork-conter [data-month-flag]').addClass("btn-danger");
                $('.daywork-conter [data-week-flag]').removeClass("btn-danger");
            }
        })();


        /**
         * 绑定dayWork.monthData里面的数据到dom
         * 已经是选中这个月的第一天和第一个星期的数据
         */
        (function bindMonthData() {
            //设置月份头
            var mes = dayWork.showMonth.getFullYear() + '年' + (dayWork.showMonth.getMonth() + 1) + '月';
            console.log(mes); //2017年8月
            $('.daywork-conter [data-month-head]').html(mes);
            //设置星期头
            var weekFirstDay = new Date(dayWork.selectedDay.getFullYear(), dayWork.selectedDay.getMonth(), dayWork.selectedDay.getDate() - dayWork.selectedDay.getDay());

            //测试代码
            console.log(weekFirstDay); //2017.8.13
            console.log(dayWork.selectedDay.getDate() - dayWork.selectedDay.getDay()); //13  所以无论如何都会是星期天的时间
            console.log(dayWork.selectedDay.getDay()); //5  今天是星期几
            console.log(dayWork.selectedDay.getDate()); //18 今天的时间（几号）

            //设置星期尾
            var weekLastDay = new Date(weekFirstDay.getFullYear(), weekFirstDay.getMonth(), weekFirstDay.getDate() + 6);

            //测试代码
            console.log(weekFirstDay.getDate() + 6) //19 星期天13 加上6刚好是星期六的时间

            //周里面 标题头一周的完整时间
            console.log(weekFirstDay.getMonth()); //7  因为月是0~11
            var mesWeek = weekFirstDay.getFullYear() + '年' + (weekFirstDay.getMonth() + 1) + '月' +
                weekFirstDay.getDate() + '日 ~ ' +
                weekLastDay.getFullYear() + '年' + (weekLastDay.getMonth() + 1) + '月' +
                weekLastDay.getDate() + '日 ';
            $('.daywork-conter [data-week-head]').html(mesWeek);

            //绑定日历
            var all = '';
            for (var i = 0; i < 6; i++) {
                var allTd = '';
                var hasSelected = null;
                for (var h = 0; h < 7; h++) {
                    //该序号的日期时间数据 存储time theDayWork日程信息的数据
                    var theDay = dayWork.monthData[i * 7 + h];

                    var date = theDay.time.getDate(); //多少号
                    //存储有日程安排的日期的数组 如果有长度的话 就是有日程
                    var clazz = theDay.theDayWork.length ? " had " : ""; //是否有日程  had 空
                    // console.log(clazz);


                    var isToday = theDay.time.toString() == new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toString(); //布尔  true或者false
                    // console.log(isToday); //false ...true...false
                    clazz += isToday ? " today " : ""; //是否是今天   clazz == clazz + isToday吗   等于的话clazz = today,否则是空
                    console.log(clazz); //这时候的clazz已经是等于之前的clazz + idToday的值了

                    //循环到的数据月份 是否 等于客户端实时的月份
                    var isThisMonth = theDay.time.getMonth() == dayWork.showMonth.getMonth();
                    clazz += isThisMonth ? "  " : " no-this-month "; //是否属于选择月份
                    //判断选中的日期和循环到的数据日期是否相同
                    var isSelected = theDay.time.toString() == dayWork.selectedDay.toString();
                    if (isSelected) {
                        hasSelected = true
                    }
                    //clazz = clazz + isSelected
                    clazz += isSelected ? " selected " : ""; //是否选中该日期

                    allTd += '<td> <div class="' + clazz + '">' + date + '</div></td>';

                }
                //一行为选中，以便切换为周视图保留一行
                //现在是已经一行里面的所有节点已经渲染完毕 开始渲染一行数据
                if (!hasSelected) {
                    var tr = '<tr>{{}}</tr>';
                } else {

                    var tr = '<tr class="picking">{{}}</tr>';
                }
                //将所循环到的allTd替换到tr中
                all += tr.replace("{{}}", allTd);
            }
            $('.daywork-conter tbody').html(all);


        })();

        //绑定日程列表
        (function bindingUl() {
            if (dayWork.selectedDay == null) {
                return;
            }

            var mes = '日程列表(' + (dayWork.selectedDay.getMonth() + 1) + '月' + dayWork.selectedDay.getDate() + '日)';

            $('.daywork-conter [data-day-head]').html(mes);

            var all = '';
            for (var i = 0; i < dayWork.monthData.length; i++) {
                var row = dayWork.monthData[i];

                if (row.time.toString() == dayWork.selectedDay.toString()) {
                    row.theDayWork.map(function(rowWork) {
                        var joinUsers = rowWork.participants.join(", ");
                        var time = rowWork.time.slice(10, 16) + '  ' + (rowWork.time.slice(10, 12) < 12 ? 'am' : 'pm');

                        all += '<li> <div><b>' + rowWork.name + '</b>' +
                            '  <span tabindex="0" class="right-btn glyphicon glyphicon-user" role="button"\n' +
                            '                data-toggle="popover" data-trigger="focus hover " data-html="true"    data-placement="left"\n' +
                            '                data-content=" <div style=\'min-width:170px;color: #A9A9A9\'><b>参与人员：</b></div>' + joinUsers + '"></span></div>' +
                            ' <div class="mes"><span><i class="glyphicon glyphicon-time icon-left"></i>' + time + '</span>' +
                            ' <span class="right-btn"> <i class="glyphicon glyphicon-map-marker icon-left"></i>' + rowWork.address + '</span></div></li>'
                    })
                    break;
                }

            }
            if (all == '') {
                all = '  <div class="text-center" style="color:#A9A9A9 ;margin-top: 150px">\n' +
                    '        <div><i class="glyphicon glyphicon-time" style="font-size: 70px;margin-bottom: 20px"></i></div>\n' +
                    '        <div>这一天没有安排哦 ^_^</div>\n' +
                    '      </div>'
            }


            $('.daywork-conter .work-list').html(all);

            //激活人员弹出框
            $(function() {
                $('.daywork-conter [data-toggle="popover"]').popover()
            })
        })();


    }


}


dayWorkFuntion.initThisMonth();
dayWorkFuntion.binding();