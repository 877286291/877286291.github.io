/**
 * 地图内行走逻辑（等距视角坐标转像素点击）
 */
const config = require("./config.js");
const mapData = require("./mapData.js");
const Status = require("./status.js");

const Walk = {};

/**
 * 计算当前坐标对应的屏幕像素位置
 */
Walk.calCurrentPixel = function (city, pos) {
    const mapSize = mapData.getMapSize(city);
    const center = config.getCenter();
    const stepX = config.STEP_X * (device.width / config.BASE_WIDTH);
    const stepY = config.STEP_Y * (device.height / config.BASE_HEIGHT);
    const leftOffset = config.LEFT_OFFSET * (device.width / config.BASE_WIDTH);
    const topOffset = config.TOP_OFFSET * (device.height / config.BASE_HEIGHT);

    const sumPixelX = mapSize.width * 0.5 * stepX + mapSize.height * 0.5 * stepX;
    const sumPixelY = mapSize.width * 0.5 * stepY + mapSize.height * 0.5 * stepY;

    const topDisPixel = pos[0] * 0.5 * stepY + pos[1] * 0.5 * stepY;
    const leftDisPixel = pos[0] * 0.5 * stepX + (mapSize.height - pos[1]) * 0.5 * stepX;

    let pixel = [center.x, center.y];

    if (leftDisPixel < center.x) {
        pixel[0] = leftDisPixel + leftOffset;
    } else if (sumPixelX - leftDisPixel < center.x) {
        pixel[0] = device.width - sumPixelX + leftDisPixel;
    } else if (topDisPixel < center.y) {
        pixel[1] = topDisPixel + topOffset;
    } else if (sumPixelY - topDisPixel < center.y) {
        pixel[1] = device.height - sumPixelY + topDisPixel;
    }

    return pixel;
};

/**
 * 点击目标坐标（等距变换）
 */
Walk.goTo = function (currentPixel, fromPos, toPos) {
    const stepX = config.STEP_X * (device.width / config.BASE_WIDTH);
    const stepY = config.STEP_Y * (device.height / config.BASE_HEIGHT);

    const dstX = (toPos[0] - fromPos[0]) * stepX * 0.5 - (toPos[1] - fromPos[1]) * stepX * 0.5;
    const dstY = (toPos[1] - fromPos[1]) * stepY * 0.5 + (toPos[0] - fromPos[0]) * stepY * 0.5;

    const tapX = currentPixel[0] + dstX;
    const tapY = currentPixel[1] + dstY;

    log("点击移动: (" + fromPos[0] + "," + fromPos[1] + ") -> (" + toPos[0] + "," + toPos[1] + ") 像素(" + Math.round(tapX) + "," + Math.round(tapY) + ")");
    click(tapX, tapY);
    sleep(config.DELAY.afterTap);
};

/**
 * 直线行走到目标坐标（分步移动，每步最多 maxStep 格）
 */
Walk.goDirect = function (targetX, targetY, maxStep) {
    maxStep = maxStep || config.MAX_WALK_STEP;
    Status.updatePosition();

    let timeout = 0;
    while (Status.distance(Status.position, [targetX, targetY]) > 0) {
        if (timeout > 30) {
            log("移动超时: 目标(" + targetX + "," + targetY + ")");
            return false;
        }

        const dist = Status.distance(Status.position, [targetX, targetY]);
        const step = Math.min(maxStep, dist);

        // 计算中间点（沿曼哈顿路径）
        let nextX = Status.position[0];
        let nextY = Status.position[1];
        const dx = targetX - Status.position[0];
        const dy = targetY - Status.position[1];

        if (Math.abs(dx) >= Math.abs(dy)) {
            nextX += Math.sign(dx) * Math.min(step, Math.abs(dx));
            const remain = step - Math.min(step, Math.abs(dx));
            nextY += Math.sign(dy) * Math.min(remain, Math.abs(dy));
        } else {
            nextY += Math.sign(dy) * Math.min(step, Math.abs(dy));
            const remain = step - Math.min(step, Math.abs(dy));
            nextX += Math.sign(dx) * Math.min(remain, Math.abs(dx));
        }

        const cp = Walk.calCurrentPixel(Status.city, Status.position);
        Walk.goTo(cp, Status.position, [nextX, nextY]);

        sleep(config.DELAY.afterMove);
        Status.updatePosition();
        timeout++;
    }

    log("到达目标: (" + targetX + "," + targetY + ")");
    return true;
};

/**
 * 行走到指定资源点并尝试采集
 */
Walk.goAndCollect = function (x, y, resourceName) {
    if (!Walk.goDirect(x, y)) return false;

    sleep(config.DELAY.afterMove);

    // 尝试点击采集
    if (Status.clickInteract(config.INTERACT_KEYWORDS.collect)) {
        log("采集: " + resourceName);
        sleep(config.DELAY.afterCollect);
        return true;
    }

    // 备用：点击屏幕中央触发交互
    const center = config.getCenter();
    click(center.x, center.y);
    sleep(config.DELAY.afterTap);

    if (Status.clickInteract(config.INTERACT_KEYWORDS.collect)) {
        log("采集(二次): " + resourceName);
        sleep(config.DELAY.afterCollect);
        return true;
    }

    log("未找到采集选项: " + resourceName);
    return false;
};

module.exports = Walk;
