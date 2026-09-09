/**
 * 地图数据：资源坐标、城市连通、跑图路线
 * 坐标来源：社区资源收集路线整理
 */

// 城市间最短路径（起点 -> 终点 需经过的城市序列）
const CITY_ROUTES = {
    "成都": {
        "双王镇": ["成都", "凤鸣集", "双王镇"],
        "姑苏": ["成都", "凤鸣集", "双王镇", "衡山", "龙泉镇", "杭州", "姑苏"],
        "华山": ["成都", "青城山", "大雪山", "昆仑山", "敦煌", "华山"],
        "敦煌": ["成都", "青城山", "大雪山", "昆仑山", "敦煌"],
        "大雪山": ["成都", "青城山", "大雪山"],
        "南阳渡": ["成都", "凤鸣集", "双王镇", "南阳渡"],
        "太乙山": ["成都", "凤鸣集", "双王镇", "南阳渡", "太乙山"],
        "洛阳": ["成都", "凤鸣集", "双王镇", "南阳渡", "洛阳"],
        "明月峰": ["成都", "凤鸣集", "明月峰"],
    },
    "双王镇": {
        "衡山": ["双王镇", "衡山"],
        "南阳渡": ["双王镇", "南阳渡"],
        "南岭": ["双王镇", "衡山", "南岭"],
        "龙泉镇": ["双王镇", "衡山", "龙泉镇"],
        "明月峰": ["双王镇", "凤鸣集", "明月峰"],
    },
    "衡山": {
        "双王镇": ["衡山", "双王镇"],
        "南岭": ["衡山", "南岭"],
        "龙泉镇": ["衡山", "龙泉镇"],
    },
    "南岭": {
        "衡山": ["南岭", "衡山"],
    },
    "龙泉镇": {
        "杭州": ["龙泉镇", "杭州"],
        "衡山": ["龙泉镇", "衡山"],
    },
    "杭州": {
        "姑苏": ["杭州", "姑苏"],
        "泉州": ["杭州", "泉州"],
        "龙泉镇": ["杭州", "龙泉镇"],
    },
    "姑苏": {
        "杭州": ["姑苏", "杭州"],
    },
    "泉州": {
        "杭州": ["泉州", "杭州"],
    },
    "洛阳": {
        "落霞镇": ["洛阳", "落霞镇"],
        "泰安镇": ["洛阳", "泰安镇"],
        "南阳渡": ["洛阳", "南阳渡"],
    },
    "落霞镇": {
        "洛阳": ["落霞镇", "洛阳"],
    },
    "泰安镇": {
        "洛阳": ["泰安镇", "洛阳"],
    },
    "南阳渡": {
        "太乙山": ["南阳渡", "太乙山"],
        "洛阳": ["南阳渡", "洛阳"],
        "双王镇": ["南阳渡", "双王镇"],
    },
    "太乙山": {
        "南阳渡": ["太乙山", "南阳渡"],
    },
    "敦煌": {
        "华山": ["敦煌", "华山"],
        "大雪山": ["敦煌", "昆仑山", "大雪山"],
    },
    "华山": {
        "敦煌": ["华山", "敦煌"],
    },
    "大雪山": {
        "敦煌": ["大雪山", "昆仑山", "敦煌"],
    },
    "明月峰": {
        "双王镇": ["明月峰", "凤鸣集", "双王镇"],
    },
};

// 各城市地图尺寸（用于像素计算）
const MAP_SIZES = {
    "双王镇": { width: 30, height: 30 },
    "姑苏": { width: 40, height: 40 },
    "洛阳": { width: 45, height: 45 },
    "华山": { width: 35, height: 35 },
    "敦煌": { width: 25, height: 25 },
    "大雪山": { width: 20, height: 20 },
    "南阳渡": { width: 50, height: 50 },
    "太乙山": { width: 35, height: 35 },
    "衡山": { width: 25, height: 25 },
    "南岭": { width: 25, height: 25 },
    "龙泉镇": { width: 30, height: 30 },
    "杭州": { width: 35, height: 35 },
    "泉州": { width: 30, height: 30 },
    "泰安镇": { width: 45, height: 45 },
    "落霞镇": { width: 45, height: 45 },
    "明月峰": { width: 40, height: 40 },
};

/**
 * 环形资源跑图路线（逆时针，节省车马费）
 * action: "collect" 采集 | "travel" 仅移动至下一城市出口
 */
const RESOURCE_ROUTE = [
    { city: "明月峰", resource: "杜仲", x: 35, y: 18, action: "collect" },
    { city: "明月峰", resource: "香蕉", x: 35, y: 5, action: "collect" },
    { city: "双王镇", resource: "甘草", x: 3, y: 23, action: "collect" },
    { city: "双王镇", resource: "赤铜", x: 23, y: 13, action: "collect" },
    { city: "双王镇", resource: "棉花", x: 19, y: 32, action: "collect" },
    { city: "衡山", resource: "甘草", x: 16, y: 9, action: "collect" },
    { city: "衡山", resource: "黑铁", x: 20, y: 20, action: "collect" },
    { city: "南岭", resource: "当归", x: 12, y: 21, action: "collect" },
    { city: "南岭", resource: "棉花", x: 12, y: 10, action: "collect" },
    { city: "龙泉镇", resource: "甘草", x: 24, y: 17, action: "collect" },
    { city: "龙泉镇", resource: "雪银", x: 3, y: 2, action: "collect" },
    { city: "龙泉镇", resource: "棉花", x: 19, y: 5, action: "collect" },
    { city: "杭州", resource: "地黄", x: 30, y: 26, action: "collect" },
    { city: "杭州", resource: "棉花", x: 30, y: 2, action: "collect" },
    { city: "泉州", resource: "雪银", x: 15, y: 28, action: "collect" },
    { city: "姑苏", resource: "甘草", x: 4, y: 22, action: "collect" },
    { city: "姑苏", resource: "棉花", x: 28, y: 2, action: "collect" },
    { city: "泰安镇", resource: "黄精", x: 7, y: 4, action: "collect" },
    { city: "泰安镇", resource: "黑铁", x: 33, y: 9, action: "collect" },
    { city: "泰安镇", resource: "棉花", x: 20, y: 38, action: "collect" },
    { city: "洛阳", resource: "甘草", x: 25, y: 2, action: "collect" },
    { city: "洛阳", resource: "赤铜", x: 11, y: 42, action: "collect" },
    { city: "洛阳", resource: "粗麻", x: 21, y: 37, action: "collect" },
    { city: "落霞镇", resource: "黑铁", x: 26, y: 4, action: "collect" },
    { city: "落霞镇", resource: "粗麻", x: 41, y: 32, action: "collect" },
    { city: "华山", resource: "枸杞", x: 11, y: 1, action: "collect" },
    { city: "华山", resource: "雪银", x: 10, y: 37, action: "collect" },
    { city: "敦煌", resource: "雪银", x: 12, y: 3, action: "collect" },
    { city: "大雪山", resource: "雪银", x: 4, y: 21, action: "collect", note: "80级守矿怪，低等级请跳过" },
    { city: "南阳渡", resource: "金银花", x: 8, y: 14, action: "collect" },
    { city: "南阳渡", resource: "赤铜", x: 44, y: 24, action: "collect" },
    { city: "南阳渡", resource: "粗麻", x: 22, y: 4, action: "collect" },
    { city: "太乙山", resource: "白芍", x: 26, y: 30, action: "collect" },
];

/**
 * 城市出口/入口标签名（用于跨地图寻路终点）
 */
const CITY_EXITS = {
    "双王镇": "衡山",
    "衡山": "龙泉镇",
    "龙泉镇": "杭州",
    "杭州": "姑苏",
    "姑苏": "洛阳",
    "洛阳": "落霞镇",
    "落霞镇": "华山",
    "华山": "敦煌",
    "敦煌": "大雪山",
    "大雪山": "南阳渡",
    "南阳渡": "太乙山",
    "南岭": "龙泉镇",
    "泉州": "姑苏",
    "泰安镇": "洛阳",
    "明月峰": "双王镇",
    "太乙山": "南阳渡",
};

function getCityRoute(fromCity, toCity) {
    if (fromCity === toCity) return [fromCity];
    const routes = CITY_ROUTES[fromCity];
    if (routes && routes[toCity]) return routes[toCity];
    // 尝试反向查找
    for (const start of Object.keys(CITY_ROUTES)) {
        const r = CITY_ROUTES[start][toCity];
        if (r && r.indexOf(fromCity) >= 0) {
            const idx = r.indexOf(fromCity);
            return r.slice(idx);
        }
    }
    return null;
}

function getMapSize(city) {
    return MAP_SIZES[city] || { width: 40, height: 40 };
}

module.exports = {
    CITY_ROUTES,
    MAP_SIZES,
    RESOURCE_ROUTE,
    CITY_EXITS,
    getCityRoute,
    getMapSize,
};
