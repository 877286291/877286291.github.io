"""WebDriverAgent 客户端封装 — 通过 USB/WiFi 控制 iPhone"""

from __future__ import annotations

import io
import logging
import time
from typing import Optional, Tuple

from PIL import Image

import config

log = logging.getLogger(__name__)


class WdaClient:
    """封装 WDA 截图、点击、屏幕尺寸获取。"""

    def __init__(self, url: str = config.WDA_URL):
        self.url = url
        self._client = None
        self._session = None
        self.screen_w = config.BASE_WIDTH
        self.screen_h = config.BASE_HEIGHT

    def connect(self) -> None:
        try:
            import wda
        except ImportError as e:
            raise RuntimeError("请安装: pip install facebook-wda") from e

        log.info("正在连接 WDA: %s", self.url)
        try:
            self._client = wda.Client(self.url)
            self._client.status(timeout=15)
        except Exception as e:
            raise RuntimeError(
                f"无法连接 WDA ({self.url})。"
                "家里 Mac 是否已运行 tidevice wdaproxy + frpc？"
                "外网请确认 --wda-url 指向 VPS 转发地址。"
            ) from e

        self._session = self._client.session()
        size = self._session.window_size()
        self.screen_w = int(size.width)
        self.screen_h = int(size.height)
        log.info("WDA 已连接，屏幕: %dx%d", self.screen_w, self.screen_h)

    def screenshot(self) -> Image.Image:
        if not self._session:
            raise RuntimeError("请先 connect()")
        png = self._session.screenshot(format="pillow")
        if isinstance(png, Image.Image):
            return png
        return Image.open(io.BytesIO(png))

    def tap(self, x: float, y: float) -> None:
        if not self._session:
            raise RuntimeError("请先 connect()")
        self._session.tap(x, y)
        time.sleep(config.DELAY["after_tap"])

    def crop_region(self, img: Image.Image, region: Tuple[int, int, int, int]) -> Image.Image:
        scaled = config.scale_region(region, img.width, img.height)
        return img.crop(scaled)

    def tap_center(self) -> None:
        cx, cy = config.get_center(self.screen_w, self.screen_h)
        self.tap(cx, cy)
