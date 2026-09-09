#!/usr/bin/env python3
"""
烟雨江湖 iOS 跑图脚本

通过 WebDriverAgent (WDA) 在 Mac/Windows 上控制 iPhone，
游戏与账号始终在 iOS 端，无需转安卓。

前置条件见 README.md
"""

from __future__ import annotations

import argparse
import logging
import sys

import config
import map_data
from navigator import Navigator
from status import StatusReader
from walk import Walker
from wda_client import WdaClient

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)


def cmd_test_pos(wda: WdaClient) -> None:
    status = StatusReader(wda)
    if status.update_position():
        s = status.status
        print(f"当前位置: {s.city} ({s.position[0]},{s.position[1]})")
    else:
        print("位置识别失败，请检查 OCR 区域与游戏 UI")
        sys.exit(1)


def cmd_go(wda: WdaClient, x: int, y: int) -> None:
    status = StatusReader(wda)
    walker = Walker(wda, status)
    status.update_position()
    ok = walker.go_direct(x, y)
    status.update_position()
    s = status.status
    print(f"移动{'成功' if ok else '失败'}: ({s.position[0]},{s.position[1]})")
    sys.exit(0 if ok else 1)


def cmd_run(wda: WdaClient, skip_daxueshan: bool) -> None:
    status = StatusReader(wda)
    walker = Walker(wda, status)
    nav = Navigator(wda, status, walker)

    skip = ["大雪山"] if skip_daxueshan else []
    log.info("开始跑图，共 %d 个采集点", len(map_data.RESOURCE_ROUTE))

    try:
        result = nav.run_resource_route(skip_cities=skip)
    except KeyboardInterrupt:
        nav.stop()
        log.info("用户中断")
        sys.exit(130)

    log.info("完成 — 成功: %d, 失败: %d", result["collected"], result["failed"])


def main() -> None:
    parser = argparse.ArgumentParser(description="烟雨江湖 iOS 跑图脚本 (WDA)")
    parser.add_argument("--wda-url", default=config.WDA_URL, help="WDA 地址，默认 http://127.0.0.1:8100")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("test", help="测试 OCR 位置识别")
    go_p = sub.add_parser("go", help="前往指定坐标")
    go_p.add_argument("x", type=int)
    go_p.add_argument("y", type=int)
    run_p = sub.add_parser("run", help="执行完整资源跑图")
    run_p.add_argument("--include-daxueshan", action="store_true", help="包含大雪山（80级守矿怪）")

    args = parser.parse_args()

    wda = WdaClient(args.wda_url)
    log.info("连接 WDA: %s", args.wda_url)
    log.info("请确保 iPhone 已打开《烟雨江湖》并处于地图界面")
    wda.connect()

    if args.cmd == "test":
        cmd_test_pos(wda)
    elif args.cmd == "go":
        cmd_go(wda, args.x, args.y)
    elif args.cmd == "run":
        cmd_run(wda, skip_daxueshan=not args.include_daxueshan)


if __name__ == "__main__":
    main()
