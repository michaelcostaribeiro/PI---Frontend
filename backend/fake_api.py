from datetime import date, timedelta
import random
from typing import Any


MANUFACTURERS = ["Nuvem Tech", "Casa Nova", "Lumina", "Prático", "Viva Shop"]


def generate_product_data(name: str, price: float, image_url: str | None) -> dict[str, Any]:
    normalized_name = name.strip()
    commission = round(random.uniform(5, 25), 2)
    return {
        "name": normalized_name,
        "manufacturer": random.choice(MANUFACTURERS),
        "price": round(price, 2),
        "image_url": image_url
        or f"https://placehold.co/400?text={normalized_name.replace(' ', '+')}",
        "commission": commission,
        "metrics": generate_metrics(price, commission),
    }


def generate_metrics(price: float, commission: float) -> list[dict[str, Any]]:
    metrics = []
    for day_offset in range(7):
        views = random.randint(1000, 50000)
        clicks = random.randint(100, max(100, views // 5))
        sales = random.randint(0, max(1, clicks // 100))
        metrics.append(
            {
                "date": date(2026, 8, 10) + timedelta(days=day_offset),
                "views": views,
                "clicks": clicks,
                "sold": sales,
                "commission": round(sales * price * commission / 100, 2),
            }
        )
    return metrics
