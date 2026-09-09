#!/usr/bin/env python3
"""
烟雨江湖 — M 芯片 Mac 跑图脚本

在 Mac 上直接运行 iOS 版《烟雨江湖》（App Store 或 PlayCover），
使用 iOS 主号，无需 iPhone 连线、无需 WDA。
"""

from __future__ import annotations

import argparse
import logging
import sys

import config
import map_data
from mac_client import MacClient
from navigator import Navigator
from status import StatusReader
from walk import Walker

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger(__name__)


def main() -> None:
    parser = argparse.ArgumentParser(description="烟雨江湖 Mac (iOS版) 跑图")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("test", help="测试 OCR 位置识别")
    go = sub.add_parser("go", help="前往坐标")
    go.add_argument("x", type=int)
    go.add_argument("y", type=int)
    run = sub.add_parser("run", help="完整资源跑图")
    run.add_argument("--include-daxueshan", action="store_true")

    args = parser.parse_args()

    client = MacClient()
    client.connect()
    client.focus_hint()

    status = StatusReader(client)
    walker = Walker(client, status)
    nav = Navigator(client, status, walker)

    if args.cmd == "test":
        if status.update_position():
            s = status.status
            print(f"{s.city} ({s.position[0]},{s.position[1]})")
        else:
            sys.exit(1)
    elif args.cmd == "go":
        status.update_position()
        sys.exit(0 if walker.go_direct(args.x, args.y) else 1)
    elif args.cmd == "run":
        skip = [] if args.include_daxueshan else ["大雪山"]
        try:
            r = nav.run_resource_route(skip_cities=skip)
            log.info("完成 成功=%d 失败=%d", r["collected"], r["failed"])
        except KeyboardInterrupt:
            nav.stop()
            log.info("已中断")


if __name__ == "__main__":
    main()
