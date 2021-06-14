//1.安装Cookies模块 npm i js-Cookies
//2.在组件中导入Cookies import Cookiess from 'js-Cookies'
//3.Cookies的操作:
// 存字符串：Cookies.set('name', 'value')
// 取字符串：Cookies.get('name')
// 存json对象: Cookies.set('person', { 'name': 'Jack', 'age': '18' })
// 取json对象: Cookies.getJson('person')
// 删除对象: Cookies.remove('name')
import Cookiess from 'js-Cookies';

function Cookies() {
  // Cookies.set('name', 'value');
  // Cookiess.get('name');
  // Cookiess.getJson('person');
  // Cookiess.remove('name');
}

/**
 * 存储Cookies
 */
const setCookies = (name, value) => {
  var Days = 10;
  var exp = new Date();
  exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
  Cookiess.set('name', 'value');
}

/**
 * 获取Cookies
 */
const getCookies = (name) => {
  var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  if (arr = document.Cookies.match(reg))
    return unescape(arr[2]);
  else
    return null;
}

/**
 * 删除Cookies
 */
const delCookies = (name) => {
  var exp = new Date();
  exp.setTime(exp.getTime() - 1);
  var cval = getCookies(name);
  if (cval != null)
    document.Cookies = name + "=" + cval + ";expires=" + exp.toGMTString() + ";path=/;";
} 