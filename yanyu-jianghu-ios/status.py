"""OCR 位置识别与交互选项解析"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

from PIL import Image

import config
from wda_client import WdaClient

log = logging.getLogger(__name__)

_ocr_engine = None


def _get_ocr():
    global _ocr_engine
    if _ocr_engine is not None:
        return _ocr_engine
    try:
        from paddleocr import PaddleOCR
        _ocr_engine = PaddleOCR(use_angle_cls=False, lang="ch", show_log=False)
        log.info("使用 PaddleOCR 引擎")
    except Exception as e:
        log.warning("PaddleOCR 不可用: %s，将尝试 easyocr", e)
        try:
            import easyocr
            _ocr_engine = easyocr.Reader(["ch_sim", "en"], gpu=False)
            log.info("使用 EasyOCR 引擎")
        except Exception as e2:
            raise RuntimeError("请安装 OCR: pip install paddleocr 或 easyocr") from e2
    return _ocr_engine


def _run_ocr(img: Image.Image) -> List[str]:
    engine = _get_ocr()
    import numpy as np
    arr = np.array(img)

    if hasattr(engine, "ocr"):
        # PaddleOCR
        result = engine.ocr(arr, cls=False)
        texts = []
        if result and result[0]:
            for line in result[0]:
                texts.append(line[1][0])
        return texts

    # EasyOCR
    result = engine.readtext(arr)
    return [item[1] for item in result]


@dataclass
class GameStatus:
    city: str = ""
    position: Tuple[int, int] = (0, 0)
    interact: List[str] = field(default_factory=list)

    def distance(self, pos: Tuple[int, int]) -> int:
        return abs(self.position[0] - pos[0]) + abs(self.position[1] - pos[1])


class StatusReader:
    def __init__(self, wda: WdaClient):
        self.wda = wda
        self.status = GameStatus()

    def ocr_region_texts(self, region_key: str) -> List[str]:
        img = self.wda.screenshot()
        crop = self.wda.crop_region(img, config.OCR_REGIONS[region_key])
        return _run_ocr(crop)

    def parse_position(self, texts: List[str]) -> bool:
        combined = " ".join(texts)
        log.debug("OCR 位置: %s", combined)

        coord = re.search(r"(\d+)\s*[,.，、]\s*(\d+)", combined)
        if not coord:
            return False

        x, y = int(coord.group(1)), int(coord.group(2))
        cities = re.findall(r"[\u4e00-\u9fa5]+", combined)
        city = max(cities, key=len) if cities else self.status.city

        self.status.position = (x, y)
        if city and not city.isdigit():
            self.status.city = city
        return True

    def update_position(self, max_retry: int = 5) -> bool:
        import time
        for _ in range(max_retry):
            texts = self.ocr_region_texts("position")
            if self.parse_position(texts):
                log.info("位置: %s (%d,%d)", self.status.city, *self.status.position)
                return True
            time.sleep(config.DELAY["ocr_retry"])
        log.warning("位置识别失败")
        return False

    def update_interact(self) -> List[str]:
        texts = self.ocr_region_texts("interact")
        self.status.interact = [t.strip() for t in texts if t.strip()]
        log.debug("交互: %s", self.status.interact)
        return self.status.interact

    def click_interact(self, keywords: List[str]) -> bool:
        self.update_interact()
        for i, text in enumerate(self.status.interact):
            for kw in keywords:
                if kw in text:
                    return self._tap_interact_index(i)
        return False

    def _tap_interact_index(self, index: int) -> bool:
        region = config.scale_region(
            config.OCR_REGIONS["interact"],
            self.wda.screen_w,
            self.wda.screen_h,
        )
        item_h = (region[3] - region[1]) / 8
        x = (region[0] + region[2]) / 2
        y = region[1] + item_h * index + item_h / 2
        self.wda.tap(x, y)
        return True
