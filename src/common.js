//import 'es6-promise'
import axios from 'axios'
import store from './redux/store.js';
import { Toast } from 'antd-mobile';

//引入定义的action
import { user } from './actions/plan.js'
axios.defaults.baseURL = 'http://192.168.5.184:8019';
//axios.defaults.baseURL = 'https://api.91war.com';
if(localStorage.t){
	//登录成功后，在加头信息，不认取的有误
	axios.defaults.headers.common['Authorization'] = localStorage.t;
}
if(localStorage.userinfo){
   store.dispatch(user(JSON.parse(localStorage.userinfo)));
}
var Common = {
    CURRECY:[require('./images/gold.png'),require('./images/diamond.png'),require('./images/crystal.png'),require('./images/ticket.png')],
    IMG_DEFAULT : "http://oslg9bt6h.bkt.clouddn.com/default-img1.png",
	//公共get请求函数
    /*get (obj){
    	return new Promise((resolve, reject)=>{
            fetch(Common.baseUrl+obj.url, {
			    method: 'GET'
			}).then((res)=>{
				console.log(1);
				console.log(res);
				return res.text()
			}).then((res)=>{
				console.log(2);
				console.log(res);
			    resolve(res);
			}).catch(error=>{
                console.log(3);
				console.log(error)
				if (error.response) {
                    // 请求已发出，但服务器响应的状态码不在 2xx 范围内
                    if(error.response.data.info){
                        if(obj.popupInfo == false){ //我使用弹框显示错误信息
                            reject(error.response);
                        }else{
                            Common.errMessage(error.response.data.info);
                        }
                    }
                }
			})
        });
    }*/
    get(obj){
    	return new Promise((resolve, reject)=>{
            axios.get(obj.url,{
                    params: obj.data
                }).then(
                respose=>{
                    //成功后显示列表
                    if(!respose.data.code){
                        resolve(respose.data.data);
                    }
                }
            ).catch(
                error=>{
                    Common.error(error,obj,reject);
                }
            );
        });
    },
    //公共post请求函数
    post(obj){
        return new Promise((resolve, reject) =>{
            axios.post(obj.url,obj.data).then(
                respose=>{
                    //成功后显示列表
                    if(!respose.data.code){
                        resolve(respose.data.data);
                    }
                }
            ).catch(
                error=>{
                    Common.error(error,obj,reject);
                }
            );
        })
    },
    error(error,obj,reject){
        if (error.response) {
            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
            if(error.response.status === 401){
                console.log("进入登录界面");
            }else{
                if(error.response.data.info){
                    if(obj.popupInfo === false){
                        reject(error.response);
                    }else{
                        Toast.fail(error.response.data.info, 2)
                    }
                }
            }
        }
    },
    success(info){
        Toast.success(info, 2)
    },
    fail(info){
        Toast.fail(info, 2)
    },
    getUserInfo(callback) {
        return new Promise((resolve, reject)=>{
            Common.get({
                url:"/api/user/userinfo"
            }).then(respose=>{
                localStorage.userinfo = JSON.stringify(respose);
                store.dispatch(user(respose));
                resolve()
            })
        }) 
    },
    formatDate(value,format) {
        if(value){
            if(value.toString().length === 10){
                value = value*1000
            }
            var dateObj = new Date(value);
            var date = {
                  "Y+": dateObj.getYear(),
                  "M+": dateObj.getMonth() + 1,
                  "d+": dateObj.getDate(),
                  "h+": dateObj.getHours(),
                  "m+": dateObj.getMinutes(),
                  "s+": dateObj.getSeconds(),
                  "q+": Math.floor((dateObj.getMonth() + 3) / 3),
                  "S+": dateObj.getMilliseconds()
            };
            if (/(y+)/i.test(format)) {
                format = format.replace(RegExp.$1, (dateObj.getFullYear() + '').substr(4 - RegExp.$1.length));
            }
            for (let k in date) {
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length === 1? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
                }
           }
           return format;
        }
    },
    formatNumber(number) {
        if(number>10000){
            //Missing radix parameter  radix解决这个警告 严格模式需要
            return (parseInt(number,10)/10000).toFixed(2)+"万";
        }else{
            return number;
        } 
    }
}

export default Common