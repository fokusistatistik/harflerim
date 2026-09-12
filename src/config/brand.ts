export const APP_NAME = 'Papatya';

/// Turkish possessive suffix depends on whether the final vowel is front or back,
/// and whether the name ends in a vowel: Melike -> "Melike'nin", Emre -> "Emre'nin",
/// Zeynep -> "Zeynep'in", Kuzu -> "Kuzu'nun".
export function possessive(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) return '';

    const lower = trimmed.toLocaleLowerCase('tr-TR');
    const vowels = 'aeıioöuü';
    const lastVowel = [...lower].reverse().find((c) => vowels.includes(c));
    if (!lastVowel) return `${trimmed}'in`;

    const endsWithVowel = vowels.includes(lower[lower.length - 1]);
    const suffix = { a: 'ın', ı: 'ın', o: 'un', u: 'un', e: 'in', i: 'in', ö: 'ün', ü: 'ün' }[lastVowel]!;

    return `${trimmed}'${endsWithVowel ? 'n' : ''}${suffix}`;
}

export function worldName(firstName: string): string {
    return `${possessive(firstName)} Dünyası`;
}
