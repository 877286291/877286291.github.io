"""地图内行走与采集"""

from __future__ import annotations

import logging
import time
from typing import Tuple

import config
import map_data
from status import StatusReader
from wda_client import WdaClient

log = logging.getLogger(__name__)


class Walker:
    def __init__(self, wda: WdaClient, status: StatusReader):
        self.wda = wda
        self.status = status

    def _step_scale(self) -> Tuple[float, float]:
        sx = self.wda.screen_w / config.BASE_WIDTH
        sy = self.wda.screen_h / config.BASE_HEIGHT
        return config.STEP_X * sx, config.STEP_Y * sy

    def cal_current_pixel(self, city: str, pos: Tuple[int, int]) -> Tuple[float, float]:
        mw, mh = map_data.get_map_size(city)
        cx, cy = config.get_center(self.wda.screen_w, self.wda.screen_h)
        step_x, step_y = self._step_scale()
        left = config.LEFT_OFFSET * (self.wda.screen_w / config.BASE_WIDTH)
        top = config.TOP_OFFSET * (self.wda.screen_h / config.BASE_HEIGHT)

        sum_px = mw * 0.5 * step_x + mh * 0.5 * step_x
        sum_py = mw * 0.5 * step_y + mh * 0.5 * step_y
        top_dis = pos[0] * 0.5 * step_y + pos[1] * 0.5 * step_y
        left_dis = pos[0] * 0.5 * step_x + (mh - pos[1]) * 0.5 * step_x

        px, py = cx, cy
        if left_dis < cx:
            px = left_dis + left
        elif sum_px - left_dis < cx:
            px = self.wda.screen_w - sum_px + left_dis
        elif top_dis < cy:
            py = top_dis + top
        elif sum_py - top_dis < cy:
            py = self.wda.screen_h - sum_py + top_dis
        return px, py

    def go_to(self, current_pixel: Tuple[float, float], from_pos: Tuple[int, int], to_pos: Tuple[int, int]) -> None:
        step_x, step_y = self._step_scale()
        dx, dy = to_pos[0] - from_pos[0], to_pos[1] - from_pos[1]
        dst_x = dx * step_x * 0.5 - dy * step_x * 0.5
        dst_y = dy * step_y * 0.5 + dx * step_y * 0.5
        tap_x = current_pixel[0] + dst_x
        tap_y = current_pixel[1] + dst_y
        log.info("移动 (%d,%d)->(%d,%d) tap(%.0f,%.0f)", *from_pos, *to_pos, tap_x, tap_y)
        self.wda.tap(tap_x, tap_y)

    def go_direct(self, target_x: int, target_y: int, max_step: int = config.MAX_WALK_STEP) -> bool:
        self.status.update_position()
        s = self.status.status
        timeout = 0

        while s.distance((target_x, target_y)) > 0:
            if timeout > 30:
                log.error("移动超时 (%d,%d)", target_x, target_y)
                return False

            dist = s.distance((target_x, target_y))
            step = min(max_step, dist)
            nx, ny = s.position
            dx, dy = target_x - nx, target_y - ny

            if abs(dx) >= abs(dy):
                nx += (1 if dx > 0 else -1) * min(step, abs(dx))
                remain = step - min(step, abs(dx))
                ny += (1 if dy > 0 else -1) * min(remain, abs(dy))
            else:
                ny += (1 if dy > 0 else -1) * min(step, abs(dy))
                remain = step - min(step, abs(dy))
                nx += (1 if dx > 0 else -1) * min(remain, abs(dx))

            cp = self.cal_current_pixel(s.city, s.position)
            self.go_to(cp, s.position, (nx, ny))
            time.sleep(config.DELAY["after_move"])
            self.status.update_position()
            timeout += 1

        return True

    def go_and_collect(self, x: int, y: int, resource: str) -> bool:
        if not self.go_direct(x, y):
            return False
        time.sleep(config.DELAY["after_move"])

        if self.status.click_interact(config.INTERACT_KEYWORDS["collect"]):
            log.info("采集: %s", resource)
            time.sleep(config.DELAY["after_collect"])
            return True

        self.wda.tap_center()
        if self.status.click_interact(config.INTERACT_KEYWORDS["collect"]):
            log.info("采集(二次): %s", resource)
            time.sleep(config.DELAY["after_collect"])
            return True

        log.warning("未找到采集选项: %s", resource)
        return False
