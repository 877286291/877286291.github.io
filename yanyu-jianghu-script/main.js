/**
 * 烟雨江湖 - 资源跑图脚本
 *
 * 功能：
 * - 环形资源采集路线（明月峰 -> 双王镇 -> ... -> 太乙山）
 * - 跨地图自动导航
 * - OCR 位置识别
 *
 * 环境要求：
 * - Auto.js Pro（推荐）或 Auto.js 4.1.1+
 * - 分辨率 1920x1080（其他分辨率会自动缩放）
 * - 开启无障碍服务
 * - 安装 Paddle OCR 插件（Pro 内置）
 *
 * 免责声明：本脚本仅供学习交流，使用自动化可能违反游戏用户协议，风险自负。
 */

"ui";

const config = require("./modules/config.js");
const mapData = require("./modules/mapData.js");
const Status = require("./modules/status.js");
const Walk = require("./modules/walk.js");
const Navigator = require("./modules/navigator.js");

// ========== 悬浮控制面板 ==========
ui.layout(
    <vertical padding="16">
        <text text="烟雨江湖跑图脚本" textSize="20sp" textColor="#333333" gravity="center" marginBottom="8"/>
        <text id="statusText" text="状态: 就绪" textSize="14sp" textColor="#666666"/>
        <text id="posText" text="位置: --" textSize="12sp" textColor="#999999" marginTop="4"/>
        <horizontal marginTop="12">
            <button id="btnStart" text="开始跑图" w="*" style="Widget.AppCompat.Button.Colored"/>
            <button id="btnStop" text="停止" w="auto" marginLeft="8"/>
        </horizontal>
        <horizontal marginTop="8">
            <button id="btnTestPos" text="测试位置" w="*" />
            <button id="btnGoCoord" text="前往坐标" w="*" marginLeft="8"/>
        </horizontal>
        <checkbox id="skipDaxueshan" text="跳过大雪山（80级守矿怪）" checked="true" marginTop="8"/>
        <text text="自定义坐标 (x,y):" textSize="12sp" marginTop="12"/>
        <horizontal>
            <input id="inputX" hint="X" inputType="number" w="*"/>
            <input id="inputY" hint="Y" inputType="number" w="*" marginLeft="8"/>
        </horizontal>
        <text id="logText" text="" textSize="11sp" textColor="#888888" marginTop="12" maxLines="5"/>
    </vertical>
);

let isRunning = false;
let workerThread = null;

function updateUI(msg) {
    ui.run(function () {
        ui.statusText.setText("状态: " + msg);
    });
}

function updatePos() {
    if (Status.updatePosition()) {
        ui.run(function () {
            ui.posText.setText("位置: " + Status.city + " (" + Status.position[0] + "," + Status.position[1] + ")");
        });
    }
}

function appendLog(msg) {
    log(msg);
    ui.run(function () {
        const old = ui.logText.getText() + "";
        const lines = (old + "\n" + msg).split("\n").slice(-5);
        ui.logText.setText(lines.join("\n"));
    });
}

// ========== 权限与初始化 ==========
function init() {
    auto.waitFor();
    if (!requestScreenCapture()) {
        toast("请授予截图权限");
        exit();
    }
    toast("初始化完成，分辨率: " + device.width + "x" + device.height);
    appendLog("分辨率: " + device.width + "x" + device.height);
}

// ========== 按钮事件 ==========
ui.btnStart.on("click", function () {
    if (isRunning) {
        toast("脚本运行中");
        return;
    }

    threads.start(function () {
        init();
    });

    isRunning = true;
    Navigator.start();
    updateUI("跑图中...");

    workerThread = threads.start(function () {
        try {
            appendLog("开始资源跑图");
            updatePos();

            const options = {};
            if (ui.skipDaxueshan.checked) {
                options.skipCities = ["大雪山"];
            }

            const result = Navigator.runResourceRoute(mapData.RESOURCE_ROUTE, options);

            appendLog("完成! 采集:" + result.collected + " 失败:" + result.failed);
            updateUI("完成 (成功" + result.collected + "/失败" + result.failed + ")");
            toast("跑图完成");
        } catch (e) {
            appendLog("错误: " + e);
            updateUI("出错");
        } finally {
            isRunning = false;
        }
    });
});

ui.btnStop.on("click", function () {
    Navigator.stop();
    isRunning = false;
    updateUI("已停止");
    toast("已停止");
    if (workerThread) {
        workerThread.interrupt();
    }
});

ui.btnTestPos.on("click", function () {
    threads.start(function () {
        init();
        updatePos();
        appendLog("位置: " + Status.city + " (" + Status.position.join(",") + ")");
        toast(Status.city + " (" + Status.position.join(",") + ")");
    });
});

ui.btnGoCoord.on("click", function () {
    const x = parseInt(ui.inputX.text());
    const y = parseInt(ui.inputY.text());
    if (isNaN(x) || isNaN(y)) {
        toast("请输入有效坐标");
        return;
    }

    threads.start(function () {
        init();
        updatePos();
        updateUI("移动中...");
        Walk.goDirect(x, y);
        updatePos();
        updateUI("就绪");
        toast("已到达 (" + x + "," + y + ")");
    });
});

// ========== 启动游戏（可选） ==========
events.on("exit", function () {
    Navigator.stop();
});

console.show();
console.setSize(device.width * 0.5, device.height * 0.3);
log("烟雨江湖跑图脚本已加载");
log("路线共 " + mapData.RESOURCE_ROUTE.length + " 个采集点");
