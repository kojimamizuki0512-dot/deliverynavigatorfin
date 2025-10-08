def make_daily_route():
    # シンプルなダミー座標列
    pts = []
    lat, lng = 35.6804, 139.7690
    for i in range(10):
        pts.append({"lat": lat + i * 0.001, "lng": lng + i * 0.001, "step": i})
    return {"points": pts, "note": "AIおすすめ（ダミー）"}

def make_daily_summary(goal=12000):
    return {
        "goal": goal,
        "today_distance_m": 8200,
        "earnings_yen": 8600,
        "work_hours_h": 6.5,
        "progress_pct": 68
    }

def make_heatmap_points():
    base = 35.68, 139.76
    pts = [{"lat": base[0] + i*0.002, "lng": base[1] - i*0.001, "weight": (i % 5) + 1} for i in range(30)]
    return pts

def make_weekly_forecast():
    days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    return [{"day": d, "expected_yen": 8000 + i*600} for i, d in enumerate(days)]
