document.addEventListener("DOMContentLoaded", (function() {
    if (!getCookie("agreementAccepted")) {
        const referrer = document.referrer ? new URL(document.referrer).hostname : "直接访问";
        
        swal({
            title: "欢迎来到 ByteWyrm <(￣︶￣)↗[GO!]",
            content: {
                element: "div",
                attributes: {
                    innerHTML: `
                        <img src='/img/static/avatar.jpg' alt='自定义图标' 
                            style='width:100px; height:auto; border-radius: 50%; 
                            display: block; margin: 0 auto;' /><br />
                        您来自: ${referrer}<br />
                        请您在继续浏览本站之前，仔细阅读以下协议：<br /><br />
                        1. <a href='/privacy/' title='隐私政策' data-pjax-state=''>隐私政策</a>&nbsp;&nbsp;
                        2. <a href='/disclaimer/' title='免责声明' data-pjax-state=''>免责声明</a>&nbsp;&nbsp;<br />
                        3. <a href='/copyright/' title='版权协议' data-pjax-state=''>版权协议</a>&nbsp;&nbsp;
                        4. <a href='/comment/' title='评论协议' data-pjax-state=''>评论协议</a>&nbsp;&nbsp; 
                        5. <a href='/cookies/' title='Cookies' data-pjax-state=''>Cookies</a>&nbsp;&nbsp;<br /><br />
                        点击“同意”表示您已阅读并同意遵守以上协议。
                    `
                }
            },
            buttons: {
                cancel: "不同意",
                confirm: "同意"
            },
            text: "若未获取新内容请清浏览器缓存。"
        }).then(willProceed => {
            willProceed ? setCookie("agreementAccepted", "true", 30) :
            window.history.length > 1 ? window.history.back() :
            window.location.href = "https://blog.devnest.top/";// 替换为希望重定向的 URL
        });
    }

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + 24 * days * 60 * 60 * 1000); //添加30天的cookie
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(";");

        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (" " === c.charAt(0)) c = c.substring(1, c.length);
            if (0 === c.indexOf(nameEQ)) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
}));
