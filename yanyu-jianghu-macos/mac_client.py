"""macOS 屏幕截图与鼠标点击（M 芯片 Mac 运行 iOS 版游戏）"""

from __future__ import annotations

import logging
import time
from typing import Tuple

from PIL import Image

import config

log = logging.getLogger(__name__)


class MacClient:
    """
    通过 pyautogui 控制 Mac 屏幕。
    截图与点击使用同一坐标系（含 Retina 逻辑坐标）。
    """

    def __init__(self):
        self.screen_w = config.BASE_WIDTH
        self.screen_h = config.BASE_HEIGHT
        self._pyautogui = None

    def connect(self) -> None:
        try:
            import pyautogui
        except ImportError as e:
            raise RuntimeError("请安装: pip install pyautogui") from e

        self._pyautogui = pyautogui
        pyautogui.FAILSAFE = True  # 鼠标移到左上角紧急停止
        pyautogui.PAUSE = 0.05

        w, h = pyautogui.size()
        self.screen_w, self.screen_h = w, h
        log.info("Mac 屏幕逻辑分辨率: %dx%d", w, h)
        log.info("请将《烟雨江湖》窗口最大化，并保持地图界面在前台")

        # 试截图以验证辅助功能权限
        try:
            self.screenshot()
        except Exception as e:
            raise RuntimeError(
                "无法截图，请在 系统设置 → 隐私与安全性 → 辅助功能 "
                "中允许 Terminal / iTerm / Python"
            ) from e

    def screenshot(self) -> Image.Image:
        import time as _time
        _time.sleep(config.DELAY["before_screenshot"])
        img = self._pyautogui.screenshot()
        # 以截图实际尺寸作为缩放基准（兼容 Retina 与窗口化）
        self.screen_w, self.screen_h = img.size
        return img

    def tap(self, x: float, y: float) -> None:
        self._pyautogui.click(x, y)
        time.sleep(config.DELAY["after_tap"])

    def crop_region(self, img: Image.Image, region: Tuple[int, int, int, int]) -> Image.Image:
        scaled = config.scale_region(region, img.width, img.height)
        return img.crop(scaled)

    def tap_center(self) -> None:
        cx, cy = config.get_center(self.screen_w, self.screen_h)
        self.tap(cx, cy)

    def focus_hint(self) -> None:
        """运行前给用户 3 秒切换到游戏窗口"""
        log.info("3 秒后启动，请立即点击游戏窗口…")
        for i in range(3, 0, -1):
            log.info("%d…", i)
            time.sleep(1)
