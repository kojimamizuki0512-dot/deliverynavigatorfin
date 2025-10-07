# backend/api/dummy_data.py
from __future__ import annotations
from datetime import datetime, timedelta

# 30分刻みのタイムラインを返す
def make_daily_route() -> dict:
    now = datetime.now().replace(second=0, microsecond=0)
    base = now.replace(minute=0)
    labels = [
        "Stay in Dogenzaka cluster",
        "Reposition to Ebisu",
        "Peak around station",
        "Wait near hotspot",
        "Shift to East Gate",
        "Peak around station",
    ]
    icons = ["pin", "move", "bolt", "pause", "move", "bolt"]
    timeline = []
    for i, (label, icon) in enumerate(zip(labels, icons)):
        t = base + timedelta(minutes=30 * (i + 1))
        timeline.append({"time": t.strftime("%H:%M"), "label": label, "icon": icon})
    return {
        "recommended_area": "Shibuya",
        "predicted_income": 13889,  # ¥表記はフロント側
        "timeline": timeline,
    }

# 日次サマリー（目標額に対する進捗も返す）
def make_daily_summary(goal: int = 12000) -> dict:
    total = 9868
    hours = 4.2
    count = 16
    avg_hourly = round(total / hours, 1)
    progress = min(100, int(total / goal * 100)) if goal else 0
    return {
        "total": total,
        "count": count,
        "avg_hourly": avg_hourly,
        "hours": hours,
        "goal": goal,
        "progress": progress,
    }

# ヒートマップ用ポイント
def make_heatmap_points() -> dict:
    points = [
        {
            "lat": 35.659, "lng": 139.700, "intensity": 0.9,
            "top_restaurants": ["Ichiran", "Uobei", "Afuri"],
        },
        {
            "lat": 35.647, "lng": 139.709, "intensity": 0.7,
            "top_restaurants": ["Shake Shack", "Burger Mania"],
        },
        {
            "lat": 35.667, "lng": 139.706, "intensity": 0.6,
            "top_restaurants": ["Torikizoku", "Hidakaya"],
        },
    ]
    return {"points": points}

# 週間予測（天気＋需要）
def make_weekly_forecast() -> dict:
    today = datetime.now()
    days = []
    for i in range(7):
        d = today + timedelta(days=i)
        days.append({
            "date": d.strftime("%Y-%m-%d"),
            "weekday": d.strftime("%a"),
            "weather": "Clouds" if i % 3 else "Rain",
            "demand_level": "high" if i % 2 == 0 else "mid",
        })
    return {"days": days}
