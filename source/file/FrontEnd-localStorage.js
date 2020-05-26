
const windowLocalStorage = {
  /**
   * 存储localStorage
   */
  setStore: (name, content) => {
    if (!name) return;
    if (typeof content !== 'string') {
      content = JSON.stringify(content);
    }
    Window.localStorage.setItem(name, content);
  },
  /**
   * 获取localStorage
   */
  getStore: (name) => {
    if (!name) return;
    return Window.localStorage.getItem(name);
  },
  /**
   * 清除localStorage
   */
  clearStore: () => {
    Window.localStorage.clear();
  },

  getQueryStringByName: function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = Window.location.search.substr(1).match(reg);
    var context = "";
    if (r != null)
      context = r[2];
    reg = null;
    r = null;
    return context == null || context == "" || context == "undefined" ? "" : context;
  }

}

export default windowLocalStorage;
