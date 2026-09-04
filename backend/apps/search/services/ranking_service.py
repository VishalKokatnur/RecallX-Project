"""
FR-14: Convert distance -> similarity score and rank results.
"""


def to_similarity_score(distance: float) -> float:
    """Cosine distance -> similarity percentage (0-1)."""
    return max(0.0, 1.0 - distance)


def rank_results(results_with_distance):
    scored = [
        {"chunk": chunk, "similarity_score": to_similarity_score(dist)}
        for chunk, dist in results_with_distance
    ]
    return sorted(scored, key=lambda r: r["similarity_score"], reverse=True)
