const DATE_TIME_SEPARATOR = " "

function parseDateParts(raw: string) {
  const [datePart, timePart] = raw.split(DATE_TIME_SEPARATOR)
  const parts = datePart?.split("-") ?? []

  if (parts.length !== 3) {
    return null
  }

  const [first, second, third] = parts

  if (first.length === 4) {
    // Already in YYYY-MM-DD
    return {
      isoDate: `${first}-${second}-${third}`,
      timePart,
    }
  }

  if (third.length === 4) {
    // Convert from DD-MM-YYYY to YYYY-MM-DD
    return {
      isoDate: `${third}-${second}-${first}`,
      timePart,
    }
  }

  return null
}

export function parseOrderDate(raw: string | null): Date | null {
  if (!raw) {
    return null
  }

  const parsedParts = parseDateParts(raw)

  if (parsedParts) {
    const isoDateTime = parsedParts.timePart
      ? `${parsedParts.isoDate}T${parsedParts.timePart}`
      : parsedParts.isoDate

    const parsed = new Date(isoDateTime)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  const fallback = new Date(raw)
  if (!Number.isNaN(fallback.getTime())) {
    return fallback
  }

  return null
}

export function formatOrderDate(raw: string | null): string {
  if (!raw) {
    return "Unknown date"
  }

  const parsed = parseOrderDate(raw)

  if (!parsed) {
    return raw
  }

  return parsed.toLocaleString("da-DK", {
    dateStyle: "medium",
    timeStyle: raw.includes(DATE_TIME_SEPARATOR) ? "short" : undefined,
  })
}
