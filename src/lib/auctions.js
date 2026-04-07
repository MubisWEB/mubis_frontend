const ENDED_STATUSES = new Set(['ENDED', 'COMPLETED']);
const CANCELLED_STATUSES = new Set(['CANCELLED']);

export function normalizeWonAuction(auction) {
  const normalizedStatus = auction?.status?.toUpperCase?.() || '';
  const endsAt = auction?.ends_at || auction?.auction_end || auction?.completionDeadline || null;
  const extensionDays = Number(auction?.extensionDays || 0);
  const baseEndTime = endsAt ? new Date(endsAt).getTime() : 0;
  const extensionMs = extensionDays * 24 * 60 * 60 * 1000;
  const effectiveEndTime = baseEndTime + extensionMs;
  const remaining = effectiveEndTime ? effectiveEndTime - Date.now() : 0;
  const isCompleted = ENDED_STATUSES.has(normalizedStatus);
  const isCancelled = CANCELLED_STATUSES.has(normalizedStatus);

  return {
    ...auction,
    status: normalizedStatus || auction?.status,
    current_bid: Number(
      auction?.current_bid ??
      auction?.currentPrice ??
      auction?.winningBid ??
      auction?.finalPrice ??
      0,
    ),
    ends_at: endsAt,
    extensionDays,
    remaining,
    isCompleted,
    isCancelled,
    canExtend: !isCompleted && !isCancelled && remaining <= 0,
  };
}

export function sortWonAuctions(auctions, sortBy) {
  const list = [...auctions];

  if (sortBy === 'price_high') {
    return list.sort((a, b) => (b.current_bid || 0) - (a.current_bid || 0));
  }

  if (sortBy === 'price_low') {
    return list.sort((a, b) => (a.current_bid || 0) - (b.current_bid || 0));
  }

  return list.sort((a, b) => {
    const aDate = new Date(a.ends_at || a.createdAt || 0).getTime();
    const bDate = new Date(b.ends_at || b.createdAt || 0).getTime();
    return bDate - aDate;
  });
}
