export function calculateBauranEnergi(category: string, kapasitas: number | string | null | undefined): number | null {
    if (kapasitas === null || kapasitas === undefined || kapasitas === '') {
        return null;
    }

    const k = Number(kapasitas);
    if (Number.isNaN(k)) {
        return null;
    }

    let result: number | null = null;

    if (category === 'biogas') {
        result = 0.9 * ((k * 0.7 * 35) * 0.0063);
    } else if (category === 'plts') {
        result = ((k * 0.2 * (8760 / 1000)) / (0.13 * 0.613 * 1000)) * 0.9;
    } else if (category === 'pats') {
        result = (((k * 760) * 0.2 * (8760 / 1000)) / (0.13 * 0.613 * 1000)) * 0.9;
    }

    return result !== null ? Math.round(result * 1_000_000) / 1_000_000 : null;
}
