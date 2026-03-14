from __future__ import annotations

from math import ceil


def get_offset(page: int, page_size: int) -> int:
    return max(page - 1, 0) * page_size


from typing import Dict, Union

def build_pagination(total: int, page: int, page_size: int) -> Dict[str, Union[int, bool]]:
    total_pages = ceil(total / page_size) if total > 0 else 1
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1,
    }
