// 51la统计脚本
(function() {
    // 创建并加载51la统计脚本
    var la_script = document.createElement('script');
    la_script.charset = "UTF-8";
    la_script.id = "LA_COLLECT";
    la_script.src = "//sdk.51.la/js-sdk-pro.min.js";
    document.head.appendChild(la_script);
    
    // 初始化51la统计
    la_script.onload = function() {
      LA.init({id:"3MFYKYISU9qVaNEC",ck:"3MFYKYISU9qVaNEC",autoTrack:true});
    };
  }
)();