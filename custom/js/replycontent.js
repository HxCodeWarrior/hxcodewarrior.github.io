(function() {
    let walineContainer = null;
    let observer = null;

    const initWalineReply = () => {
        // 移除旧的事件监听器
        if (walineContainer) {
            walineContainer.removeEventListener('click', handleClick);
        }

        // 获取新的评论容器
        walineContainer = document.getElementById('waline-wrap');
        
        if (!walineContainer) {
            return; // 如果没有找到容器则退出
        }

        // 添加点击事件监听器
        walineContainer.addEventListener('click', handleClick, { passive: true });

        // 如果旧观察者存在，则断开连接
        if (observer) {
            observer.disconnect();
        }

        // 创建新的 MutationObserver 实例并开始观察
        observer = new MutationObserver(() => {
            // 在 DOM 变化时重新初始化
            initWalineReply();
        });

        observer.observe(walineContainer, {
            childList: true,
            subtree: true
        });
    };

    const handleClick = (e) => {
        const replyBtn = e.target.closest('button.wl-reply');
        if (!replyBtn || walineContainer.dataset.pjaxLoading === 'true') return;

        // 精准定位当前评论内容
        const commentItem = replyBtn.closest('.wl-card-item');
        const contentNode = commentItem.querySelector('.wl-card > .wl-content');

        if (!contentNode) {
            return;
        }

        // 沙盒处理（保留链接结构）
        const sandbox = contentNode.cloneNode(true);
        
        // 移除干扰元素
        sandbox.querySelectorAll(
            'span, .wl-meta, svg, img, .wl-quote, blockquote, a[href^="#"], pre'
        ).forEach(n => n.remove());

        // 转换普通链接为Markdown格式（保留非锚点链接）
        sandbox.querySelectorAll('a:not([href^="#"])').forEach(a => {
            const text = a.textContent.trim();
            const href = a.getAttribute('href') || '';
            a.replaceWith(`[${text}](${href})`);
        });

        // 提取纯净文本（增加过滤@符号）
        const pureText = sandbox.textContent
            .replace(/@\S+/g, '')               // 新增@提及过滤
            .replace(/\n{3,}/g, '\n\n')
            .trim()
            .substring(0, 500);

        // 获取编辑器实例
        const editor = walineContainer.querySelector('.wl-editor');
        if (!editor) {
            return;
        }

        // 执行插入
        insertEditorContent(editor, pureText);
    };

    // 通用插入方法（支持Markdown）
    const insertEditorContent = (editor, text) => {
        const insertText = `> ${text}\n\n`;
        const inputEvent = new Event('input', { bubbles: true });

        if (editor.tagName === 'TEXTAREA' || editor.tagName === 'INPUT') {
            // 原生文本域处理
            const start = editor.selectionStart;
            editor.value = 
                editor.value.slice(0, start) + 
                insertText + 
                editor.value.slice(editor.selectionEnd);
            editor.selectionEnd = start + insertText.length;
        } else if (editor.isContentEditable) {
            // 富文本编辑器处理
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(editor);
            range.collapse(false); // 光标移到最后
            range.insertNode(document.createTextNode(insertText));
            selection.removeAllRanges();
            selection.addRange(range);
        }

        editor.dispatchEvent(inputEvent);
        editor.focus();
    };

    // 初始化及事件监听
    document.addEventListener('pjax:complete', initWalineReply);
    initWalineReply(); // 初次调用以进行初始化
})();
