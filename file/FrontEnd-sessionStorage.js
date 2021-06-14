
const windowSessionStorage = {
  /**
   * 存储localStorage
   */
  setStore: (name, content) => {
    if (!name) return;
    if (typeof content !== 'string') {
      content = JSON.stringify(content);
    }
    window.sessionStorage.setItem(name, content);
  },
  /**
   * 获取localStorage
   */
  getStore: (name) => {
    if (!name) return;
    return window.sessionStorage.getItem(name);
  },
  /**
   * 清除localStorage
   */
  clearStore: () => {
    window.localStorage.clear();
  },

  getQueryStringByName: function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    var context = "";
    if (r != null)
      context = r[2];
    reg = null;
    r = null;
    return context === null || context === "" || context === "undefined" ? "" : context;
  }

}

export default windowSessionStorage;
