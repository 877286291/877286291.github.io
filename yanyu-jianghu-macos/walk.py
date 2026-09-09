"""地图行走与采集 — macOS 版"""

from __future__ import annotations

import logging
import time
from typing import Tuple

import config
import map_data
from mac_client import MacClient
from status import StatusReader

log = logging.getLogger(__name__)


class Walker:
    def __init__(self, client: MacClient, status: StatusReader):
        self.client = client
        self.status = status

    def _step_scale(self) -> Tuple[float, float]:
        sx = self.client.screen_w / config.BASE_WIDTH
        sy = self.client.screen_h / config.BASE_HEIGHT
        return config.STEP_X * sx, config.STEP_Y * sy

    def cal_current_pixel(self, city: str, pos: Tuple[int, int]) -> Tuple[float, float]:
        mw, mh = map_data.get_map_size(city)
        cx, cy = config.get_center(self.client.screen_w, self.client.screen_h)
        step_x, step_y = self._step_scale()
        left = config.LEFT_OFFSET * (self.client.screen_w / config.BASE_WIDTH)
        top = config.TOP_OFFSET * (self.client.screen_h / config.BASE_HEIGHT)
        sum_px = mw * 0.5 * step_x + mh * 0.5 * step_x
        sum_py = mw * 0.5 * step_y + mh * 0.5 * step_y
        top_dis = pos[0] * 0.5 * step_y + pos[1] * 0.5 * step_y
        left_dis = pos[0] * 0.5 * step_x + (mh - pos[1]) * 0.5 * step_x
        px, py = cx, cy
        if left_dis < cx:
            px = left_dis + left
        elif sum_px - left_dis < cx:
            px = self.client.screen_w - sum_px + left_dis
        elif top_dis < cy:
            py = top_dis + top
        elif sum_py - top_dis < cy:
            py = self.client.screen_h - sum_py + top_dis
        return px, py

    def go_to(self, cp: Tuple[float, float], fr: Tuple[int, int], to: Tuple[int, int]) -> None:
        step_x, step_y = self._step_scale()
        dx, dy = to[0] - fr[0], to[1] - fr[1]
        self.client.tap(
            cp[0] + dx * step_x * 0.5 - dy * step_x * 0.5,
            cp[1] + dy * step_y * 0.5 + dx * step_y * 0.5,
        )

    def go_direct(self, tx: int, ty: int, max_step: int = config.MAX_WALK_STEP) -> bool:
        self.status.update_position()
        s = self.status.status
        n = 0
        while s.distance((tx, ty)) > 0:
            if n > 30:
                return False
            step = min(max_step, s.distance((tx, ty)))
            nx, ny = s.position
            dx, dy = tx - nx, ty - ny
            if abs(dx) >= abs(dy):
                nx += (1 if dx > 0 else -1) * min(step, abs(dx))
                r = step - min(step, abs(dx))
                ny += (1 if dy > 0 else -1) * min(r, abs(dy))
            else:
                ny += (1 if dy > 0 else -1) * min(step, abs(dy))
                r = step - min(step, abs(dy))
                nx += (1 if dx > 0 else -1) * min(r, abs(dx))
            self.go_to(self.cal_current_pixel(s.city, s.position), s.position, (nx, ny))
            time.sleep(config.DELAY["after_move"])
            self.status.update_position()
            n += 1
        return True

    def go_and_collect(self, x: int, y: int, name: str) -> bool:
        if not self.go_direct(x, y):
            return False
        time.sleep(config.DELAY["after_move"])
        if self.status.click_interact(config.INTERACT_KEYWORDS["collect"]):
            time.sleep(config.DELAY["after_collect"])
            return True
        self.client.tap_center()
        if self.status.click_interact(config.INTERACT_KEYWORDS["collect"]):
            time.sleep(config.DELAY["after_collect"])
            return True
        log.warning("未找到采集: %s", name)
        return False
