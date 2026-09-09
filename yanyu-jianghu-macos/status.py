"""OCR 位置识别 — macOS 版"""

from __future__ import annotations

import logging
import re
import time
from dataclasses import dataclass, field
from typing import List, Tuple

from PIL import Image

import config
from mac_client import MacClient

log = logging.getLogger(__name__)
_ocr_engine = None


def _get_ocr():
    global _ocr_engine
    if _ocr_engine is not None:
        return _ocr_engine
    try:
        from paddleocr import PaddleOCR
        _ocr_engine = PaddleOCR(use_angle_cls=False, lang="ch", show_log=False)
        log.info("OCR: PaddleOCR")
    except Exception:
        import easyocr
        _ocr_engine = easyocr.Reader(["ch_sim", "en"], gpu=False)
        log.info("OCR: EasyOCR")
    return _ocr_engine


def _run_ocr(img: Image.Image) -> List[str]:
    import numpy as np
    engine = _get_ocr()
    arr = np.array(img)
    if hasattr(engine, "ocr"):
        result = engine.ocr(arr, cls=False)
        if not result or not result[0]:
            return []
        return [line[1][0] for line in result[0]]
    return [item[1] for item in engine.readtext(arr)]


@dataclass
class GameStatus:
    city: str = ""
    position: Tuple[int, int] = (0, 0)
    interact: List[str] = field(default_factory=list)

    def distance(self, pos: Tuple[int, int]) -> int:
        return abs(self.position[0] - pos[0]) + abs(self.position[1] - pos[1])


class StatusReader:
    def __init__(self, client: MacClient):
        self.client = client
        self.status = GameStatus()

    def ocr_region_texts(self, region_key: str) -> List[str]:
        img = self.client.screenshot()
        crop = self.client.crop_region(img, config.OCR_REGIONS[region_key])
        return _run_ocr(crop)

    def parse_position(self, texts: List[str]) -> bool:
        combined = " ".join(texts)
        log.debug("OCR: %s", combined)
        coord = re.search(r"(\d+)\s*[,.，、]\s*(\d+)", combined)
        if not coord:
            return False
        self.status.position = (int(coord.group(1)), int(coord.group(2)))
        cities = re.findall(r"[\u4e00-\u9fa5]+", combined)
        if cities:
            city = max(cities, key=len)
            if not city.isdigit():
                self.status.city = city
        return True

    def update_position(self, max_retry: int = 5) -> bool:
        for _ in range(max_retry):
            if self.parse_position(self.ocr_region_texts("position")):
                log.info("位置: %s (%d,%d)", self.status.city, *self.status.position)
                return True
            time.sleep(config.DELAY["ocr_retry"])
        return False

    def update_interact(self) -> List[str]:
        texts = self.ocr_region_texts("interact")
        self.status.interact = [t.strip() for t in texts if t.strip()]
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
            self.client.screen_w,
            self.client.screen_h,
        )
        item_h = (region[3] - region[1]) / 8
        x = (region[0] + region[2]) / 2
        y = region[1] + item_h * index + item_h / 2
        self.client.tap(x, y)
        return True
