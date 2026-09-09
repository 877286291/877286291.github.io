/**
 * 屏幕与 OCR 区域配置
 * 默认基准分辨率 1920x1080，其他分辨率请按比例缩放
 */
module.exports = {
    // 基准分辨率
    BASE_WIDTH: 1920,
    BASE_HEIGHT: 1080,

    // 等距地图像素步长（中视角）
    STEP_X: 216,
    STEP_Y: 108,
    LEFT_OFFSET: 54,
    RIGHT_OFFSET: 300,
    TOP_OFFSET: 81,
    BOTTOM_OFFSET: 100,

    // 单次移动最大步数
    MAX_WALK_STEP: 5,

    // OCR 检测区域 [x1, y1, x2, y2]
    OCR_REGIONS: {
        position: [1660, 320, 1900, 380],
        interact: [1670, 460, 1900, 960],
        energy: [245, 10, 400, 60],
    },

    // 交互按钮关键词
    INTERACT_KEYWORDS: {
        collect: ["采集", "搜索", "挖掘", "砍伐", "捕捉"],
        confirm: ["确定", "确认", "继续"],
        close: ["关闭", "取消"],
    },

    // 游戏包名（雷电/夜神等模拟器请自行确认）
    GAME_PACKAGE: "com.yanyu.jianghu",

    // 操作延迟（毫秒）
    DELAY: {
        afterTap: 300,
        afterMove: 500,
        afterCollect: 800,
        mapTransition: 1500,
        ocrRetry: 200,
    },

    /**
     * 根据当前屏幕尺寸缩放坐标区域
     */
    scaleRegion(region) {
        const sw = device.width;
        const sh = device.height;
        const sx = sw / this.BASE_WIDTH;
        const sy = sh / this.BASE_HEIGHT;
        return [
            Math.round(region[0] * sx),
            Math.round(region[1] * sy),
            Math.round(region[2] * sx),
            Math.round(region[3] * sy),
        ];
    },

    getCenter() {
        const w = device.width;
        const h = device.height;
        const left = this.LEFT_OFFSET * (w / this.BASE_WIDTH);
        const right = this.RIGHT_OFFSET * (w / this.BASE_WIDTH);
        const top = this.TOP_OFFSET * (h / this.BASE_HEIGHT);
        const bottom = this.BOTTOM_OFFSET * (h / this.BASE_HEIGHT);
        return {
            x: 0.5 * (w - left - right) + left,
            y: 0.5 * (h - top - bottom) + top,
        };
    },
};
