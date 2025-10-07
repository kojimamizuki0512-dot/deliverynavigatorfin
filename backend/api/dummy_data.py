# 画面用のダミーデータ（以前 ImportError になっていたので関数を定義し直す）

def make_daily_route():
    # カード状のAI提案ルート（簡易ダミー）
    return {
        "cards_total": 3,
        "current_index": 1,
        "items": [
            {"time": "16:00", "icon": "pin", "text": "Stay in Dogenzaka cluster"},
            {"time": "16:30", "icon": "bolt", "text": "Reposition to Ebisu"},
            {"time": "17:00", "icon": "radar", "text": "Peak around station"},
            {"time": "17:30", "icon": "clock", "text": "Wait near hotspot"},
            {"time": "18:00", "icon": "pin", "text": "Shift to East Gate"},
            {"time": "18:30", "icon": "radar", "text": "Peak around station"},
        ],
        "estimated_income": 13781,
    }

def make_daily_summary(goal):
    return {
        "goal": goal,
        "earned": 10168,
        "per_hour": 2163,
        "hours": 4.7,
        "progress_pct": 84,
    }

def make_heatmap_points():
    return {
        "points": [
            {"lat": 35.6581, "lng": 139.7017, "weight": 0.9},
            {"lat": 35.6478, "lng": 139.7094, "weight": 0.8},
            {"lat": 35.6422, "lng": 139.6995, "weight": 0.6},
        ]
    }

def make_weekly_forecast():
    return {
        "days": [
            {"d": "Mon", "demand": 0.6}, {"d": "Tue", "demand": 0.7},
            {"d": "Wed", "demand": 0.8}, {"d": "Thu", "demand": 0.7},
            {"d": "Fri", "demand": 0.9}, {"d": "Sat", "demand": 1.0},
            {"d": "Sun", "demand": 0.8},
        ]
    }
