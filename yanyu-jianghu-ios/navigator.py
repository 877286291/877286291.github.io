"""跨地图导航与跑图主流程"""

from __future__ import annotations

import logging
import time
from typing import List, Optional

import config
import map_data
from status import StatusReader
from walk import Walker
from wda_client import WdaClient

log = logging.getLogger(__name__)


class Navigator:
    def __init__(self, wda: WdaClient, status: StatusReader, walker: Walker):
        self.wda = wda
        self.status = status
        self.walker = walker
        self.running = True

    def stop(self) -> None:
        self.running = False

    def travel_to_city(self, target_city: str) -> bool:
        self.status.update_position()
        current = self.status.status.city
        if current == target_city:
            return True

        route = map_data.get_city_route(current, target_city)
        if not route:
            log.error("无路线: %s -> %s", current, target_city)
            return False

        log.info("路线: %s", " -> ".join(route))
        for i in range(1, len(route)):
            if not self.running:
                return False
            next_city = route[i]
            if not self._go_to_exit(next_city):
                return False

            time.sleep(config.DELAY["map_transition"])
            for _ in range(20):
                self.status.update_position()
                if self.status.status.city == next_city:
                    break
                time.sleep(0.5)
            else:
                log.error("未进入 %s，当前 %s", next_city, self.status.status.city)
                return False
        return True

    def _go_to_exit(self, exit_label: str) -> bool:
        self.status.update_position()
        s = self.status.status
        mw, mh = map_data.get_map_size(s.city)
        edges = [
            (mw // 2, 1),
            (mw // 2, mh - 1),
            (1, mh // 2),
            (mw - 1, mh // 2),
        ]
        keywords = [exit_label] + config.INTERACT_KEYWORDS["travel"]

        for ex, ey in edges:
            self.walker.go_direct(ex, ey)
            time.sleep(config.DELAY["after_move"])
            if self.status.click_interact(keywords):
                time.sleep(config.DELAY["map_transition"])
                return True
        return False

    def run_resource_route(
        self,
        route: Optional[List[dict]] = None,
        skip_cities: Optional[List[str]] = None,
    ) -> dict:
        route = route or map_data.RESOURCE_ROUTE
        skip_cities = skip_cities or []
        collected = failed = 0

        for i, point in enumerate(route):
            if not self.running:
                break
            if point["city"] in skip_cities:
                log.info("跳过: %s", point["city"])
                continue

            log.info(
                "[%d/%d] %s - %s (%d,%d)",
                i + 1, len(route), point["city"], point["resource"], point["x"], point["y"],
            )

            if self.status.status.city != point["city"]:
                if not self.travel_to_city(point["city"]):
                    failed += 1
                    continue

            if self.walker.go_and_collect(point["x"], point["y"], point["resource"]):
                collected += 1
            else:
                failed += 1

        return {"collected": collected, "failed": failed}
