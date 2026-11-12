function legacyEnd(studyPeriod) {
    if (typeof studyPeriod !== 'string') return null;
    const match = studyPeriod.trim().match(/^(?:[a-z]+\s+)?\d{4}\s*[-–]\s*(present|\d{4})$/i);
    return match ? match[1].toLowerCase() : null;
}

export function isOngoingEducation(item) {
    if (typeof item.isOngoing === 'boolean') return item.isOngoing;
    return !item.completion && legacyEnd(item.studyPeriod) === 'present';
}

function endTime(item) {
    if (item.completion) {
        const time = Date.parse(item.completion);
        return Number.isNaN(time) ? null : time;
    }
    const end = legacyEnd(item.studyPeriod);
    return end && end !== 'present' ? Date.parse(`${end}-01-01T00:00:00Z`) : null;
}

export function sortEducation(items) {
    return [...items].sort((a, b) => {
        const ongoingA = isOngoingEducation(a);
        const ongoingB = isOngoingEducation(b);
        if (ongoingA !== ongoingB) return ongoingA ? -1 : 1;
        const endA = endTime(a);
        const endB = endTime(b);
        if (endA === null && endB === null) return 0;
        if (endA === null) return 1;
        if (endB === null) return -1;
        return endB - endA;
    });
}
