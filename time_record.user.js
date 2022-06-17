// ==UserScript==
// @name         时长计算
// @namespace    https://github.com/giceli/test
// @version      2.0
// @description  just for fun
// @author       ABin
// @match        https://oa.hygon.cn/hr/HGWebCalen.nsf/index.html?open
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @run-at       document-body
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// @grant        GM_info
// @grant        GM_registerMenuCommand
// @grant        GM_cookie
// @updateURL    https://raw.githubusercontent.com/giceli/test/main/time_record.user.js
// ==/UserScript==

(function() {
    'use strict';
    // Your code here...
    let body = document.getElementsByTagName('body')[0]
    let floatdiv = document.createElement("div");
    floatdiv.innerText = "show";
    floatdiv.style.backgroundColor='#ecf1f6';
    floatdiv.style.position='absolute';
    floatdiv.style.top="100px";
    floatdiv.style.left="100px";
    floatdiv.style.width="50px";
    floatdiv.style.height="50px";
    floatdiv.style.textAlign="center"
    floatdiv.style.lineHeight="50px"
    floatdiv.style.border="1px solid #666"
    floatdiv.style.borderRadius="25px"
    body.appendChild(floatdiv);

    let floatdiv2 = document.createElement("div");
    floatdiv2.style.backgroundColor='#ecf1f6';
    floatdiv2.style.position='absolute';
    floatdiv2.style.top="100px";
    floatdiv2.style.left="180px";
    floatdiv2.style.border="1px solid #666"
    floatdiv2.style.display = 'none'
    body.appendChild(floatdiv2)

    floatdiv.onclick = function(){
        if(floatdiv2.style.display == 'none'){
            floatdiv.innerText = "hide";
            floatdiv2.appendChild(show())
            floatdiv2.style.display = 'block'
        } else {
            floatdiv.innerText = "show";
            floatdiv2.innerHTML=''
            floatdiv2.style.display = 'none'
        }
    }

    let btn = document.getElementsByClassName("btn-group");
    let i = 0
    for(i = 0;i < btn.length; i ++){
        btn[0].onclick = function (){
            if(floatdiv2.style.display == 'block'){
                floatdiv2.innerHTML=''
                let table = show()
                floatdiv2.appendChild(table)
            }
        }
    }
    // show()
})();

function addTr(index,tick,work_time,work_out,work_result,week = false){
    let tr = document.createElement("tr");
    let td0 = document.createElement("td");
    let td1 = document.createElement("td");
    let td2 = document.createElement("td");
    let td3 = document.createElement("td");
    let td4 = document.createElement("td");
    tr.appendChild(td0)
    tr.appendChild(td1)
    tr.appendChild(td2)
    tr.appendChild(td3)
    tr.appendChild(td4)
    td0.innerHTML = "&nbsp&nbsp&nbsp&nbsp"+index
    td1.innerHTML = tick
    td2.innerHTML = work_time
    td3.innerHTML = work_out
    td4.innerHTML = work_result

    td0.style.fontSize="20px"
    td1.style.fontSize="20px"
    td2.style.fontSize="20px"
    td3.style.fontSize="20px"
    td4.style.fontSize="20px"
    td0.style.lineHeight="28px"
    td1.style.lineHeight="28px"
    td2.style.lineHeight="28px"
    td3.style.lineHeight="28px"
    td4.style.lineHeight="28px"
    if(week){
        td0.style.backgroundColor="#fff";
        td1.style.backgroundColor="#fff";
        td2.style.backgroundColor="#fff";
        td3.style.backgroundColor="#fff";
        td4.style.backgroundColor="#fff";
    }
    return tr
}

function calculate(week,tick_start, tick_end){
    let work_time = 0
    let work_out = 0
    let work_out_result = 0
    if(week){
        // 假期
        work_out = ((tick_end - tick_start)/60).toFixed(2)
        work_time = work_out
        if(work_out < 4){
            work_out_result = 0
        } else {
            work_out_result = Math.floor(work_out*2)/2
        }
    } else {
        // 工作日
        work_time = ((tick_end - tick_start)/60).toFixed(2)
        work_out = (work_time > 9 ? work_time - 9 : 0).toFixed(2)
        if(work_out < 2){
            work_out_result = 0
        } else {
            work_out_result = Math.floor(work_out*2)/2
        }
    }
    return [work_time,work_out,work_out_result]
}

function show(){
    let d = new Date();
    let mon_now = d.getMonth() + 1
    let day_now = d.getDate()
    let year_now = d.getFullYear()
    let hour_now = d.getHours()
    let minute_now = d.getMinutes()

    // 对于休息日工作，或该休息日不算为加班
    let work_mon = [[],[29,30],[5,6,12,13],[],[2,24],[7],[],[],[],[],[8,9],[],[]];
    // 对于工作日为休息,或该工作日算入加班
    let holiday_mon = [[],[3,31],[],[],[4,5],[2,3,4],[3],[],[],[],[3,4,5,6,7],[],[]]
    let mon = document.getElementsByTagName('h3')[0].innerHTML;
    let year = Number(mon.substring(0,4))
    mon = Number(mon.substring(6,mon.length-1))

    let work_out_total = 0;
    let work_out_total2 = 0;
    let work_total = 0;
    let start = 1
    let calendar = document.getElementById('calendar')
    let monthBox = calendar.children[1]
    let rows = monthBox.children
    let r = 0;

    let table = document.createElement("table");
    table.appendChild(addTr("day","tick","工时","加班","取整"))
    for(r = 0;r < rows.length;r++){
        let days = rows[r].children
        let d = 0;
        for(d = 0; d < days.length; d++){
            let day = days[d].children[0]
            let event = day.children

            let index = Number(event[0].innerHTML)
            if(index == start){
                if (year >= year_now){
                    if(mon == mon_now && start > day_now){
                        break;
                    } else if(mon > mon_now){
                        break;
                    }
                }
                start += 1;
                let noworkforce = (work_mon[mon].indexOf(index) == -1)
                let workholiday = (holiday_mon[mon].indexOf(index) != -1)
                let week =((noworkforce && (d ==0 || d == 6) ) || workholiday)
                if(event.length > 1){
                    let tick = event[1].children[0].innerHTML
                    let work_time = ''
                    let work_out = ''
                    let work_out_result = ''
                    let tick_index = tick.search(/-/i)
                    if(tick_index == 1 || tick_index == -1){
                        // the day you not come
                        tick = ''
                    } else {
                        if(start-1 == day_now && mon == mon_now ){
                            tick = tick.substring(0,tick_index + 2) + hour_now+":"+minute_now
                        }
                        let tick_start = tick.substring(0,tick_index).replace(/(^\s*)|(\s*$)/g, "")
                        let tick_end = tick.substring(tick_index+2,tick.length).replace(/(^\s*)|(\s*$)/g, "")
                        if(tick_end.length != 5){
                            tick_end = tick_end.substring(0,5)
                            tick = tick.substring(0,13)
                            // somethine different, such as 早退，旷工，未打卡申诉...
                        }

                        tick_start = Number(tick_start.substring(0,2)) * 60 + Number(tick_start.substring(3,5));
                        tick_end = Number(tick_end.substring(0,2)) * 60 + Number(tick_end.substring(3,5))

                        let result = calculate(week,tick_start,tick_end)
                        work_time = result[0]
                        work_out = result[1]
                        work_out_result = result[2]
                        work_total += Number(work_time)

                        work_out_total += work_out_result
                        if (Number(work_out) >= 2){
                            work_out_total2 += Number(work_out)
                        }
                        work_out_result = '['+ work_out_result +']'
                    }
                    table.appendChild(addTr(index,tick,work_time,work_out,work_out_result,week))

                } else {
                    table.appendChild(addTr(index,'','','','',week))
                }
            }
        }
    }
    table.appendChild(addTr('-------','-------------------------','--------------','--------','--------'))
    table.appendChild(addTr('total',':',work_total.toFixed(2),work_out_total2.toFixed(2),work_out_total))
    return table
}
