export function levenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

export function fuzzyMatch(query, targets, threshold = 2) {
    if (!query) return targets;

    const lowerQuery = query.toLowerCase();

    return targets.filter(target => {
        // Check specific fields like name or location
        const nameDistance = levenshteinDistance(lowerQuery, target.name.toLowerCase());
        const locationDistance = levenshteinDistance(lowerQuery, target.location.toLowerCase());

        // Also include exact substring matches for better UX
        const includesName = target.name.toLowerCase().includes(lowerQuery);
        const includesLocation = target.location.toLowerCase().includes(lowerQuery);

        return nameDistance <= threshold || locationDistance <= threshold || includesName || includesLocation;
    });
}
