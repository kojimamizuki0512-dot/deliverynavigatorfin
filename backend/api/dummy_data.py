from datetime import datetime, timedelta
import random

# 渋谷周辺アンカー（左上UIの文脈）
ANCHORS = [
    (35.6595,139.7005,"Dogenzaka cluster"),
    (35.6478,139.7094,"Ebisu"),
    (35.6660,139.7136,"Daikanyama"),
    (35.6467,139.7090,"Hiroo"),
    (35.6520,139.7140,"Shibuya East")
]
RESTAURANTS = [
    "Uobei Sushi","Green Bowl","Curry Gold","Ramen Hachi","Burger Base",
    "Tempura Hana","Cafe Clover","Udon Mori","Yakitori Gen","Pizza Aoi"
]

def _restaurants(n=3):
    items = random.sample(RESTAURANTS, k=min(n, len(RESTAURANTS)))
    return [{"name": r, "rating": round(random.uniform(3.6,4.8),1)} for r in items]

def heatmap_points():
    random.seed(42)
    pts = []
    for _ in range(80):
        lat0,lng0,_ = random.choice(ANCHORS)
        pts.append({
            "lat": lat0 + random.uniform(-0.012,0.012),
            "lng": lng0 + random.uniform(-0.012,0.012),
            "intensity": round(random.uniform(0.25,1.0),2),
            "popular_restaurants": _restaurants(random.randint(2,4))
        })
    return pts

def daily_route():
    now = datetime.now().replace(second=0, microsecond=0)
    # 30分刻みタイムライン & アイコン
    steps = [
        ("bag","Stay in Dogenzaka cluster"),
        ("pin","Reposition to Ebisu"),
        ("flash","Peak around station"),
        ("bag","Wait near hotspot"),
        ("pin","Shift to East Gate"),
        ("flash","Peak around station"),
    ]
    timeline = []
    start0 = now.replace(minute=0)
    for i,(icon,label) in enumerate(steps):
        s = start0 + timedelta(minutes=30*i)
        e = s + timedelta(minutes=30)
        timeline.append({"start": s.strftime("%H:%M"), "end": e.strftime("%H:%M"), "action": label, "icon": icon})
    return {
        "date": now.strftime("%Y-%m-%d"),
        "recommended_area": "Dogenzaka",
        "predicted_daily_earnings": random.randint(11000,14000),
        "timeline": timeline
    }

def daily_summary(goal=12000):
    hours = round(random.uniform(3.5,6.0),1)
    jobs = random.randint(8,16)
    revenue = random.randint(6000,14000)
    progress = min(100, int(revenue/max(goal,1)*100))
    return {
        "goal": goal, "revenue": revenue, "jobs": jobs,
        "hours": hours, "avg_hourly": int(revenue/max(hours,0.1)),
        "progress_percent": progress
    }

def weekly_forecast():
    today = datetime.now()
    days = []
    for i in range(7):
        d = today + timedelta(days=i)
        days.append({
            "date": d.strftime("%Y-%m-%d"),
            "weekday": "月火水木金土日"[d.weekday()],
            "weather": random.choice(["sunny","cloudy","rainy"]),
            "demand_level": random.randint(1,5)
        })
    return {"days": days}
