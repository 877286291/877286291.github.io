/**
 * 跨地图导航
 */
const config = require("./config.js");
const mapData = require("./mapData.js");
const Status = require("./status.js");
const Walk = require("./walk.js");

const Navigator = {};

/**
 * 切换到目标城市
 * 通过逐段寻路至城市出口/入口标签
 */
Navigator.travelToCity = function (targetCity) {
    Status.updatePosition();
    const currentCity = Status.city;

    if (currentCity === targetCity) {
        log("已在目标城市: " + targetCity);
        return true;
    }

    const route = mapData.getCityRoute(currentCity, targetCity);
    if (!route) {
        log("未找到路线: " + currentCity + " -> " + targetCity);
        toast("无路线: " + currentCity + " -> " + targetCity);
        return false;
    }

    log("路线: " + route.join(" -> "));

    for (let i = 1; i < route.length; i++) {
        const nextCity = route[i];
        const exitLabel = route[i]; // 出口通常以目标城市名命名

        log("前往: " + nextCity + " (出口: " + exitLabel + ")");

        // 在当前地图寻路至出口（使用城市名作为资源标签）
        if (!Navigator.goToExit(exitLabel)) {
            log("无法到达出口: " + exitLabel);
            return false;
        }

        // 等待地图切换
        sleep(config.DELAY.mapTransition);
        let waitCount = 0;
        while (Status.city !== nextCity && waitCount < 20) {
            Status.updatePosition();
            sleep(500);
            waitCount++;
        }

        if (Status.city !== nextCity) {
            log("地图切换失败，当前: " + Status.city + " 期望: " + nextCity);
            return false;
        }

        log("已进入: " + nextCity);
        sleep(500);
    }

    return true;
};

/**
 * 在当前地图寻路至出口（以城市/地点名为标签）
 * 简化实现：向地图边缘移动并点击出口建筑
 */
Navigator.goToExit = function (exitLabel) {
    Status.updatePosition();

    // 先尝试 OCR 找到出口名称对应的交互
    // 向地图上方移动尝试触发出口（多数出口在地图边缘）
    const mapSize = mapData.getMapSize(Status.city);

    // 尝试四个方向边缘
    const edges = [
        [Math.floor(mapSize.width / 2), 1],
        [Math.floor(mapSize.width / 2), mapSize.height - 1],
        [1, Math.floor(mapSize.height / 2)],
        [mapSize.width - 1, Math.floor(mapSize.height / 2)],
    ];

    for (let i = 0; i < edges.length; i++) {
        Walk.goDirect(edges[i][0], edges[i][1], 5);
        sleep(config.DELAY.afterMove);

        Status.updateInteract();
        for (let j = 0; j < Status.interact.length; j++) {
            if (Status.interact[j].indexOf(exitLabel) >= 0 ||
                Status.interact[j].indexOf("进入") >= 0 ||
                Status.interact[j].indexOf("前往") >= 0) {
                Status.tapInteractIndex(j);
                sleep(config.DELAY.mapTransition);
                return true;
            }
        }
    }

    // 备用：点击包含出口名的交互
    if (Status.clickInteract([exitLabel, "进入", "前往"])) {
        sleep(config.DELAY.mapTransition);
        return true;
    }

    return false;
};

/**
 * 执行完整资源跑图路线
 */
Navigator.runResourceRoute = function (route, options) {
    options = options || {};
    const skipCities = options.skipCities || [];
    let collected = 0;
    let failed = 0;

    for (let i = 0; i < route.length; i++) {
        if (!Navigator._running) break;

        const point = route[i];
        if (skipCities.indexOf(point.city) >= 0) {
            log("跳过城市: " + point.city);
            continue;
        }

        log("[" + (i + 1) + "/" + route.length + "] " + point.city + " - " + point.resource + " (" + point.x + "," + point.y + ")");

        // 跨地图移动
        if (Status.city !== point.city) {
            if (!Navigator.travelToCity(point.city)) {
                log("无法到达: " + point.city);
                failed++;
                continue;
            }
        }

        // 采集资源
        if (point.action === "collect") {
            if (Walk.goAndCollect(point.x, point.y, point.resource)) {
                collected++;
            } else {
                failed++;
            }
        }

        sleep(300);
    }

    return { collected: collected, failed: failed };
};

Navigator._running = true;

Navigator.stop = function () {
    Navigator._running = false;
};

Navigator.start = function () {
    Navigator._running = true;
};

module.exports = Navigator;
