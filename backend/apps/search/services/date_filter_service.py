"""
FR-12: Time-based search.
Parses natural phrases (from the frontend's date filter dropdown) into a
(start_date, end_date) range used to filter results by upload date.
"""
from datetime import datetime, timedelta
from django.utils import timezone

MONTH_NAMES = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
]


def parse_date_filter(value: str):
    """
    Returns (start, end) datetimes, or None if value is empty/unrecognized
    (meaning: no date filtering should be applied).
    """
    if not value:
        return None

    value = value.strip().lower().replace(" ", "_")
    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    if value == "today":
        return today_start, now

    if value == "yesterday":
        start = today_start - timedelta(days=1)
        return start, today_start

    if value == "last_week":
        start = today_start - timedelta(days=7)
        return start, now

    if value == "last_month":
        start = today_start - timedelta(days=30)
        return start, now

    if value == "last_year":
        start = today_start - timedelta(days=365)
        return start, now

    # "4_months_ago", "2_months_ago", etc.
    if value.endswith("_months_ago"):
        try:
            n = int(value.split("_")[0])
            approx_start = today_start - timedelta(days=30 * n)
            approx_end = today_start - timedelta(days=30 * (n - 1)) if n > 1 else now
            return approx_start, approx_end
        except ValueError:
            pass

    # A specific month name, e.g. "april" -> most recent April
    if value in MONTH_NAMES:
        month_num = MONTH_NAMES.index(value) + 1
        year = now.year
        if month_num > now.month:
            year -= 1
        start = datetime(year, month_num, 1, tzinfo=now.tzinfo)
        end_month = month_num + 1
        end_year = year
        if end_month > 12:
            end_month = 1
            end_year += 1
        end = datetime(end_year, end_month, 1, tzinfo=now.tzinfo)
        return start, end

    return None