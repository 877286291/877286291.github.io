"""屏幕与 OCR 配置（基准 1920×1080 横屏）"""

BASE_WIDTH = 1920
BASE_HEIGHT = 1080

STEP_X = 216
STEP_Y = 108
LEFT_OFFSET = 54
RIGHT_OFFSET = 300
TOP_OFFSET = 81
BOTTOM_OFFSET = 100
MAX_WALK_STEP = 5

OCR_REGIONS = {
    "position": (1660, 320, 1900, 380),
    "interact": (1670, 460, 1900, 960),
}

INTERACT_KEYWORDS = {
    "collect": ["采集", "搜索", "挖掘", "砍伐", "捕捉"],
    "confirm": ["确定", "确认", "继续"],
    "travel": ["进入", "前往"],
}

DELAY = {
    "after_tap": 0.35,
    "after_move": 0.55,
    "after_collect": 0.9,
    "map_transition": 1.8,
    "ocr_retry": 0.25,
    "before_screenshot": 0.15,
}


def scale_region(region, screen_w, screen_h):
    sx = screen_w / BASE_WIDTH
    sy = screen_h / BASE_HEIGHT
    x1, y1, x2, y2 = region
    return (
        int(x1 * sx),
        int(y1 * sy),
        int(x2 * sx),
        int(y2 * sy),
    )


def get_center(screen_w, screen_h):
    left = LEFT_OFFSET * (screen_w / BASE_WIDTH)
    right = RIGHT_OFFSET * (screen_w / BASE_WIDTH)
    top = TOP_OFFSET * (screen_h / BASE_HEIGHT)
    bottom = BOTTOM_OFFSET * (screen_h / BASE_HEIGHT)
    return (
        0.5 * (screen_w - left - right) + left,
        0.5 * (screen_h - top - bottom) + top,
    )
