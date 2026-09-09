"""跨地图导航 — macOS 版"""

from __future__ import annotations

import logging
import time
from typing import List, Optional

import config
import map_data
from mac_client import MacClient
from status import StatusReader
from walk import Walker

log = logging.getLogger(__name__)


class Navigator:
    def __init__(self, client: MacClient, status: StatusReader, walker: Walker):
        self.client = client
        self.status = status
        self.walker = walker
        self.running = True

    def stop(self) -> None:
        self.running = False

    def travel_to_city(self, target: str) -> bool:
        self.status.update_position()
        if self.status.status.city == target:
            return True
        route = map_data.get_city_route(self.status.status.city, target)
        if not route:
            log.error("无路线 -> %s", target)
            return False
        for i in range(1, len(route)):
            if not self.running:
                return False
            nxt = route[i]
            if not self._go_to_exit(nxt):
                return False
            time.sleep(config.DELAY["map_transition"])
            for _ in range(20):
                self.status.update_position()
                if self.status.status.city == nxt:
                    break
                time.sleep(0.5)
            else:
                return False
        return True

    def _go_to_exit(self, label: str) -> bool:
        s = self.status.status
        mw, mh = map_data.get_map_size(s.city)
        kw = [label] + config.INTERACT_KEYWORDS["travel"]
        for ex, ey in [(mw // 2, 1), (mw // 2, mh - 1), (1, mh // 2), (mw - 1, mh // 2)]:
            self.walker.go_direct(ex, ey)
            time.sleep(config.DELAY["after_move"])
            if self.status.click_interact(kw):
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
        ok = fail = 0
        for i, p in enumerate(route):
            if not self.running:
                break
            if p["city"] in skip_cities:
                continue
            log.info("[%d/%d] %s %s", i + 1, len(route), p["city"], p["resource"])
            if self.status.status.city != p["city"] and not self.travel_to_city(p["city"]):
                fail += 1
                continue
            if self.walker.go_and_collect(p["x"], p["y"], p["resource"]):
                ok += 1
            else:
                fail += 1
        return {"collected": ok, "failed": fail}
