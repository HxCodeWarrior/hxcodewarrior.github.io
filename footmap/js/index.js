$(function () {
    // 初始化变量
    let visitedRegions = {};
    let regionData = {};
    let regionColors = {};
    let totalVisited = 0;
    let totalHighlighted = 0;

    // 加载配置文件
    $.getJSON('./data/config.json', function (data) {
        // 处理数据，提取已访问区域
        data.forEach(function(item) {
            if (item.visited) {
                // 从经纬度获取省份代码
                const province = getProvinceFromLatLng(item.latLng);
                if (province) {
                    visitedRegions[province] = true;
                    regionData[province] = {
                        name: item.name,
                        desc: item.desc,
                        photos: item.photos,
                        freq: item.freq || 1
                    };
                    // 为每个省份生成唯一的随机颜色
                    regionColors[province] = getUniqueRandomColor(regionColors);
                    totalVisited++;
                    
                    if (item.highlight) {
                        totalHighlighted++;
                    }
                }
            }
        });
        
        // 初始化地图
        initMap(data);
        
        // 更新统计信息
        updateStats(totalVisited, data.length, totalHighlighted);
    });
    
    // 初始化地图函数
    function initMap(data) {
        $('#map').vectorMap({
            map: 'cn_merc_en',
            backgroundColor: '#2c3e50',
            zoomMin: 0.9,
            zoomMax: 20,
            focusOn: {
                x: 0.55,
                y: 2,
                scale: 0.9
            },
            regionStyle: {
                initial: {
                    fill: '#ecf0f1',
                    stroke: '#bdc3c7',
                    "stroke-width": 0.5,
                    "stroke-opacity": 0.8
                },
                hover: {
                    fill: '#bdc3c7',
                    "fill-opacity": 0.8,
                    cursor: 'pointer'
                },
                selected: {
                    fill: '#f1c40f'
                },
                selectedHover: {}
            },
            markerStyle: {
                initial: {
                    fill: '#e74c3c',
                    stroke: '#fff',
                    "stroke-width": 2,
                    r: 8
                },
                hover: {
                    fill: '#c0392b',
                    stroke: '#fff',
                    "stroke-width": 2,
                    cursor: 'pointer',
                    r: 10
                },
                selected: {
                    fill: '#e67e22'
                },
                selectedHover: {}
            },
            markers: [...data],
            series: {
                regions: [{
                    values: visitedRegions,
                    scale: ['#ecf0f1', '#2ecc71'],
                    normalizeFunction: 'polynomial'
                }],
                markers: [{
                    attribute: 'r',
                    scale: [8, 16],
                    values: data.map(function (c) {
                        if (c.freq && Number.isInteger(c.freq)) {
                            if (c.freq > 10) return 10;
                            else if (c.freq < 1) return 1;
                            else return c.freq;
                        } else {
                            return 1;
                        }
                    })
                }]
            },
            onRegionTipShow: function(e, el, code) {
                if (visitedRegions[code]) {
                    const region = regionData[code];
                    let photoHtml = '';
                    
                    if (region.photos && region.photos.length > 0) {
                        photoHtml = `<img src="${region.photos[0]}" class="region-tooltip-image">`;
                    }
                    
                    el.html(
                        `<div class="region-tooltip">
                            <div class="region-tooltip-title">${region.name}</div>
                            ${photoHtml}
                            <div class="region-tooltip-desc">${region.desc || '去过这里'}</div>
                            <div class="region-tooltip-desc">访问次数: ${region.freq || 1}</div>
                        </div>`
                    );
                }
            },
            onRegionOver: function(e, code) {
                if (visitedRegions[code]) {
                    // 使用该区域的随机颜色
                    $(e.target).css('fill', regionColors[code]);
                    $(e.target).css('stroke', darkenColor(regionColors[code]));
                    $(e.target).css('stroke-width', '1.5px');
                }
            },
            onRegionOut: function(e, code) {
                if (visitedRegions[code]) {
                    // 恢复到原来的随机颜色，但透明度降低
                    $(e.target).css('fill', regionColors[code]);
                    $(e.target).css('stroke', darkenColor(regionColors[code]));
                    $(e.target).css('stroke-width', '0.8px');
                } else {
                    // 恢复未访问区域的默认样式
                    $(e.target).css('fill', '#ecf0f1');
                    $(e.target).css('stroke', '#bdc3c7');
                    $(e.target).css('stroke-width', '0.5px');
                }
            },
            onMarkerTipShow: function(event, label, index) {
                label.html(
                    '<div style="padding: 5px; font-size: 14px; color: #fff; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">' +
                    '<strong>' + data[index].name + '</strong>' +
                    (data[index].freq ? '<p style="margin: 0; font-size: 12px;">访问次数: ' + data[index].freq + '</p>' : '') +
                    '</div>'
                );
            },
            onMarkerClick: function(e, code) {
                // 添加点击动画
                $(e.target).animate({
                    r: 14
                }, 200, function() {
                    $(this).animate({
                        r: 10
                    }, 200);
                });
                
                const clickItem = data[code];
                if (clickItem) {
                    // 显示信息栏
                    $('#info_bar').fadeIn(300);
                    
                    // 清除标题容器中的现有内容
                    $('#info_bar_title').empty();
                    
                    // 检查clickItem是否有articleUrl属性
                    if (clickItem.articleUrl) {
                        // 创建新的锚元素并设置其属性
                        var $link = $('<a>', {
                            href: clickItem.articleUrl,
                            text: clickItem.name,
                            target: '', 
                            title: '点击查看详情',
                            style: 'color: #3498db; text-decoration: none; font-weight: bold; transition: all 0.3s ease;'
                        });
                        
                        // 添加悬停效果
                        $link.hover(
                            function() { $(this).css('color', '#2980b9'); },
                            function() { $(this).css('color', '#3498db'); }
                        );
                        
                        // 将链接附加到标题容器
                        $('#info_bar_title').append($link);
                    } else {
                        // 如果没有articleUrl，只设置文本
                        $('#info_bar_title').text(clickItem.name);
                    }

                    // 设置描述文本
                    if (clickItem.desc) {
                        $('#info_bar_desc').hide().text(clickItem.desc).fadeIn(300);
                    } else {
                        $('#info_bar_desc').text("");
                    }

                    // 处理照片
                    var photos = clickItem.photos;
                    if (photos && Array.isArray(photos)) {
                        $('#info_bar_photos').empty();
                        for (let i = 0; i < photos.length; i++) {
                            var p_img = document.createElement("img");
                            p_img.setAttribute('class', 'info_bar_photo');
                            p_img.setAttribute('title', '点击放大');
                            p_img.src = photos[i];
                            
                            // 添加照片容器和动画效果
                            var $container = $('<div>', {
                                class: 'photo-container',
                                style: 'display: inline-block; margin: 5px; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s ease;'
                            }).append(p_img);
                            
                            // 添加悬停效果
                            $container.hover(
                                function() { 
                                    $(this).css({
                                        'transform': 'translateY(-5px)',
                                        'box-shadow': '0 8px 16px rgba(0,0,0,0.2)'
                                    });
                                },
                                function() { 
                                    $(this).css({
                                        'transform': 'translateY(0)',
                                        'box-shadow': '0 4px 8px rgba(0,0,0,0.1)'
                                    });
                                }
                            );
                            
                            // 使用延迟添加照片，创建瀑布流效果
                            setTimeout(function() {
                                $('#info_bar_photos').append($container);
                                $container.hide().fadeIn(300);
                            }, i * 100);
                        }
                    } else {
                        $('#info_bar_photos').empty();
                    }
                    
                    // 关闭按钮效果
                    $('#info_bar_close_btn').off('click').on('click', function(){
                        $('#info_bar').fadeOut(300);
                    }).hover(
                        function() { $(this).css('transform', 'rotate(90deg)'); },
                        function() { $(this).css('transform', 'rotate(0deg)'); }
                    );
                }
            },
            onViewportChange: function() {
                // 为高亮标记添加特殊样式
                data.forEach(function(item, index) {
                    if (item.highlight) {
                        $('.jvectormap-marker').eq(index).addClass('highlight');
                    }
                });
                
                // 样式优化
                $('.jvectormap-zoomin, .jvectormap-zoomout').css({
                    'background-color': '#3498db',
                    'color': 'white',
                    'border-radius': '4px',
                    'box-shadow': '0 2px 5px rgba(0,0,0,0.2)',
                    'transition': 'all 0.3s ease'
                });
            }
        });
        
        // 添加缩放按钮悬停效果
        $('.jvectormap-zoomin, .jvectormap-zoomout').hover(
            function() { 
                $(this).css({
                    'background-color': '#2980b9',
                    'transform': 'scale(1.1)'
                });
            },
            function() { 
                $(this).css({
                    'background-color': '#3498db',
                    'transform': 'scale(1)'
                });
            }
        );
        
        // 为已访问区域应用随机颜色
        setTimeout(function() {
            for (const code in visitedRegions) {
                if (visitedRegions[code]) {
                    const color = regionColors[code];
                    $(`path[data-code="${code}"]`).css('fill', color);
                    $(`path[data-code="${code}"]`).css('stroke', darkenColor(color));
                    $(`path[data-code="${code}"]`).css('stroke-width', '0.8px');
                }
            }
        }, 100);
    }
    
    // 更新统计信息
    function updateStats(visitedCount, totalPlaces, highlightedCount) {
        // 如果页面上没有统计卡片，则创建一个
        if ($('.stats-card').length === 0) {
            const statsCard = $('<div class="stats-card">' +
                '<div class="stats-title">我的足迹统计</div>' +
                '<div class="stats-items">' +
                    '<div class="stats-item">' +
                        '<div class="stats-number" id="visited-count">' + visitedCount + '</div>' +
                        '<div class="stats-label">已去过的地方</div>' +
                    '</div>' +
                    '<div class="stats-item">' +
                        '<div class="stats-number" id="total-places">' + totalPlaces + '</div>' +
                        '<div class="stats-label">标记的地点</div>' +
                    '</div>' +
                    '<div class="stats-item">' +
                        '<div class="stats-number" id="highlight-count">' + highlightedCount + '</div>' +
                        '<div class="stats-label">特别喜欢的地方</div>' +
                    '</div>' +
                '</div>' +
            '</div>');
            
            // 添加到地图下方
            statsCard.insertAfter('#map');
            
            // 添加动画效果
            statsCard.css({
                'opacity': 0,
                'transform': 'translateY(20px)'
            }).animate({
                'opacity': 1,
                'transform': 'translateY(0)'
            }, 800);
        }
    }
    
    // 从经纬度获取省份代码的函数
    function getProvinceFromLatLng(latLng) {
        // 中国各省份的大致经纬度范围
        const provinceMap = [
            { code: 'CN-11', name: '北京', minLng: 115.7, maxLng: 117.4, minLat: 39.4, maxLat: 41.1 },
            { code: 'CN-12', name: '天津', minLng: 116.7, maxLng: 118.3, minLat: 38.5, maxLat: 40.3 },
            { code: 'CN-13', name: '河北', minLng: 113.5, maxLng: 119.8, minLat: 36.0, maxLat: 42.5 },
            { code: 'CN-14', name: '山西', minLng: 110.2, maxLng: 114.5, minLat: 34.6, maxLat: 40.7 },
            { code: 'CN-15', name: '内蒙古', minLng: 97.0, maxLng: 126.0, minLat: 37.4, maxLat: 53.4 },
            { code: 'CN-21', name: '辽宁', minLng: 118.8, maxLng: 125.8, minLat: 38.7, maxLat: 43.5 },
            { code: 'CN-22', name: '吉林', minLng: 121.6, maxLng: 131.3, minLat: 40.8, maxLat: 46.3 },
            { code: 'CN-23', name: '黑龙江', minLng: 121.2, maxLng: 135.1, minLat: 43.4, maxLat: 53.6 },
            { code: 'CN-31', name: '上海', minLng: 120.8, maxLng: 122.0, minLat: 30.7, maxLat: 31.9 },
            { code: 'CN-32', name: '江苏', minLng: 116.3, maxLng: 121.9, minLat: 30.8, maxLat: 35.1 },
            { code: 'CN-33', name: '浙江', minLng: 118.0, maxLng: 123.0, minLat: 27.0, maxLat: 31.2 },
            { code: 'CN-34', name: '安徽', minLng: 114.8, maxLng: 119.6, minLat: 29.4, maxLat: 34.6 },
            { code: 'CN-35', name: '福建', minLng: 115.8, maxLng: 120.7, minLat: 23.5, maxLat: 28.3 },
            { code: 'CN-36', name: '江西', minLng: 113.5, maxLng: 118.5, minLat: 24.5, maxLat: 30.1 },
            { code: 'CN-37', name: '山东', minLng: 114.8, maxLng: 122.7, minLat: 34.4, maxLat: 38.4 },
            { code: 'CN-41', name: '河南', minLng: 110.2, maxLng: 116.7, minLat: 31.4, maxLat: 36.4 },
            { code: 'CN-42', name: '湖北', minLng: 108.0, maxLng: 116.1, minLat: 29.0, maxLat: 33.3 },
            { code: 'CN-43', name: '湖南', minLng: 108.8, maxLng: 114.2, minLat: 24.6, maxLat: 30.2 },
            { code: 'CN-44', name: '广东', minLng: 109.6, maxLng: 117.3, minLat: 20.2, maxLat: 25.5 },
            { code: 'CN-45', name: '广西', minLng: 104.5, maxLng: 112.0, minLat: 21.5, maxLat: 26.4 },
            { code: 'CN-46', name: '海南', minLng: 108.6, maxLng: 111.0, minLat: 18.1, maxLat: 20.1 },
            { code: 'CN-50', name: '重庆', minLng: 105.5, maxLng: 110.0, minLat: 28.1, maxLat: 32.1 },
            { code: 'CN-51', name: '四川', minLng: 97.3, maxLng: 108.5, minLat: 26.0, maxLat: 34.3 },
            { code: 'CN-52', name: '贵州', minLng: 103.6, maxLng: 109.6, minLat: 24.6, maxLat: 29.2 },
            { code: 'CN-53', name: '云南', minLng: 97.5, maxLng: 106.2, minLat: 21.1, maxLat: 29.2 },
            { code: 'CN-54', name: '西藏', minLng: 78.3, maxLng: 99.1, minLat: 27.3, maxLat: 36.5 },
            { code: 'CN-61', name: '陕西', minLng: 105.5, maxLng: 111.2, minLat: 31.7, maxLat: 39.6 },
            { code: 'CN-62', name: '甘肃', minLng: 92.5, maxLng: 108.7, minLat: 32.6, maxLat: 42.8 },
            { code: 'CN-63', name: '青海', minLng: 89.4, maxLng: 103.0, minLat: 31.5, maxLat: 39.2 },
            { code: 'CN-64', name: '宁夏', minLng: 104.3, maxLng: 107.7, minLat: 35.2, maxLat: 39.2 },
            { code: 'CN-65', name: '新疆', minLng: 73.5, maxLng: 96.4, minLat: 34.3, maxLat: 49.5 },
            { code: 'CN-71', name: '台湾', minLng: 119.9, maxLng: 122.0, minLat: 21.9, maxLat: 25.3 },
            { code: 'CN-91', name: '香港', minLng: 113.8, maxLng: 114.5, minLat: 22.1, maxLat: 22.6 },
            { code: 'CN-92', name: '澳门', minLng: 113.5, maxLng: 113.6, minLat: 22.1, maxLat: 22.2 }
        ];

        const lng = latLng[0];
        const lat = latLng[1];

        // 遍历所有省份，检查经纬度是否在范围内
        for (let i = 0; i < provinceMap.length; i++) {
            const province = provinceMap[i];
            if (lng >= province.minLng && lng <= province.maxLng && 
                lat >= province.minLat && lat <= province.maxLat) {
                return province.code;
            }
        }

        // 如果没有匹配到任何省份，尝试使用最近的省份
        let closestProvince = null;
        let minDistance = Infinity;

        provinceMap.forEach(province => {
            // 计算点到省份中心的距离
            const centerLng = (province.minLng + province.maxLng) / 2;
            const centerLat = (province.minLat + province.maxLat) / 2;
            const distance = Math.sqrt(
                Math.pow(lng - centerLng, 2) + 
                Math.pow(lat - centerLat, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                closestProvince = province.code;
            }
        });

        return closestProvince;
    }
 
    // 生成随机颜色函数
    function generateRandomColor() {
        // 生成明亮、饱和的颜色
        const hue = Math.floor(Math.random() * 360); // 随机色相
        const saturation = 70 + Math.floor(Math.random() * 30); // 较高饱和度 (70-100%)
        const lightness = 40 + Math.floor(Math.random() * 20); // 适中亮度 (40-60%)
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    
    // 生成不重复的随机颜色
    function getUniqueRandomColor(existingColors) {
        let newColor;
        let attempts = 0;
        const maxAttempts = 50; // 防止无限循环
        
        do {
            newColor = generateRandomColor();
            attempts++;
            
            // 检查颜色是否足够不同
            let isDifferentEnough = true;
            for (const color of Object.values(existingColors)) {
                // 简单比较字符串是否相同
                if (color === newColor) {
                    isDifferentEnough = false;
                    break;
                }
            }
            
            if (isDifferentEnough || attempts >= maxAttempts) {
                break;
            }
        } while (true);
        
        return newColor;
    }

    // 使颜色变暗的函数（用于边框）
    function darkenColor(color) {
        // 如果是HSL颜色
        if (color.startsWith('hsl')) {
            // 解析HSL值
            const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            if (match) {
                const h = parseInt(match[1]);
                const s = parseInt(match[2]);
                const l = parseInt(match[3]);
                // 降低亮度，使颜色变暗
                const newL = Math.max(l - 15, 0);
                return `hsl(${h}, ${s}%, ${newL}%)`;
            }
        }
        // 如果不是HSL或解析失败，返回原色
        return color;
    }
});