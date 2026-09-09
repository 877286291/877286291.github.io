/**
 * 游戏状态检测（OCR 识别位置、交互选项）
 */
const config = require("./config.js");

const Status = {
    city: "",
    position: [0, 0],
    interact: [],
    energy: 0,
};

/**
 * OCR 识别屏幕区域文字
 * 需要 Auto.js Pro 或安装 OCR 插件
 */
function ocrRegion(region) {
    const scaled = config.scaleRegion(region);
    const img = captureScreen();
    if (!img) return [];

    try {
        // Auto.js Pro 内置 paddle OCR
        if (typeof paddle !== "undefined") {
            const results = paddle.ocr(img, scaled[0], scaled[1], scaled[2], scaled[3]);
            img.recycle();
            return results || [];
        }
        // 兼容 gmlkit OCR
        if (typeof gmlkit !== "undefined") {
            const results = gmlkit.ocr(img, scaled[0], scaled[1], scaled[2], scaled[3]);
            img.recycle();
            return results || [];
        }
        img.recycle();
        log("未找到 OCR 引擎，请安装 Auto.js Pro 或 OCR 插件");
        return [];
    } catch (e) {
        img.recycle();
        log("OCR 异常: " + e);
        return [];
    }
}

/**
 * 从 OCR 结果解析城市与坐标
 * 游戏界面格式通常为 "姑苏 (12,34)" 或分行显示
 */
function parsePosition(ocrResults) {
    if (!ocrResults || ocrResults.length === 0) return false;

    const texts = ocrResults.map(function (r) {
        return (r.text || r.label || "").trim();
    }).filter(function (t) { return t.length > 0; });

    const combined = texts.join(" ");
    log("OCR 位置文本: " + combined);

    // 匹配 "城市名" + "x,y" 或 "x.y"
    const coordMatch = combined.match(/(\d+)\s*[,.，、]\s*(\d+)/);
    if (!coordMatch) return false;

    const x = parseInt(coordMatch[1]);
    const y = parseInt(coordMatch[2]);

    // 城市名：坐标前的中文部分
    let city = "";
    const cityMatch = combined.match(/([\u4e00-\u9fa5]+)/g);
    if (cityMatch) {
        // 取最长的中文串作为城市名（排除"坐标"等）
        city = cityMatch.sort(function (a, b) { return b.length - a.length; })[0];
        // 过滤掉纯数字误识别
        if (/^\d+$/.test(city)) city = "";
    }

    Status.position = [x, y];
    if (city) Status.city = city;
    return true;
}

/**
 * 解析交互选项列表
 */
function parseInteract(ocrResults) {
    Status.interact = [];
    if (!ocrResults) return;
    ocrResults.forEach(function (r) {
        const text = (r.text || r.label || "").trim();
        if (text.length > 0) Status.interact.push(text);
    });
}

/**
 * 更新当前位置（带重试）
 */
Status.updatePosition = function (maxRetry) {
    maxRetry = maxRetry || 5;
    for (let i = 0; i < maxRetry; i++) {
        const results = ocrRegion(config.OCR_REGIONS.position);
        if (parsePosition(results)) {
            log("当前位置: " + Status.city + " (" + Status.position[0] + "," + Status.position[1] + ")");
            return true;
        }
        sleep(config.DELAY.ocrRetry);
    }
    log("位置识别失败");
    return false;
};

/**
 * 更新交互选项
 */
Status.updateInteract = function () {
    const results = ocrRegion(config.OCR_REGIONS.interact);
    parseInteract(results);
    log("交互选项: " + Status.interact.join(", "));
    return Status.interact;
};

/**
 * 查找并点击匹配的交互选项
 */
Status.clickInteract = function (keywords) {
    Status.updateInteract();
    for (let i = 0; i < keywords.length; i++) {
        const kw = keywords[i];
        for (let j = 0; j < Status.interact.length; j++) {
            if (Status.interact[j].indexOf(kw) >= 0) {
                // 点击对应 OCR 区域中的选项（简化：按序点击）
                return Status.tapInteractIndex(j);
            }
        }
    }
    return false;
};

/**
 * 点击第 n 个交互选项（基于 OCR 区域均分）
 */
Status.tapInteractIndex = function (index) {
    const region = config.scaleRegion(config.OCR_REGIONS.interact);
    const itemHeight = (region[3] - region[1]) / 8;
    const x = (region[0] + region[2]) / 2;
    const y = region[1] + itemHeight * index + itemHeight / 2;
    click(x, y);
    sleep(config.DELAY.afterTap);
    return true;
};

/**
 * 曼哈顿距离
 */
Status.distance = function (pos1, pos2) {
    return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
};

module.exports = Status;
